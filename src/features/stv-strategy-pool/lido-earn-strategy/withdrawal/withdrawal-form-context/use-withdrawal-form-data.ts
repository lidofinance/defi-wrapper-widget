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
  const { isPositionLoading, totalEthToWithdrawFromStrategyVault } =
    useEarnPosition();

  const contextValue: WithdrawalFormValidationAsyncContextType | undefined =
    useMemo(() => {
      if (totalEthToWithdrawFromStrategyVault === undefined) {
        return undefined;
      }
      return {
        balanceInEth: totalEthToWithdrawFromStrategyVault,
        minWithdrawalInEth: 100n,
        maxWithdrawalInEth: null,
      };
    }, [totalEthToWithdrawFromStrategyVault]);

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
