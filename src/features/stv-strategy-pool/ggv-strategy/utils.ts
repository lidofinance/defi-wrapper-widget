import {
  Address,
  encodeAbiParameters,
  getContract,
  GetContractReturnType,
  isAddressEqual,
  keccak256,
  maxUint24,
  zeroAddress,
} from 'viem';
import { RegisteredPublicClient } from '@/modules/web3';
import {
  GgvMockQueueAbi,
  GgvMockQueueAbiType,
} from './contracts/abi/ggv-mock-queue-abi';

type GGVParams = {
  discount: number; // - only for Withdrawals
  minimumMint: number; // - of GGV shares, can be zero
  secondsToDeadline: number; // secondsToDeadline - only for Withdrawals
};

export const encodeGGVWithdrawalParams = (
  params: Pick<GGVParams, 'discount' | 'secondsToDeadline'>,
) => {
  return encodeAbiParameters(
    [
      { name: 'discount', type: 'uint16' }, // - only for Withdrawals
      { name: 'secondsToDeadline', type: 'uint24' }, // secondsToDeadline - only for Withdrawals
    ],
    [params.discount, params.secondsToDeadline],
  );
};

export const encodeGGVDepositParams = (
  params: Pick<GGVParams, 'minimumMint'>,
) => {
  return encodeAbiParameters(
    [
      { name: 'minimumMint', type: 'uint16' }, // - of GGV shares, can be zero
    ],
    [params.minimumMint],
  );
};

export const MAX_REQUEST_DEADLINE = Number(maxUint24);

type GGVMockRequest = {
  amount: bigint;
  blockNumber: bigint;
  offerToken: Address;
  timestamp: bigint;
  transaction_hash: Address;
  user: Address;
  wantToken: Address;
  wantTokenDecimals: bigint;
  metadata: {
    nonce: bigint;
    user: Address;
    assetOut: Address;
    amountOfAssets: bigint;
    amountOfShares: bigint;
    creationTime: number;
    secondsToDeadline: number;
    secondsToMaturity: number;
  };
  wantTokenSymbol: string;
};

type GGVWithdrawalMockResponse = {
  openRequests: GGVMockRequest[];
  fulfilledRequests: [];
  expiredRequests: GGVMockRequest[];
  canceledRequests: [];
};

export const fetchPendingWithdrawalRequestsFromMock = async (
  publicClient: RegisteredPublicClient,
  mockBoringQueue: Address,
  strategyProxyAddress: Address,
) => {
  const mockQueue = getContract({
    address: mockBoringQueue,
    abi: GgvMockQueueAbi,
    client: publicClient,
  }) as GetContractReturnType<GgvMockQueueAbiType, RegisteredPublicClient>;

  type MockStoredRequestType = Awaited<
    ReturnType<(typeof mockQueue)['read']['mockGetRequestById']>
  >;

  const requestsPending: MockStoredRequestType[] = [];
  const requestsExpired: MockStoredRequestType[] = [];

  const allRequestsIds = await mockQueue.read.getRequestIds();
  const timeNow = Math.floor(Date.now() / 1000);
  for (const requestId of allRequestsIds) {
    const request = await mockQueue.read.mockGetRequestById([requestId]);
    if (isAddressEqual(request.user, strategyProxyAddress)) {
      if (request.creationTime + request.secondsToDeadline < timeNow) {
        requestsExpired.push(request);
      } else requestsPending.push(request);
    }
  }

  const toGGVReposnse = (request: MockStoredRequestType) => ({
    amount: request.amountOfAssets,
    blockNumber: 0n,
    offerToken: zeroAddress,
    timestamp: BigInt(request.creationTime),
    transaction_hash: keccak256(
      `0x${request.nonce.toString(16).padStart(64, '0')}`,
    ),
    user: request.user,
    wantToken: request.assetOut,
    wantTokenDecimals: 18n,
    wantTokenSymbol: 'wstETH',
    metadata: {
      nonce: request.nonce,
      user: request.user,
      assetOut: request.assetOut,
      amountOfAssets: request.amountOfAssets,
      amountOfShares: request.amountOfShares,
      creationTime: request.creationTime,
      secondsToDeadline: request.secondsToDeadline,
      secondsToMaturity: request.secondsToMaturity,
    },
  });

  const response: GGVWithdrawalMockResponse = {
    openRequests: requestsPending.map(toGGVReposnse),
    fulfilledRequests: [],
    expiredRequests: requestsExpired.map(toGGVReposnse),
    canceledRequests: [],
  };

  return response;
};
