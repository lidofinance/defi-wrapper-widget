import { usePublicClient } from 'wagmi';
import { invariant } from '@lidofinance/lido-ethereum-sdk';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { getApiURL } from '@/config';
import { useEarnStrategy } from './use-earn-strategy';

const MELLOW_APY_SCHEMA = z.object({
  apy: z.union([z.number(), z.string()]).pipe(z.coerce.number()),
});
export type MellowApyFetchedData = z.infer<typeof MELLOW_APY_SCHEMA>;

export const useEarnApy = () => {
  const publicClient = usePublicClient();
  const { data: strategyData } = useEarnStrategy();

  return useQuery({
    queryKey: ['earnApy', { chain: publicClient.chain.id }],
    enabled: !!strategyData,
    queryFn: async () => {
      const apiUrl = getApiURL(publicClient.chain.id, 'mellowApi');
      invariant(apiUrl, `no api url for chain ${publicClient.chain.id}`);
      invariant(strategyData, 'no strategy data');
      // sub for testnets
      const vaultAddress =
        publicClient.chain.id !== 1
          ? '0x277C6A642564A91ff78b008022D65683cEE5CCC5'
          : strategyData.earnVault;

      const path = `${apiUrl}/v1/chain/1/core-vaults/${vaultAddress}/apy`;
      const response = await fetch(path);
      const data = await response.json();

      return MELLOW_APY_SCHEMA.parse(data);
    },
  });
};
