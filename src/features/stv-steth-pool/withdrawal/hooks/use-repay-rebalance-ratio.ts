import { Address } from 'viem';
import { usePublicClient } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { useStvSteth } from '@/modules/defi-wrapper';
import { readWithReport, useVault, VaultReportType } from '@/modules/vaults';
import {
  RegisteredPublicClient,
  useDappStatus,
  useLidoSDK,
} from '@/modules/web3';
import { useDebouncedValue } from '@/shared/hooks';
import { maxBN } from '@/utils/bn';
import {
  calculateRepayRebalanceRatio,
  fetchRepayStaticData,
} from '../utils/repay-rebalance';
import { RepayTokens } from '../withdrawal-form-context/types';

const useRepayStaticData = () => {
  const publicClient = usePublicClient();
  const { address } = useDappStatus();
  const { shares, wstETH, stETH } = useLidoSDK();
  const { activeVault, queryKeys } = useVault();
  const { wrapper } = useStvSteth();

  return useQuery({
    queryKey: [...queryKeys.state, 'repay-static-data', { address }],
    enabled: !!activeVault && !!address,
    queryFn: async () => {
      invariant(activeVault, '[useRepayStaticData] Active vault is required');
      invariant(address, '[useRepayStaticData] Address is required');
      return fetchRepayStaticData({
        publicClient,
        report: activeVault.report,
        wrapper,
        address,
        shares,
        wstETH,
        stETH,
      });
    },
  });
};

type CaculateStethSharesToRepayParams = {
  publicClient: RegisteredPublicClient;
  report: VaultReportType | null | undefined;
  wrapper: ReturnType<typeof useStvSteth>['wrapper'];
  account: Address;
  stvWithdrawAmountInEth: bigint;
};

// reverse calculation to account for calcStethSharesToMintForAssets rounding down
// suitable for wei correct calculations for transactions
export const calculateStethSharesToRepay = async ({
  publicClient,
  report,
  wrapper,
  account,
  stvWithdrawAmountInEth,
}: CaculateStethSharesToRepayParams) => {
  const [mintedStethShares, stvBalanceInEth] = await readWithReport({
    publicClient,
    report,
    contracts: [
      wrapper.prepare.mintedStethSharesOf([account]),
      wrapper.prepare.assetsOf([account]),
    ],
  });

  const remainingEth = stvBalanceInEth - stvWithdrawAmountInEth;

  let stethSharesLockedForRemainingEth = 0n;
  if (remainingEth >= 0n) {
    const [calcedStethShares] = await readWithReport({
      publicClient,
      report,
      contracts: [
        wrapper.prepare.calcStethSharesToMintForAssets([remainingEth]),
      ],
    });
    stethSharesLockedForRemainingEth = calcedStethShares;
  }

  const stethSharesToRepay = maxBN(
    mintedStethShares - stethSharesLockedForRemainingEth,
    0n,
  );

  return stethSharesToRepay;
};

export const useRepayRebalanceRatio = (
  amount: bigint | null,
  repayToken: RepayTokens,
  debounceDelay: number = 500,
) => {
  const publicClient = usePublicClient();
  const { address } = useDappStatus();
  const { shares } = useLidoSDK();
  const { activeVault, queryKeys } = useVault();
  const { wrapper } = useStvSteth();

  const { data: repayStaticData } = useRepayStaticData();

  // Debounce the amount parameter to prevent excessive calculations
  const debouncedAmount = useDebouncedValue(amount, null, debounceDelay);

  const query = useQuery({
    queryKey: [
      ...queryKeys.state,
      'rebalance-ratio',
      {
        amount: debouncedAmount?.toString(),
        repayToken,
        // dependencies that don't need to be refetched on amount change
        sharesBalance: repayStaticData?.sharesBalance.toString(),
        unlockedUserEth: repayStaticData?.unlockedUserEth.toString(),
        mintedShares: repayStaticData?.mintedShares.toString(),
      },
    ],
    enabled:
      !!activeVault && debouncedAmount !== null && address && !!repayStaticData,
    queryFn: async () => {
      invariant(activeVault, 'Active vault is required');
      invariant(typeof debouncedAmount == 'bigint', 'Amount is required');
      invariant(repayStaticData, 'Repay static data is required');
      return calculateRepayRebalanceRatio({
        publicClient,
        report: activeVault.report,
        wrapper,
        shares,
        repayToken,
        amount: debouncedAmount,
        repayStaticData,
      });
    },
  });

  return {
    ...query,
    isLoading:
      debouncedAmount !== null &&
      (query.isPending || debouncedAmount !== amount),
  };
};
