import { usePublicClient } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { useStvSteth } from '@/modules/defi-wrapper';
import { readWithReport, useVault, getLidoV3Contract } from '@/modules/vaults';
import { useDappStatus, useLidoSDK } from '@/modules/web3';
import { minBN } from '@/utils/bn';

export const useAvailableMint = () => {
  const { address, chainId } = useDappStatus();
  const publicClient = usePublicClient();
  const { shares } = useLidoSDK();
  const { activeVault } = useVault();
  const { wrapper, dashboard } = useStvSteth();

  const query = useQuery({
    queryKey: ['wrapper', 'available-mint', { address, chainId }],
    enabled: !!address && !!wrapper && !!dashboard,
    queryFn: async () => {
      invariant(address, 'Wallet not connected');
      invariant(wrapper, 'Wrapper is not defined');
      invariant(dashboard, 'Dashboard is not defined');

      const lidoV3 = getLidoV3Contract(publicClient);

      const [
        totalMintedStethShares,
        remainingMintableVaultShares,
        remainingMintableUserShares,
      ] = await readWithReport({
        publicClient,
        report: activeVault?.report,
        contracts: [
          wrapper.prepare.totalMintingCapacitySharesOf([address]),
          dashboard.prepare.remainingMintingCapacityShares([0n]),
          wrapper.prepare.remainingMintingCapacitySharesOf([address, 0n]),
        ],
      });

      const [maxMintableExternalShares, currentMintedExternalShares] =
        await Promise.all([
          lidoV3.read.getMaxMintableExternalShares(),
          lidoV3.read.getExternalShares(),
        ]);

      const mintableShares = minBN(
        minBN(
          remainingMintableVaultShares,
          maxMintableExternalShares - currentMintedExternalShares,
        ),
        remainingMintableUserShares,
      );

      const [totalMintedSteth, mintableSteth] = await Promise.all([
        shares.convertToSteth(totalMintedStethShares),
        shares.convertToSteth(mintableShares),
      ]);

      const isSustainableMint = mintableSteth > 10000n;

      const isEmpty = totalMintedSteth === 0n && !isSustainableMint;

      return {
        totalMintedSteth,
        mintableSteth,
        totalMintedStethShares,
        mintableShares,
        isSustainableMint,
        isEmpty,
      };
    },
  });

  return {
    totalMintedSteth: query?.data?.totalMintedSteth,
    mintableSteth: query?.data?.mintableSteth,
    totalMintedStethShares: query?.data?.totalMintedStethShares,
    mintableShares: query?.data?.mintableShares,
    isEmpty: query?.data?.isEmpty,
    isSustainableMint: query?.data?.isSustainableMint,
    ...query,
  };
};
