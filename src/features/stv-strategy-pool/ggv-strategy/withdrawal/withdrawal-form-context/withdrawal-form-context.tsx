import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import invariant from 'tiny-invariant';
import { useInvalidateWrapper, useStvStrategy } from '@/modules/defi-wrapper';
import { useWalletWhitelisted } from '@/modules/defi-wrapper/hooks/use-wallet-whitelisted';
import { useDappStatus } from '@/modules/web3';
import { FormController } from '@/shared/hook-form/form-controller';
import { useWithdrawStrategy } from '../../hooks/use-ggv-withdraw-strategy';
import {
  WithdrawalFormValidatedValues,
  WithdrawalFormValidationContextType,
  WithdrawalFormValues,
} from './types';
import { useWithdrawalFormData } from './use-withdrawal-form-data';
import { WithdrawalFormResolver } from './validation';

type WithdrawalFormContextType = {
  maxAvailable?: bigint;
  isLoading: boolean;
};

const WithdrawalFormContext = createContext<WithdrawalFormContextType | null>(
  null,
);
WithdrawalFormContext.displayName = 'WithdrawalFormContext';

export const useWithdrawalFormContext = () => {
  const context = useContext(WithdrawalFormContext);
  invariant(
    context,
    'useWithdrawalFormContext must be used within a WithdrawalFormProvider',
  );
  return context;
};

export const WithdrawalFormProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const invalidateWrapper = useInvalidateWrapper();
  const { isDappActive } = useDappStatus();
  const { withdrawStrategy } = useWithdrawStrategy();
  const { context, contextValue, isLoading } = useWithdrawalFormData();
  const { isWalletWhitelisted } = useWalletWhitelisted();
  const { withdrawalsPaused } = useStvStrategy();
  const formObject = useForm<
    WithdrawalFormValues,
    WithdrawalFormValidationContextType,
    WithdrawalFormValidatedValues
  >({
    defaultValues: {
      token: 'ETH',
      amount: null,
    },
    mode: 'onTouched',
    disabled: !isDappActive || !isWalletWhitelisted || withdrawalsPaused,
    context,
    resolver: WithdrawalFormResolver,
  });

  const isFormLoading = formObject.formState.isLoading;

  const onSubmit = useCallback(
    async (values: WithdrawalFormValidatedValues) => {
      const result = await withdrawStrategy(values);
      // partial update might be needed regardless of result
      // dues to possible report change in partial tx
      await invalidateWrapper();
      return result;
    },
    [withdrawStrategy, invalidateWrapper],
  );

  const value = useMemo<WithdrawalFormContextType>(() => {
    return {
      maxAvailable: contextValue?.balanceInEth,
      isLoading: isLoading || isFormLoading,
    };
  }, [contextValue, isLoading, isFormLoading]);

  return (
    <WithdrawalFormContext.Provider value={value}>
      <FormController formObject={formObject} onSubmit={onSubmit}>
        {children}
      </FormController>
    </WithdrawalFormContext.Provider>
  );
};
