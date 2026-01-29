import type { Address } from 'viem';
import { LidoSDKShares } from '@lidofinance/lido-ethereum-sdk';
import {
  LidoSDKstETH,
  LidoSDKwstETH,
} from '@lidofinance/lido-ethereum-sdk/erc20';
import { getWQContract } from '@/modules/defi-wrapper';
import type { VaultReportType } from '@/modules/vaults';
import type { RegisteredPublicClient } from '@/modules/web3';
import type { Wrapper } from './repay-rebalance';
import { getRepayRebalanceAmount } from './repay-rebalance';
import type { RepayTokens } from '../withdrawal-form-context/types';

export const MIN_WITHDRAWAL_ERROR_MESSAGE =
  'Withdrawal amount minus the rebalanced value is less then minimum allowed withdrawable value';

export const getMinWithdrawalErrorFromData = ({
  amount,
  rebalanceableSteth,
  minWithdrawalAmountInEth,
}: {
  amount: bigint | null;
  rebalanceableSteth: bigint | undefined;
  minWithdrawalAmountInEth: bigint | undefined;
}) => {
  if (
    !amount ||
    rebalanceableSteth === undefined ||
    !minWithdrawalAmountInEth
  ) {
    return null;
  }

  if (amount - rebalanceableSteth <= minWithdrawalAmountInEth) {
    return MIN_WITHDRAWAL_ERROR_MESSAGE;
  }

  return null;
};

export const getMinWithdrawalError = async ({
  amount,
  repayToken,
  publicClient,
  report,
  wrapper,
  withdrawalQueue,
  address,
  shares,
  wstETH,
  stETH,
}: {
  amount: bigint | null;
  repayToken: RepayTokens;
  publicClient: RegisteredPublicClient;
  report: VaultReportType | null | undefined;
  wrapper: Wrapper;
  withdrawalQueue: ReturnType<typeof getWQContract>;
  address: Address;
  shares: LidoSDKShares;
  wstETH: LidoSDKwstETH;
  stETH: LidoSDKstETH;
}) => {
  if (!amount) {
    return {
      error: null,
      minWithdrawalAmountInEth: undefined,
      rebalanceableSteth: undefined,
    };
  }

  const [minWithdrawalAmountInEth, repayData] = await Promise.all([
    withdrawalQueue.read.MIN_WITHDRAWAL_VALUE(),
    getRepayRebalanceAmount({
      amount,
      repayToken,
      publicClient,
      report,
      wrapper,
      address,
      shares,
      wstETH,
      stETH,
    }),
  ]);

  const rebalanceableSteth = repayData.rebalanceable;
  const error = getMinWithdrawalErrorFromData({
    amount,
    rebalanceableSteth,
    minWithdrawalAmountInEth,
  });

  return {
    error,
  };
};
