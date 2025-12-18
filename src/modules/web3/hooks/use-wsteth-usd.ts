import type { PublicClient } from 'viem';
import { usePublicClient } from 'wagmi';
import { LidoSDKWrap } from '@lidofinance/lido-ethereum-sdk/wrap';
import { useQuery } from '@tanstack/react-query';
import { useDappStatus } from '@/modules/web3';
import { ONE_wstETH } from '@/modules/web3/untis';

import { useEthUsd } from './use-eth-usd';

export const useWstethUsd = (amountWsteth?: bigint) => {
  const { chainId } = useDappStatus();

  const publicClient = usePublicClient({ chainId });
  const stethQuery = useQuery({
    queryKey: ['wsteth-steth-rate', { chainId }],
    enabled: !!publicClient,
    queryFn: async () => {
      const wrap = new LidoSDKWrap({
        chainId,
        logMode: 'none',
        rpcProvider: publicClient as PublicClient,
      });

      const wstethToStethRate = await wrap.convertWstethToSteth(ONE_wstETH);

      return {
        wstethToStethRate,
        decimals: ONE_wstETH,
      };
    },
    select: ({ wstethToStethRate, decimals }) => {
      if (amountWsteth === undefined) {
        return undefined;
      }
      if (amountWsteth == 0n) {
        return 0n;
      }
      return (amountWsteth * wstethToStethRate) / decimals;
    },
  });

  const usdQuery = useEthUsd(stethQuery.data);

  return {
    usdAmount: usdQuery.usdAmount,
    ethAmount: stethQuery.data,
    isLoading: stethQuery.isLoading || usdQuery.isLoading,
  };
};
