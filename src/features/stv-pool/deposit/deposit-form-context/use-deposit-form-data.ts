import { useMemo } from 'react';
import {
  useDappStatus,
  useEthereumBalance,
  useWethBalance,
} from '@/modules/web3';
import { useAwaiter } from '@/shared/hooks';
import {
  DepositFormValidationAsyncContextType,
  DepositFormValidationContextType,
} from './types';

export const useDepositFormData = () => {
  const { isWalletConnected } = useDappStatus();
  const ethBalanceQuery = useEthereumBalance();
  const wethBalanceQuery = useWethBalance();

  const isLoading = ethBalanceQuery.isLoading || wethBalanceQuery.isLoading;

  const contextValue: DepositFormValidationAsyncContextType | undefined =
    useMemo(() => {
      if (
        ethBalanceQuery.data == undefined &&
        wethBalanceQuery.data == undefined
      )
        return undefined;
      return {
        tokens: {
          ETH: { balance: ethBalanceQuery.data ?? 0n, maxDeposit: null },
          WETH: { balance: wethBalanceQuery.data ?? 0n, maxDeposit: null },
        },
      };
    }, [ethBalanceQuery.data, wethBalanceQuery.data]);

  const asyncContext = useAwaiter(contextValue).awaiter;

  const context: DepositFormValidationContextType = useMemo(() => {
    return {
      asyncContext,
      isWalletConnected,
    };
  }, [isWalletConnected, asyncContext]);

  return {
    ethBalanceQuery,
    wethBalanceQuery,
    context,
    contextValue,
    isLoading,
  };
};
