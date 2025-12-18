import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { useStvSteth } from '@/modules/defi-wrapper';
import { readWithReport, useVault } from '@/modules/vaults';
import { useDappStatus, useLidoSDK } from '@/modules/web3';
import { minBN } from '@/utils/bn';

export const useMaximumAvailableRepay = () => {
  const { publicClient } = useLidoSDK();
  const { address } = useDappStatus();
  const { activeVault, queryKeys } = useVault();
  const { shares, wstETH } = useLidoSDK();
  const { wrapper } = useStvSteth();

  const query = useQuery({
    queryKey: ['wrapper', queryKeys.state, 'maximum-repay', { address }],
    enabled: !!wrapper && !!activeVault && !!address,
    queryFn: async () => {
      invariant(
        activeVault,
        '[useMaximumAvailableRepay] activeVault is required',
      );
      invariant(address, '[useMaximumAvailableRepay] address is required');

      const [wstethAmount, stethShares, mintedStethSharesOf] =
        await Promise.all([
          wstETH.balance(address),
          shares.balance(address),
          wrapper.read.mintedStethSharesOf([address]),
        ]);

      const maxRepayableStethShares = minBN(stethShares, mintedStethSharesOf);

      // doing the trick to deduct 1wei lost on conversion in contract
      let maxRepayableWsteth = await shares.convertToSteth(
        await shares.convertToSteth(wstethAmount),
      );
      maxRepayableWsteth = minBN(maxRepayableWsteth, mintedStethSharesOf);

      const [
        withdrawalbeEthNoRebalanceSteth,
        withdrawalbeEthNoRebalanceWsteth,
      ] = await readWithReport({
        publicClient,
        report: activeVault.report,
        contracts: [
          wrapper.prepare.unlockedAssetsOf([address, maxRepayableStethShares]),
          wrapper.prepare.unlockedAssetsOf([address, maxRepayableWsteth]),
        ],
      });

      return {
        maxEthForRepayableSteth: withdrawalbeEthNoRebalanceSteth,
        maxEthForRepayableWSteth: withdrawalbeEthNoRebalanceWsteth,
      };
    },
  });

  return {
    ...query,
    maxEthForRepayableSteth: query.data?.maxEthForRepayableSteth,
    maxEthForRepayableWSteth: query.data?.maxEthForRepayableWSteth,
  };
};
