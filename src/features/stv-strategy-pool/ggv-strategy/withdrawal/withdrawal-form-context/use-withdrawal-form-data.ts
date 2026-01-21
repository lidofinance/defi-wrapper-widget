import { useMemo } from 'react';
import { useDappStatus } from '@/modules/web3';
import { useAwaiter } from '@/shared/hooks';

import { useGGVStrategy } from '../../hooks/use-ggv-strategy';
import { useGGVStrategyPosition } from '../../hooks/use-ggv-strategy-position';
import {
  WithdrawalFormValidationAsyncContextType,
  WithdrawalFormValidationContextType,
} from './types';

export const useWithdrawalFormData = () => {
  const { isWalletConnected } = useDappStatus();
  const { data: ggvData, isPending: isGGVLoading } = useGGVStrategy();
  const { data: ggvPositionData, isPending: isGGVPositionLoading } =
    useGGVStrategyPosition();

  const contextValue: WithdrawalFormValidationAsyncContextType | undefined =
    useMemo(() => {
      if (!ggvPositionData || !ggvData) {
        return undefined;
      }
      return {
        balanceInEth: ggvPositionData.totalEthToWithdrawFromGGV,
        minWithdrawalInEth: ggvData.withdrawParams.minimumGGVSharesInSteth,
        maxWithdrawalInEth: null,
      };
    }, [ggvPositionData, ggvData]);

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
    isLoading: isGGVLoading || isGGVPositionLoading,
  };
};
