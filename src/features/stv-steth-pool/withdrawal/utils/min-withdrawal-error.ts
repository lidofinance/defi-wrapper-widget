import type { Address } from 'viem';
import type { VaultReportType } from '@/modules/vaults';
import type { RegisteredPublicClient } from '@/modules/web3';
import type {
  RepayRebalanceWrapper,
  SharesContract,
  TokenContract,
} from './repay-rebalance';
import { getRepayRebalanceAmount } from './repay-rebalance';
import type { RepayTokens } from '../withdrawal-form-context/types';

export const MIN_WITHDRAWAL_ERROR_MESSAGE =
  'Withdrawal amount is less than minimum withdrawal limit';

export type WithdrawalQueueContract = {
  read: {
    MIN_WITHDRAWAL_VALUE: () => Promise<bigint>;
    MAX_WITHDRAWAL_ASSETS: () => Promise<bigint>;
  };
};

export const fetchWithdrawalQueueLimits = async ({
  withdrawalQueue,
}: {
  withdrawalQueue: WithdrawalQueueContract;
}) => {
  const [minWithdrawalAmountInEth, maxWithdrawalAmountInEth] =
    await Promise.all([
      withdrawalQueue.read.MIN_WITHDRAWAL_VALUE(),
      withdrawalQueue.read.MAX_WITHDRAWAL_ASSETS(),
    ]);

  return {
    minWithdrawalAmountInEth,
    maxWithdrawalAmountInEth,
  };
};

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
  wrapper: RepayRebalanceWrapper;
  withdrawalQueue: WithdrawalQueueContract;
  address: Address;
  shares: SharesContract;
  wstETH: TokenContract;
  stETH: TokenContract;
}) => {
  if (!amount) {
    return {
      error: null,
      minWithdrawalAmountInEth: undefined,
      rebalanceableSteth: undefined,
    };
  }

  const [{ minWithdrawalAmountInEth }, repayData] = await Promise.all([
    fetchWithdrawalQueueLimits({ withdrawalQueue }),
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
    minWithdrawalAmountInEth,
    rebalanceableSteth,
    repayData,
  };
};
