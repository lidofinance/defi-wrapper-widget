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
import { maxBN, minBN } from '@/utils/bn';
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

      const [sharesBalance, wstethBalance, stethBalance, mintedShares] =
        await Promise.all([
          shares.balance(address),
          wstETH.balance(address),
          stETH.balance(address),
          wrapper.read.mintedStethSharesOf([address]),
        ]);
      const [unlockedUserEth] = await readWithReport({
        publicClient,
        report: activeVault.report,
        contracts: [wrapper.prepare.unlockedAssetsOf([address, 0n])],
      });

      return {
        sharesBalance,
        wstethBalance,
        stethBalance,
        unlockedUserEth,
        mintedShares,
      };
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

      const { unlockedUserEth, mintedShares, sharesBalance, wstethBalance } =
        repayStaticData;

      const lockedUserEth = debouncedAmount - unlockedUserEth;

      // no need to repay/rebalance if unlocked ETH covers the withdrawal amount
      if (lockedUserEth <= 0n) {
        return {
          repayableStethShares: 0n,
          rebalanceableStethShares: 0n,
          repayableSteth: 0n,
          rebalanceableSteth: 0n,
          remainingWithdrawEth: debouncedAmount,
        };
      }

      // steth shares needed to repay for the locked portion of withdrawal
      const [stethSharesToRepayAmount] = await readWithReport({
        publicClient,
        report: activeVault.report,
        contracts: [
          wrapper.prepare.calcStethSharesToMintForAssets([lockedUserEth]),
        ],
      });

      // amount entered could exceed user balance and total repay must be capped at minted shares
      const stethSharesToRepay = minBN(stethSharesToRepayAmount, mintedShares);

      const userRepayTokenBalanceInStethShares =
        repayToken === 'WSTETH'
          ? await shares.convertToSteth(
              await shares.convertToSteth(wstethBalance),
            )
          : sharesBalance;

      // steth shares user can repay with their current balance
      const repayableStethShares = minBN(
        stethSharesToRepay,
        userRepayTokenBalanceInStethShares,
      );
      // steth shares that will be forgiven when rebalancing
      const rebalanceableStethShares =
        stethSharesToRepay - repayableStethShares;

      const [repayableSteth, rebalanceableSteth] = await Promise.all([
        shares.convertToSteth(repayableStethShares),
        shares.convertToSteth(rebalanceableStethShares),
      ]);

      return {
        repayableStethShares,
        repayableSteth,
        rebalanceableStethShares,
        rebalanceableSteth,
      };
    },
  });

  return {
    ...query,
    isLoading:
      debouncedAmount !== null &&
      (query.isPending || debouncedAmount !== amount),
  };
};
