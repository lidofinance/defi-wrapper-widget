import { useMemo } from 'react';
import { useDappStatus } from '@/modules/web3';
import { useAwaiter } from '@/shared/hooks';

import { useEarnPosition } from '../../hooks';
import {
  WithdrawalFormValidationAsyncContextType,
  WithdrawalFormValidationContextType,
} from './types';

export const useWithdrawalFormData = () => {
  const { isWalletConnected } = useDappStatus();
  const { isPositionLoading, positionData } = useEarnPosition();

  const contextValue: WithdrawalFormValidationAsyncContextType | undefined =
    useMemo(() => {
      if (!positionData) {
        return undefined;
      }
      return {
        balanceInEth: positionData.totalEthToWithdrawFromStrategyVault,
        minWithdrawalInEth: 100n,
        maxWithdrawalInEth: null,
      };
    }, [positionData]);

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
    isLoading: isPositionLoading,
  };
};
