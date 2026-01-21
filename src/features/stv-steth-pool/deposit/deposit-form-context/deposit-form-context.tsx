import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import invariant from 'tiny-invariant';
import {
  useInvalidateWrapper,
  useWalletWhitelisted,
} from '@/modules/defi-wrapper';
import { useDappStatus } from '@/modules/web3';
import { FormController } from '@/shared/hook-form/form-controller';
import { useQueryParamsReferralForm } from '@/shared/hooks/use-query-values-form';
import { minBN } from '@/utils/bn';
import {
  DepositFormValidatedValues,
  DepositFormValidationContextType,
  DepositFormValues,
} from './types';
import { useDepositFormData } from './use-deposit-form-data';
import { useDepositMint } from './use-deposit-mint';
import { DepositFormResolver } from './validation';

type DepositFormContextType = {
  token: DepositFormValues['token'];
  tokenToMint: DepositFormValues['tokenToMint'];
  maxAvailable?: bigint;
  isLoading: boolean;
};

const DepositFormContext = createContext<DepositFormContextType | null>(null);
DepositFormContext.displayName = 'DepositFormContext';

export const useDepositFormContext = () => {
  const context = useContext(DepositFormContext);
  invariant(
    context,
    'useDepositFormContext must be used within a DepositFormProvider',
  );
  return context;
};

export const DepositFormProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const invalidateWrapper = useInvalidateWrapper();
  const { isDappActive } = useDappStatus();
  const { deposit } = useDepositMint();
  const { context, contextValue, defaultValuesGenerator, isLoading } =
    useDepositFormData();
  const { isWalletWhitelisted } = useWalletWhitelisted();
  const formObject = useForm<
    DepositFormValues,
    DepositFormValidationContextType,
    DepositFormValidatedValues
  >({
    defaultValues: defaultValuesGenerator,
    mode: 'onTouched',
    disabled: !isDappActive || !isWalletWhitelisted,
    context,
    resolver: DepositFormResolver,
  });

  const { setValue, formState } = formObject;
  useQueryParamsReferralForm<DepositFormValues>({ setValue });

  const { token, tokenToMint } = formObject.watch();
  const isFormLoading = formState.isLoading;

  const onSubmit = useCallback(
    async (values: DepositFormValidatedValues) => {
      const result = await deposit(values);
      // partial update might be needed regardless of result
      // dues to possible report change in partial tx
      await invalidateWrapper();
      return result;
    },
    [deposit, invalidateWrapper],
  );

  const value = useMemo<DepositFormContextType>(() => {
    const tokenValue = contextValue?.tokens[token];
    return {
      token,
      tokenToMint,
      maxAvailable:
        tokenValue && minBN(tokenValue.balance, tokenValue.maxDeposit),
      isLoading: isLoading || isFormLoading,
    };
  }, [token, tokenToMint, contextValue, isLoading, isFormLoading]);

  return (
    <DepositFormContext.Provider value={value}>
      <FormController formObject={formObject} onSubmit={onSubmit}>
        {children}
      </FormController>
    </DepositFormContext.Provider>
  );
};
