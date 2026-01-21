import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import invariant from 'tiny-invariant';
import {
  useInvalidateWrapper,
  useWrapperBalance,
} from '@/modules/defi-wrapper';
import { useWalletWhitelisted } from '@/modules/defi-wrapper/hooks/use-wallet-whitelisted';
import { useDappStatus } from '@/modules/web3';
import { FormController } from '@/shared/hook-form/form-controller';
import {
  WithdrawalFormValidatedValues,
  WithdrawalFormValidationContextType,
  WithdrawalFormValues,
} from './types';
import { useWithdrawalFormData } from './use-withdrawal-form-data';
import { useWithdrawalRepay } from './use-withdrawal-repay';
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
  const { withdrawalRepay } = useWithdrawalRepay();
  const { context, isLoading } = useWithdrawalFormData();
  const { assets } = useWrapperBalance();
  const { isWalletWhitelisted } = useWalletWhitelisted();

  const formObject = useForm<
    WithdrawalFormValues,
    WithdrawalFormValidationContextType,
    WithdrawalFormValidatedValues
  >({
    defaultValues: {
      token: 'ETH',
      amount: null,
      repayToken: 'STETH',
    },
    mode: 'onTouched',
    disabled: !isDappActive || !isWalletWhitelisted,
    context,
    resolver: WithdrawalFormResolver,
  });

  const isFormLoading = formObject.formState.isLoading;

  const onSubmit = useCallback(
    async (values: WithdrawalFormValidatedValues) => {
      const result = await withdrawalRepay(values);

      // partial update might be needed regardless of result
      // dues to possible report change in partial tx
      await invalidateWrapper();
      return result;
    },
    [withdrawalRepay, invalidateWrapper],
  );

  const value = useMemo<WithdrawalFormContextType>(() => {
    return {
      maxAvailable: assets,
      isLoading: isLoading || isFormLoading,
    };
  }, [assets, isLoading, isFormLoading]);

  return (
    <WithdrawalFormContext.Provider value={value}>
      <FormController formObject={formObject} onSubmit={onSubmit}>
        {children}
      </FormController>
    </WithdrawalFormContext.Provider>
  );
};
