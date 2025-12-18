/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Address, Hash } from 'viem';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { mainnet } from 'viem/chains';
import { getApiURL } from '@/config';
import { useLidoSDK } from '@/modules/web3';
import { useGGVStrategy } from './use-ggv-strategy';
import { fetchPendingWithdrawalRequestsFromMock } from '../utils';

type Cancellation = {
  block_number: string;
  timestamp: string;
  transaction_hash: string;
};

type Fulfillment = {
  block_number: string;
  timestamp: string;
  transaction_hash: string;
};

type RequestMetadata = {
  amountOfAssets: string;
  amountOfShares: string;
  assetOut: Address;
  creationTime: string;
  nonce: string;
  secondsToDeadline: string;
  secondsToMaturity: string;
  user: Address;
};

type Request = {
  amount: string;
  blockNumber: string;
  metadata: RequestMetadata;
  offerToken: string;
  timestamp: string;
  transaction_hash: string;
  user: string;
  wantToken: string;
  wantTokenDecimals: string;
  wantTokenSymbol: string;
};

type WQApiResponse = {
  Response: {
    cancelled_requests: {
      Cancellation: Cancellation;
      Request: Request;
    }[];
    expired_requests: Request[];
    fulfilled_requests: {
      Fulfillment: Fulfillment;
      Request: Request;
    }[];
    open_requests: Request[];
  };
};

export type GGVWithdrawalRequestsResponse = ReturnType<
  typeof transformAPIResponse
>;

export type GGVWithdrawalRequestMetatadata = ReturnType<
  typeof transformAPIResponse
>['openRequests'][number]['metadata'];

const transformAPIResponse = (response: WQApiResponse) => {
  const transformRequest = (
    request: WQApiResponse['Response']['open_requests'][number],
  ) => ({
    ...request,
    amount: BigInt(request.amount),
    blockNumber: BigInt(request.blockNumber),
    offerToken: request.offerToken as Address,
    timestamp: BigInt(request.timestamp),
    transaction_hash: request.transaction_hash as Hash,
    user: request.user as Address,
    wantToken: request.wantToken as Address,
    wantTokenDecimals: BigInt(request.wantTokenDecimals),
    metadata: {
      nonce: BigInt(request.metadata.nonce),
      user: request.metadata.user as Address,
      assetOut: request.metadata.assetOut as Address,
      amountOfAssets: BigInt(request.metadata.amountOfAssets),
      amountOfShares: BigInt(request.metadata.amountOfShares),
      creationTime: Number(request.metadata.creationTime),
      secondsToDeadline: Number(request.metadata.secondsToDeadline),
      secondsToMaturity: Number(request.metadata.secondsToMaturity),
    },
  });

  return {
    openRequests: response.Response.open_requests.map(transformRequest),
    fulfilledRequests: response.Response.fulfilled_requests
      .map(({ Fulfillment, Request }) => ({
        request: transformRequest(Request),
        fulfillment: {
          block_number: BigInt(Fulfillment.block_number),
          timestamp: BigInt(Fulfillment.timestamp),
          transaction_hash: Fulfillment.transaction_hash as Hash,
        },
      }))
      .sort(
        (a, b) => Number(b.request.timestamp) - Number(a.request.timestamp),
      ),
    expiredRequests: response.Response.expired_requests.map(transformRequest),
    canceledRequests: response.Response.cancelled_requests.map(
      ({ Cancellation, Request }) => ({
        cancellation: {
          block_number: BigInt(Cancellation.block_number),
          timestamp: BigInt(Cancellation.timestamp),
          transaction_hash: Cancellation.transaction_hash as Hash,
        },
        request: transformRequest(Request),
      }),
    ),
  };
};

export const useGGVWithdrawalRequests = () => {
  const { publicClient, shares } = useLidoSDK();
  const { data: ggvStrategy } = useGGVStrategy();

  return useQuery({
    queryKey: [
      'ggv',
      'withdrawal-requests',
      { address: ggvStrategy?.strategyProxyAddress },
    ] as const,
    enabled: !!ggvStrategy?.strategyProxyAddress,
    queryFn: async ({ queryKey }) => {
      invariant(ggvStrategy, 'ggvStrategy is required');
      const address = queryKey[2].address;
      invariant(address, 'ggvStrategy is required');

      let requests: ReturnType<typeof transformAPIResponse>;

      // For non-mainnet chains, fetch from mock contract,only pending requests
      if (publicClient.chain?.id !== mainnet.id) {
        requests = await fetchPendingWithdrawalRequestsFromMock(
          publicClient,
          ggvStrategy.ggvQueue.address,
          address,
        );
      } else {
        const ggvApi = getApiURL(publicClient.chain.id, 'ggvApi');
        invariant(
          ggvApi,
          `GGV API URL is not defined for this network ${publicClient.chain.id}`,
        );
        const url = `${ggvApi}/boringQueue/ethereum/${ggvStrategy.ggvVault.address}/${address}?string_values=true`;
        const response: WQApiResponse = await fetch(url).then((res) =>
          res.json(),
        );
        requests = transformAPIResponse(response);
      }

      // We must account for all pending/expired requests to calculate steth shares
      // exprired requests are still locking steth shares until canceled
      const totalStethSharesInRequests =
        requests.openRequests.reduce(
          (acc, req) => acc + req.metadata.amountOfAssets,
          0n,
        ) +
        requests.expiredRequests.reduce(
          (acc, req) => acc + req.metadata.amountOfAssets,
          0n,
        );

      const totalStethInRequests = await shares.convertToSteth(
        totalStethSharesInRequests,
      );

      return {
        requests,
        hasActiveRequests:
          requests.openRequests.length > 0 ||
          requests.expiredRequests.length > 0,
        totalStethSharesInRequests,
        totalStethInRequests,
      };
    },
  });
};
