import { useMemo } from 'react';
import type { Address } from 'viem';
import { usePublicClient } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';

import { useStvSteth } from '@/modules/defi-wrapper';
import { useVault, VaultReportType } from '@/modules/vaults';
import { readWithReport } from '@/modules/vaults';
import {
  useDappStatus,
  useLidoSDK,
  type RegisteredPublicClient,
} from '@/modules/web3';
import { Token } from '@/types/token';
import { bnCeilDiv, maxBN, minBN } from '@/utils/bn';

import type { LidoSDKwstETH } from '@lidofinance/lido-ethereum-sdk/erc20';
import type { LidoSDKShares } from '@lidofinance/lido-ethereum-sdk/shares';

export type Wrapper = ReturnType<typeof useStvSteth>['wrapper'];

type RepayTokens = Extract<Token, 'WSTETH' | 'STETH'>;

type PrepareLocalWithdrawalCalcParams = {
  account: Address;
  wrapper: Wrapper;
  publicClient: RegisteredPublicClient;
  shares: LidoSDKShares;
  wstETH: LidoSDKwstETH;
  report: VaultReportType | null | undefined;
};

type CaculateStethSharesToRepayParams = {
  publicClient: RegisteredPublicClient;
  report: VaultReportType | null | undefined;
  wrapper: Wrapper;
  account: Address;
  stvWithdrawAmountInEth: bigint;
};

type CalcWithdrawalRepayRebalanceRatioResult = {
  withdrawalValue: bigint;
  repayableStethShares: bigint;
  repayableWsteth: bigint;
  repayableSteth: bigint;
  rebalancableStethShares: bigint;
  rebalancableSteth: bigint;
  rebalancableValue: bigint;
};

export type CalcWithdrawalRepayRebalanceRatio = Awaited<
  ReturnType<typeof prepareLocalWithdrawalCalc>
>;

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

const prepareLocalWithdrawalCalc = async ({
  account,
  wrapper,
  shares,
  wstETH,
  publicClient,
  report,
}: PrepareLocalWithdrawalCalcParams) => {
  const [lidoShares, poolReserveRatioBP, sharesBalance, wstETHBalance] =
    await Promise.all([
      shares.getTotalSupply(),
      wrapper.read.poolReserveRatioBP(),
      shares.balance(account),
      wstETH.balance(account),
    ]);

  const [unlockedAssets, mintedStethShares, assets] = await readWithReport({
    publicClient,
    report,
    contracts: [
      wrapper.prepare.unlockedAssetsOf([account, 0n]),
      wrapper.prepare.mintedStethSharesOf([account]),
      wrapper.prepare.assetsOf([account]),
    ],
  });

  // how much stETH shares can be minted for user provided assets
  const [totalLiabilityStethShares] = await readWithReport({
    publicClient,
    report,
    contracts: [
      wrapper.prepare.calcStethSharesToMintForAssets([assets]),
      // this does not require a report but we can save one call by including it here with the others needed for the UI
    ],
  });

  // if user actual liability exceeds calculated liability then they have to repay the difference before unlocking any assets
  const exceedingLiability = maxBN(
    mintedStethShares - totalLiabilityStethShares,
    0n,
  );

  const localStethToShares = (stethAmount: bigint) =>
    (stethAmount * lidoShares.totalShares) / lidoShares.totalEther;

  const localSharesToSteth = (sharesAmount: bigint) =>
    (sharesAmount * lidoShares.totalEther) / lidoShares.totalShares;

  const localSharesToStethRoundUp = (sharesAmount: bigint) =>
    bnCeilDiv(sharesAmount * lidoShares.totalEther, lidoShares.totalShares);

  const localCalcShareForAssets = (assetsETH: bigint) => {
    // Smart contract code:
    // uint256 maxStethToMint =
    //       Math.mulDiv(_assets, TOTAL_BASIS_POINTS - poolReserveRatioBP(), TOTAL_BASIS_POINTS, Math.Rounding.Floor);
    //   stethShares = _getSharesByPooledEth(maxStethToMint);
    const maxStethToMint = (assetsETH * (10000n - poolReserveRatioBP)) / 10000n;

    return localStethToShares(maxStethToMint);
  };

  return (
    amount: bigint,
    repayableToken: RepayTokens,
  ): CalcWithdrawalRepayRebalanceRatioResult => {
    const amountToUnlock = maxBN(amount - unlockedAssets, 0n);

    if (amountToUnlock === 0n)
      return {
        withdrawalValue: amount,
        repayableStethShares: 0n,
        repayableWsteth: 0n,
        repayableSteth: 0n,
        rebalancableStethShares: 0n,
        rebalancableSteth: 0n,
        rebalancableValue: 0n,
      };

    // shares needed to cover for the amount user want's to unlock, capped by total minted shares
    const sharesToRepay = minBN(
      localCalcShareForAssets(amountToUnlock) + exceedingLiability,
      mintedStethShares,
    );

    // simulate wei loss on wsteth->steth conversion
    const wstethBalanceConvertedToShares = localStethToShares(
      localSharesToSteth(wstETHBalance),
    );

    const wstethLossInShares = maxBN(
      wstETHBalance - wstethBalanceConvertedToShares,
      0n,
    );

    const balanceInSharesOfRepayableToken =
      repayableToken === 'STETH'
        ? sharesBalance
        : wstethBalanceConvertedToShares;

    const repayableStethShares = minBN(
      sharesToRepay,
      balanceInSharesOfRepayableToken,
    );

    const repayableWsteth = repayableStethShares + wstethLossInShares;

    const repayableSteth = localSharesToSteth(repayableStethShares);

    const rebalancableStethShares = maxBN(
      sharesToRepay - repayableStethShares,
      0n,
    );

    const rebalancableSteth = localSharesToSteth(rebalancableStethShares);

    const rebalancableValue = localSharesToStethRoundUp(
      rebalancableStethShares,
    );

    const withdrawalValue = maxBN(amount - rebalancableValue, 0n);
    return {
      repayableSteth,
      repayableWsteth,
      repayableStethShares,
      rebalancableStethShares,
      rebalancableSteth,
      rebalancableValue,
      withdrawalValue,
    };
  };
};

export const useRepayRebalanceRatio = (
  amount?: bigint | null,
  repayToken: RepayTokens = 'STETH',
) => {
  const publicClient = usePublicClient();
  const { address } = useDappStatus();
  const { shares, wstETH } = useLidoSDK();
  const { activeVault, queryKeys } = useVault();
  const { wrapper } = useStvSteth();
  const { data: calcWithdrawalRepayRebalanceRatio, ...calcQuery } = useQuery({
    queryKey: [...queryKeys.state, 'rebalance-ratio-local-calc'],
    enabled: !!activeVault && !!address,
    queryFn: async () => {
      invariant(activeVault, 'Active vault is required');
      invariant(address, 'Wallet must be connected');
      return await prepareLocalWithdrawalCalc({
        account: address,
        wrapper,
        publicClient,
        shares,
        wstETH,
        report: activeVault.report,
      });
    },
  });

  const rebalanceRatio = useMemo(() => {
    if (!calcWithdrawalRepayRebalanceRatio) return undefined;
    return calcWithdrawalRepayRebalanceRatio(amount || 0n, repayToken);
  }, [amount, repayToken, calcWithdrawalRepayRebalanceRatio]);

  return {
    rebalanceRatio,
    calcWithdrawalRepayRebalanceRatio,
    ...calcQuery,
  };
};
