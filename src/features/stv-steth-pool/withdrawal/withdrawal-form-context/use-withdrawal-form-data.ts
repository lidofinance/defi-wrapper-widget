import { useMemo } from 'react';
import {
  useWrapperBalance,
  useWithdrawalQueue,
  useRepayRebalanceRatio,
} from '@/modules/defi-wrapper';

import { useDappStatus } from '@/modules/web3';
import { useAwaiter } from '@/shared/hooks';

import {
  WithdrawalFormValidationAsyncContextType,
  WithdrawalFormValidationContextType,
} from './types';

export const useWithdrawalFormData = () => {
  const { isWalletConnected } = useDappStatus();
  const {
    maxWithdrawalAmountInEth,
    minWithdrawalAmountInEth,
    isPending: isWQLoading,
  } = useWithdrawalQueue();
  const { assets, isPending: isWrapperLoading } = useWrapperBalance();
  const {
    calcWithdrawalRepayRebalanceRatio,
    isPending: isRepayRebalanceRatioLoading,
  } = useRepayRebalanceRatio();

  const contextValue: WithdrawalFormValidationAsyncContextType | undefined =
    useMemo(() => {
      if (
        isWrapperLoading ||
        isWQLoading ||
        isRepayRebalanceRatioLoading ||
        !calcWithdrawalRepayRebalanceRatio
      ) {
        return undefined;
      }

      return {
        balanceInEth: assets ?? 0n,
        minWithdrawalInEth: minWithdrawalAmountInEth ?? 0n,
        maxWithdrawalInEth: maxWithdrawalAmountInEth ?? 0n,
        calcWithdrawalRepayRebalanceRatio,
      };
    }, [
      isWrapperLoading,
      isWQLoading,
      isRepayRebalanceRatioLoading,
      assets,
      minWithdrawalAmountInEth,
      maxWithdrawalAmountInEth,
      calcWithdrawalRepayRebalanceRatio,
    ]);

  const asyncContext = useAwaiter(contextValue).awaiter;

  const context: WithdrawalFormValidationContextType = useMemo(() => {
    return {
      asyncContext,
      isWalletConnected,
    };
  }, [isWalletConnected, asyncContext]);

  return {
    context,
    contextValue,
    isLoading: isWQLoading || isWrapperLoading,
  };
};
