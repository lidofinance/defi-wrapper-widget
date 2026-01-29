import type { Address } from 'viem';
import { LidoSDKShares } from '@lidofinance/lido-ethereum-sdk';
import {
  LidoSDKstETH,
  LidoSDKwstETH,
} from '@lidofinance/lido-ethereum-sdk/erc20';
import { useStvSteth } from '@/modules/defi-wrapper';
import { VaultReportType } from '@/modules/vaults';
import { readWithReport } from '@/modules/vaults';
import type { RegisteredPublicClient } from '@/modules/web3';
import { minBN } from '@/utils/bn';
import type { RepayTokens } from '../withdrawal-form-context/types';

export type Wrapper = ReturnType<typeof useStvSteth>['wrapper'];

export type RepayStaticData = {
  sharesBalance: bigint;
  wstethBalance: bigint;
  stethBalance: bigint;
  unlockedUserEth: bigint;
  mintedShares: bigint;
};

export type RepayRebalanceRatio = {
  repayableStethShares: bigint;
  rebalanceableStethShares: bigint;
  repayableSteth: bigint;
  rebalanceableSteth: bigint;
  remainingWithdrawEth?: bigint;
};

export const fetchMaximumAvailableRepay = async ({
  publicClient,
  report,
  wrapper,
  address,
  shares,
  wstETH,
}: {
  publicClient: RegisteredPublicClient;
  report: VaultReportType | null | undefined;
  wrapper: Wrapper;
  address: Address;
  shares: LidoSDKShares;
  wstETH: LidoSDKwstETH;
}) => {
  const [wstethAmount, stethShares, mintedStethSharesOf] = await Promise.all([
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

  const [withdrawalbeEthNoRebalanceSteth, withdrawalbeEthNoRebalanceWsteth] =
    (await readWithReport({
      publicClient,
      report,
      contracts: [
        wrapper.prepare.unlockedAssetsOf([address, maxRepayableStethShares]),
        wrapper.prepare.unlockedAssetsOf([address, maxRepayableWsteth]),
      ],
    })) as [bigint, bigint];

  return {
    maxEthForRepayableSteth: withdrawalbeEthNoRebalanceSteth,
    maxEthForRepayableWSteth: withdrawalbeEthNoRebalanceWsteth,
  };
};

export const fetchRepayStaticData = async ({
  publicClient,
  report,
  wrapper,
  address,
  shares,
  wstETH,
  stETH,
}: {
  publicClient: RegisteredPublicClient;
  report: VaultReportType | null | undefined;
  wrapper: Wrapper;
  address: Address;
  shares: LidoSDKShares;
  wstETH: LidoSDKwstETH;
  stETH: LidoSDKstETH;
}): Promise<RepayStaticData> => {
  const [sharesBalance, wstethBalance, stethBalance, mintedShares] =
    await Promise.all([
      shares.balance(address),
      wstETH.balance(address),
      stETH.balance(address),
      wrapper.read.mintedStethSharesOf([address]),
    ]);

  const [unlockedUserEth] = (await readWithReport({
    publicClient,
    report,
    contracts: [wrapper.prepare.unlockedAssetsOf([address, 0n])],
  })) as bigint[];

  return {
    sharesBalance,
    wstethBalance,
    stethBalance,
    unlockedUserEth,
    mintedShares,
  };
};

export const calculateRepayRebalanceRatio = async ({
  publicClient,
  report,
  wrapper,
  shares,
  repayToken,
  amount,
  repayStaticData,
}: {
  publicClient: RegisteredPublicClient;
  report: VaultReportType | null | undefined;
  wrapper: Wrapper;
  shares: LidoSDKShares;
  repayToken: RepayTokens;
  amount: bigint;
  repayStaticData: RepayStaticData;
}): Promise<RepayRebalanceRatio> => {
  const { unlockedUserEth, mintedShares, sharesBalance, wstethBalance } =
    repayStaticData;

  const lockedUserEth = amount - unlockedUserEth;

  // no need to repay/rebalance if unlocked ETH covers the withdrawal amount
  if (lockedUserEth <= 0n) {
    return {
      repayableStethShares: 0n,
      rebalanceableStethShares: 0n,
      repayableSteth: 0n,
      rebalanceableSteth: 0n,
      remainingWithdrawEth: amount,
    };
  }

  // steth shares needed to repay for the locked portion of withdrawal
  const [stethSharesToRepayAmount] = (await readWithReport({
    publicClient,
    report,
    contracts: [
      wrapper.prepare.calcStethSharesToMintForAssets([lockedUserEth]),
    ],
  })) as [bigint];

  // amount entered could exceed user balance and total repay must be capped at minted shares
  const stethSharesToRepay = minBN(stethSharesToRepayAmount, mintedShares);

  const userRepayTokenBalanceInStethShares =
    repayToken === 'WSTETH'
      ? await shares.convertToSteth(await shares.convertToSteth(wstethBalance))
      : sharesBalance;

  // steth shares user can repay with their current balance
  const repayableStethShares = minBN(
    stethSharesToRepay,
    userRepayTokenBalanceInStethShares,
  );
  // steth shares that will be forgiven when rebalancing
  const rebalanceableStethShares = stethSharesToRepay - repayableStethShares;

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
};

export const getRepayRebalanceAmountFromData = ({
  repayToken,
  repayRatioData,
  maxEthForRepayableSteth,
  maxEthForRepayableWSteth,
}: {
  repayToken: RepayTokens;
  repayRatioData: RepayRebalanceRatio | undefined;
  maxEthForRepayableSteth: bigint | undefined;
  maxEthForRepayableWSteth: bigint | undefined;
}) => {
  if (repayToken === 'WSTETH') {
    return {
      maxEthForRepayableToken: maxEthForRepayableWSteth,
      repayable: repayRatioData?.repayableStethShares,
      rebalanceable: repayRatioData?.rebalanceableStethShares,
    };
  }

  return {
    maxEthForRepayableToken: maxEthForRepayableSteth,
    repayable: repayRatioData?.repayableSteth,
    rebalanceable: repayRatioData?.rebalanceableSteth,
  };
};

export const getRepayRebalanceAmount = async ({
  amount,
  repayToken,
  publicClient,
  report,
  wrapper,
  address,
  shares,
  wstETH,
  stETH,
}: {
  amount: bigint;
  repayToken: RepayTokens;
  publicClient: RegisteredPublicClient;
  report: VaultReportType | null | undefined;
  wrapper: Wrapper;
  address: Address;
  shares: LidoSDKShares;
  wstETH: LidoSDKwstETH;
  stETH: LidoSDKstETH;
}) => {
  const [maxAvailableRepay, repayStaticData] = await Promise.all([
    fetchMaximumAvailableRepay({
      publicClient,
      report,
      wrapper,
      address,
      shares,
      wstETH,
    }),
    fetchRepayStaticData({
      publicClient,
      report,
      wrapper,
      address,
      shares,
      wstETH,
      stETH,
    }),
  ]);

  const repayRatioData = await calculateRepayRebalanceRatio({
    publicClient,
    report,
    wrapper,
    shares,
    repayToken,
    amount,
    repayStaticData,
  });

  return {
    repayRatioData,
    ...maxAvailableRepay,
    ...getRepayRebalanceAmountFromData({
      repayToken,
      repayRatioData,
      maxEthForRepayableSteth: maxAvailableRepay.maxEthForRepayableSteth,
      maxEthForRepayableWSteth: maxAvailableRepay.maxEthForRepayableWSteth,
    }),
  };
};
