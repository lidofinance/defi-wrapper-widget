import { useMemo } from 'react';
import { useVaultCapacity } from '@/modules/defi-wrapper';
import {
  useDappStatus,
  useEthereumBalance,
  useWethBalance,
} from '@/modules/web3';
import { useAwaiter } from '@/shared/hooks';
import {
  DepositFormValidationAsyncContextType,
  DepositFormValidationContextType,
  DepositFormValues,
} from './types';

export const useDepositFormData = () => {
  const { isWalletConnected } = useDappStatus();
  const ethBalanceQuery = useEthereumBalance();
  const wethBalanceQuery = useWethBalance();
  const vaultCapacityQuery = useVaultCapacity();

  const isLoading =
    ethBalanceQuery.isLoading ||
    wethBalanceQuery.isLoading ||
    vaultCapacityQuery.isLoading;

  const contextValue: DepositFormValidationAsyncContextType | undefined =
    useMemo(() => {
      if (
        ethBalanceQuery.data == undefined ||
        wethBalanceQuery.data == undefined ||
        vaultCapacityQuery.data == undefined
      )
        return undefined;
      return {
        tokens: {
          ETH: {
            balance: ethBalanceQuery.data,
            maxDeposit: vaultCapacityQuery.data.remainingDepositCapacityEth,
          },
          WETH: {
            balance: wethBalanceQuery.data ?? 0n,
            maxDeposit: vaultCapacityQuery.data.remainingDepositCapacityEth,
          },
        },
      };
    }, [ethBalanceQuery.data, wethBalanceQuery.data, vaultCapacityQuery.data]);
  const asyncContext = useAwaiter(contextValue).awaiter;

  const defaultValuesGenerator = useMemo(() => {
    return () =>
      asyncContext.then(
        () =>
          ({
            token: 'ETH',
            amount: null,
            referral: null,
          }) as DepositFormValues,
      );
  }, [asyncContext]);

  const context: DepositFormValidationContextType = useMemo(() => {
    return {
      asyncContext,
      isWalletConnected,
    };
  }, [isWalletConnected, asyncContext]);

  return {
    ethBalanceQuery,
    wethBalanceQuery,
    defaultValuesGenerator,
    context,
    contextValue,
    isLoading,
  };
};
