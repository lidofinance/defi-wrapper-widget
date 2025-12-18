import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { useWrapperBalance } from '@/modules/defi-wrapper';
import { useVault } from '@/modules/vaults';
import { useDappStatus } from '@/modules/web3';
import { maxBN } from '@/utils/bn';
import { useAvailableMint } from '../../vault-status/mint/use-available-mint';
import { useRepayRebalanceRatio } from './use-repay-rebalance-ratio';

export const usePositionAfterWithdrawal = (
  widthdrawalAmountInEth: bigint | null,
) => {
  const { address } = useDappStatus();
  const { activeVault, queryKeys } = useVault();
  const { assets, isBalanceLoading } = useWrapperBalance();
  const { data: availableMintData } = useAvailableMint();
  const { data: repayRatioData } = useRepayRebalanceRatio(
    widthdrawalAmountInEth || 0n,
    'STETH',
  );

  //TODO: unwrap to useMemo
  const query = useQuery({
    queryKey: [
      ...queryKeys.state,
      'position-after-withdrawal',
      {
        address,
        widthdrawalAmountInEth: (widthdrawalAmountInEth || 0n).toString(),
      },
    ],
    enabled:
      !!activeVault &&
      !!address &&
      !!availableMintData &&
      !isBalanceLoading &&
      !!repayRatioData,
    queryFn: async () => {
      invariant(activeVault, '[useRepayStaticData] Active vault is required');
      invariant(address, '[useRepayStaticData] Address is required');
      invariant(
        repayRatioData,
        '[useRepayStaticData] RepayRatioData is required',
      );
      invariant(assets, '[useRepayStaticData] Assets is required');
      invariant(
        availableMintData,
        '[useRepayStaticData] Mint data is required',
      );

      const { totalMintedSteth } = availableMintData;
      const { repayableSteth, rebalanceableSteth } = repayRatioData;

      // allowing UI to render like user inputed 0 if input is empty
      const vaultBalanceETHAfter = maxBN(
        assets - (widthdrawalAmountInEth || 0n),
        0n,
      );
      const stethMintedAfter = maxBN(
        totalMintedSteth - (repayableSteth + rebalanceableSteth),
        0n,
      );

      return {
        vaultBalanceETHAfter,
        stethMintedAfter,
      };
    },
  });

  return {
    ...query,
    isLoading: query.isLoading || query.isPending,
  };
};
