import { useMemo } from 'react';
import { getContract, Address, GetContractReturnType } from 'viem';
import { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';

import { AggregatorAbi, AggregatorAbiType } from '@/abi/aggregator-abi';
import { getContractAddress } from '@/config';
import { STRATEGY_LAZY } from '@/consts/react-query-strategies';
import { bnAmountToNumber } from '@/utils/bn';

import { useMainnetOnlyWagmi } from '../web3-provider';

const ETH_DECIMALS = 18n;

const getAggregatorContract = (
  publicClient: ReturnType<typeof useMainnetOnlyWagmi>['publicClientMainnet'],
): GetContractReturnType<AggregatorAbiType, typeof publicClient> => {
  return getContract({
    address: getContractAddress(
      CHAINS.Mainnet,
      'aggregatorEthUsdPriceFeed',
    ) as Address,
    abi: AggregatorAbi,
    client: {
      public: publicClient,
    },
  }) satisfies GetContractReturnType<AggregatorAbiType, typeof publicClient>;
};

export const useEthUsd = (amount?: bigint | null) => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();

  const {
    data: price,
    error,
    isLoading,
    refetch,
    isFetching,
    isPending,
  } = useQuery({
    queryKey: ['eth-usd-price', publicClientMainnet],
    enabled: !!publicClientMainnet,
    ...STRATEGY_LAZY,
    // the async is needed here because the decimals will be requested soon
    queryFn: async () => {
      invariant(
        publicClientMainnet,
        '[useEthUsd] The "publicClientMainnet" must be define',
      );

      const contract = getAggregatorContract(publicClientMainnet);

      const [latestAnswer, decimals] = await Promise.all([
        contract.read.latestAnswer(),
        contract.read.decimals(),
      ]);

      return {
        latestAnswer,
        decimals: BigInt(decimals),
      };
    },
  });

  const usdAmount = useMemo(() => {
    // shortcut
    if (amount == 0n) return 0;

    if (price && amount) {
      return bnAmountToNumber(
        amount * price.latestAnswer,
        Number(price.decimals + ETH_DECIMALS),
      );
    }

    return undefined;
  }, [amount, price]);

  return {
    usdAmount,
    price,
    isLoading,
    isPending,
    error,
    isFetching,
    update: refetch,
  };
};
