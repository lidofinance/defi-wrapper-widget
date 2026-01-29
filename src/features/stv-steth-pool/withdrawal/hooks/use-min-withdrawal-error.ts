import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useWithdrawalQueue } from '@/modules/defi-wrapper';
import { useRepayRebalanceAmount } from './use-repay-rebalance-amount';
import { getMinWithdrawalErrorFromData } from '../utils/min-withdrawal-error';
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

  const error = getMinWithdrawalErrorFromData({
    amount,
    rebalanceableSteth,
    minWithdrawalAmountInEth,
  });
  const canValidate =
    !!amount && rebalanceableSteth !== undefined && !!minWithdrawalAmountInEth;

  useEffect(() => {
    if (!canValidate || displayData.isLoading) {
      return;
    }

    if (error) {
      setError('root', {
        type: 'custom',
        message: error,
      });
      return;
    }

    clearErrors('root');
  }, [canValidate, displayData.isLoading, error, setError, clearErrors]);
};
