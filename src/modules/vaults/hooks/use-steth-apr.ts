import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { getApiURL } from '@/config';
import { useLidoSDK } from '@/modules/web3';

type StethAprResponse = {
  data: {
    aprs: {
      timeUnix: number;
      apr: number;
    }[];
    smaApr: number;
  };
  meta: {
    symbol: 'stETH';
    address: '0x3508A952176b3c15387C97BE809eaffB1982176a';
    chainId: 560048;
  };
};

export const useStethApr = () => {
  const { publicClient } = useLidoSDK();

  const query = useQuery({
    queryKey: ['steth', 'apr'],
    queryFn: async () => {
      const ethApiUrl = getApiURL(publicClient.chain.id, 'ethApi');
      invariant(
        ethApiUrl,
        `ETH API URL is not defined for this network ${publicClient.chain.id}`,
      );
      const url = `${ethApiUrl}/v1/protocol/steth/apr/sma`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(
          `[STETH-APR] Failed to fetch data: ${res.status} ${res.statusText}`,
        );
      }
      const data = (await res.json()) as StethAprResponse;
      return {
        smaApr: data.data.smaApr,
        latestApr: data.data.aprs[data.data.aprs.length - 1].apr,
      };
    },
  });

  return {
    ...query,
    isAPRLoading: query.isLoading || query.isPending,
  };
};
