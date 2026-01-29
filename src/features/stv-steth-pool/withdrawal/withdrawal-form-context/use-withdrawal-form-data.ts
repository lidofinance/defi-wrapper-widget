import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useStvSteth,
  useWrapperBalance,
  useWithdrawalQueue,
} from '@/modules/defi-wrapper';
import { useVault } from '@/modules/vaults';
import { useDappStatus, useLidoSDK } from '@/modules/web3';
import { useAwaiter } from '@/shared/hooks';

import {
  WithdrawalFormValidationAsyncContextType,
  WithdrawalFormValidationContextType,
} from './types';

export const useWithdrawalFormData = () => {
  const { isWalletConnected, address } = useDappStatus();
  const {
    maxWithdrawalAmountInEth,
    minWithdrawalAmountInEth,
    isPending: isWQLoading,
  } = useWithdrawalQueue();
  const { assets, isPending: isWrapperLoading } = useWrapperBalance();
  const { publicClient, shares, wstETH, stETH } = useLidoSDK();
  const { activeVault } = useVault();
  const { wrapper } = useStvSteth();
  const queryClient = useQueryClient();

  const contextValue: WithdrawalFormValidationAsyncContextType | undefined =
    useMemo(() => {
      if (isWrapperLoading || isWQLoading) {
        return undefined;
      }
      const minWithdrawalValidationDeps =
        address && wrapper && activeVault
          ? {
              publicClient,
              report: activeVault.report,
              wrapper,
              address,
              shares,
              wstETH,
              stETH,
              queryClient,
            }
          : undefined;

      return {
        balanceInEth: assets ?? 0n,
        minWithdrawalInEth: minWithdrawalAmountInEth ?? 0n,
        maxWithdrawalInEth: maxWithdrawalAmountInEth ?? 0n,
        minWithdrawalValidationDeps,
      };
    }, [
      activeVault,
      address,
      assets,
      maxWithdrawalAmountInEth,
      minWithdrawalAmountInEth,
      publicClient,
      queryClient,
      shares,
      stETH,
      wstETH,
      wrapper,
      isWrapperLoading,
      isWQLoading,
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
