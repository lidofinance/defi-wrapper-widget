import { useMemo } from 'react';
import { useWrapperBalance, useWithdrawalQueue } from '@/modules/defi-wrapper';
import { useDappStatus } from '@/modules/web3';
import { useAwaiter } from '@/shared/hooks';

import {
  WithdrawalFormValidationAsyncContextType,
  WithdrawalFormValidationContextType,
  WithdrawalFormValues,
} from './types';

export const useWithdrawalFormData = () => {
  const { isWalletConnected } = useDappStatus();
  const {
    maxWithdrawalAmountInEth,
    minWithdrawalAmountInEth,
    isLoading: isWQLoading,
  } = useWithdrawalQueue();

  const { assets, isLoading: isWrapperLoading } = useWrapperBalance();

  const contextValue: WithdrawalFormValidationAsyncContextType | undefined =
    useMemo(() => {
      if (isWrapperLoading || isWQLoading) {
        return undefined;
      }
      return {
        balanceInEth: assets ?? 0n,
        minWithdrawalInEth: minWithdrawalAmountInEth ?? 0n,
        maxWithdrawalInEth: maxWithdrawalAmountInEth ?? 0n,
      };
    }, [
      assets,
      isWrapperLoading,
      isWQLoading,
      minWithdrawalAmountInEth,
      maxWithdrawalAmountInEth,
    ]);

  const asyncContext = useAwaiter(contextValue).awaiter;

  const defaultValuesGenerator = useMemo(() => {
    return () =>
      asyncContext.then(
        () =>
          ({
            token: 'ETH',
            amount: null,
          }) as WithdrawalFormValues,
      );
  }, [asyncContext]);

  const context: WithdrawalFormValidationContextType = useMemo(() => {
    return {
      asyncContext,
      isWalletConnected,
    };
  }, [isWalletConnected, asyncContext]);

  return {
    context,
    defaultValuesGenerator,
    contextValue,
    isLoading: isWQLoading || isWrapperLoading,
  };
};
