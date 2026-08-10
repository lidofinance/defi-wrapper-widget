import { Token } from '@/types/token';
import { bnCeilDiv, clampZeroBN, minBN } from '@/utils/bn';

type RepayTokens = Extract<Token, 'WSTETH' | 'STETH'>;

type RepayCalcResult = {
  withdrawalValue: bigint;
  repayableStethShares: bigint;
  repayableWsteth: bigint;
  repayableSteth: bigint;
  rebalancableStethShares: bigint;
  rebalancableSteth: bigint;
  rebalancableValue: bigint;
};

export type RepayCalcContext = {
  lidoShares: { totalShares: bigint; totalEther: bigint };
  poolReserveRatioBP: bigint;
  sharesBalance: bigint;
  wstETHBalance: bigint;
  unlockedAssets: bigint;
  mintedStethShares: bigint;
  exceedingLiability: bigint;
};

export const buildRepayCalc =
  ({
    lidoShares,
    poolReserveRatioBP,
    sharesBalance,
    wstETHBalance,
    unlockedAssets,
    mintedStethShares,
    exceedingLiability,
  }: RepayCalcContext) =>
  (amount: bigint, repayableToken: RepayTokens): RepayCalcResult => {
    const localStethToShares = (stethAmount: bigint) =>
      (stethAmount * lidoShares.totalShares) / lidoShares.totalEther;

    const localSharesToSteth = (sharesAmount: bigint) =>
      (sharesAmount * lidoShares.totalEther) / lidoShares.totalShares;

    const localSharesToStethRoundUp = (sharesAmount: bigint) =>
      bnCeilDiv(sharesAmount * lidoShares.totalEther, lidoShares.totalShares);

    const localCalcShareForAssets = (assetsETH: bigint) => {
      const maxStethToMint =
        (assetsETH * (10000n - poolReserveRatioBP)) / 10000n;
      return localStethToShares(maxStethToMint);
    };

    const amountToUnlock = clampZeroBN(amount - unlockedAssets);

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

    const sharesToRepay = minBN(
      localCalcShareForAssets(amountToUnlock) + exceedingLiability,
      mintedStethShares,
    );

    const wstethBalanceConvertedToShares = localStethToShares(
      localSharesToSteth(wstETHBalance),
    );

    const wstethLossInShares = clampZeroBN(
      wstETHBalance - wstethBalanceConvertedToShares,
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

    const rebalancableStethShares = clampZeroBN(
      sharesToRepay - repayableStethShares,
    );

    const rebalancableSteth = localSharesToSteth(rebalancableStethShares);

    const rebalancableValue = localSharesToStethRoundUp(
      rebalancableStethShares,
    );

    const withdrawalValue = clampZeroBN(amount - rebalancableValue);

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
