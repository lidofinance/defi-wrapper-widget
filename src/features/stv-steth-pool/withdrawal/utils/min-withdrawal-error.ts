import type { Address } from 'viem';
import { LidoSDKShares } from '@lidofinance/lido-ethereum-sdk';
import {
  LidoSDKstETH,
  LidoSDKwstETH,
} from '@lidofinance/lido-ethereum-sdk/erc20';
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
  minWithdrawalAmountInEth: bigint | null;
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
  address,
  shares,
  wstETH,
  stETH,
  minWithdrawalAmountInEth,
}: {
  minWithdrawalAmountInEth: bigint | null;
  amount: bigint | null;
  repayToken: RepayTokens;
  publicClient: RegisteredPublicClient;
  report: VaultReportType | null | undefined;
  wrapper: Wrapper;
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

  const repayData = await getRepayRebalanceAmount({
    amount,
    repayToken,
    publicClient,
    report,
    wrapper,
    address,
    shares,
    wstETH,
    stETH,
  });

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
