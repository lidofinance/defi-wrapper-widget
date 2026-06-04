import { usePublicClient } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { SUSTAINABLE_MINT_STETH_THRESHOLD } from '@/config';
import { useStvSteth } from '@/modules/defi-wrapper';
import { readWithReport, useVault } from '@/modules/vaults';
import { useDappStatus, useLidoSDK } from '@/modules/web3';
import { minBN } from '@/utils/bn';

export const useAvailableMint = () => {
  const { address, chainId } = useDappStatus();
  const publicClient = usePublicClient();
  const { shares, core } = useLidoSDK();
  const { activeVault } = useVault();
  const { wrapper, dashboard } = useStvSteth();

  const query = useQuery({
    queryKey: ['wrapper', 'available-mint', { address, chainId }],
    enabled: !!address && !!wrapper && !!dashboard,
    queryFn: async () => {
      invariant(address, 'Wallet not connected');
      invariant(wrapper, 'Wrapper is not defined');
      invariant(dashboard, 'Dashboard is not defined');

      const lidoV3 = await core.getLidoContract();

      const [
        totalMintedStethShares,
        remainingMintableVaultShares,
        remainingMintableUserShares,
        maxMintableExternalShares,
        currentMintedExternalShares,
      ] = await readWithReport({
        publicClient,
        report: activeVault?.report,
        contracts: [
          wrapper.prepare.totalMintingCapacitySharesOf([address]),
          dashboard.prepare.remainingMintingCapacityShares([0n]),
          wrapper.prepare.remainingMintingCapacitySharesOf([address, 0n]),
          // not dependant on report but benefit from batch
          lidoV3.prepare.getMaxMintableExternalShares(),
          lidoV3.prepare.getExternalShares(),
        ],
      });

      const mintableShares = minBN(
        remainingMintableVaultShares,
        maxMintableExternalShares - currentMintedExternalShares,
        remainingMintableUserShares,
      );

      const [totalMintedSteth, mintableSteth] = await Promise.all([
        shares.convertToSteth(totalMintedStethShares),
        shares.convertToSteth(mintableShares),
      ]);

      // 0.001 ETH minimum to treat minting as viable
      const isSustainableMint =
        mintableSteth > SUSTAINABLE_MINT_STETH_THRESHOLD;

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
