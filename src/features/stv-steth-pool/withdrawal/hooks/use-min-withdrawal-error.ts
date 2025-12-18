import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useWithdrawalQueue } from '@/modules/defi-wrapper';
import { useRepayRebalanceAmount } from './use-repay-rebalance-amount';
import type {
  RepayTokens,
  WithdrawalFormValues,
} from '../withdrawal-form-context/types';

export const useMinWithdrawalError = (
  amount: bigint | null,
  repayToken: RepayTokens,
) => {
  const { minWithdrawalAmountInEth } = useWithdrawalQueue();
  const displayData = useRepayRebalanceAmount(amount, repayToken);

  const { setError, clearErrors } = useFormContext<WithdrawalFormValues>();

  const rebalanceableSteth = displayData?.rebalanceable;

  useEffect(() => {
    if (
      !amount ||
      rebalanceableSteth === undefined ||
      !minWithdrawalAmountInEth ||
      displayData.isLoading
    ) {
      return;
    }

    if (amount - rebalanceableSteth <= minWithdrawalAmountInEth) {
      setError('root', {
        type: 'custom',
        message: 'Withdrawal amount is less than minimum withdrawal limit',
      });
    } else {
      clearErrors('root');
    }
  }, [
    displayData,
    amount,
    rebalanceableSteth,
    minWithdrawalAmountInEth,
    setError,
    clearErrors,
  ]);
};
