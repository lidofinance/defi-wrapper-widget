import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import invariant from 'tiny-invariant';
import { useInvalidateWrapper } from '@/modules/defi-wrapper';
import { useWalletWhitelisted } from '@/modules/defi-wrapper/hooks/use-wallet-whitelisted';
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
import { useDepositStrategy } from './use-deposit-strategy';
import { DepositFormResolver } from './validation';

type DepositFormContextType = {
  token: DepositFormValues['token'];
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
  const { depositStrategy } = useDepositStrategy();
  const { context, contextValue, isLoading } = useDepositFormData();
  const { isWalletWhitelisted } = useWalletWhitelisted();

  const formObject = useForm<
    DepositFormValues,
    DepositFormValidationContextType,
    DepositFormValidatedValues
  >({
    defaultValues: {
      token: 'ETH',
      amount: null,
      referral: null,
    },
    mode: 'onTouched',
    disabled: !isDappActive || !isWalletWhitelisted,
    context,
    resolver: DepositFormResolver,
  });

  const { setValue } = formObject;
  useQueryParamsReferralForm<DepositFormValues>({ setValue });

  const { token } = formObject.watch();

  const onSubmit = useCallback(
    async (values: DepositFormValidatedValues) => {
      const result = await depositStrategy(values);
      // partial update might be needed regardless of result
      // dues to possible report change in partial tx
      await invalidateWrapper();
      return result;
    },
    [depositStrategy, invalidateWrapper],
  );

  const value = useMemo<DepositFormContextType>(() => {
    const tokenValue = contextValue?.tokens[token];
    return {
      token,
      maxAvailable: tokenValue
        ? minBN(tokenValue.balance, tokenValue.maxDeposit)
        : undefined,
      isLoading,
    };
  }, [token, contextValue, isLoading]);

  return (
    <DepositFormContext.Provider value={value}>
      <FormController formObject={formObject} onSubmit={onSubmit}>
        {children}
      </FormController>
    </DepositFormContext.Provider>
  );
};
