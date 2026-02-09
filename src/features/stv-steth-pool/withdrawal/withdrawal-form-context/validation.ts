import { zodResolver } from '@hookform/resolvers/zod';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import {
  mintTokenSchema,
  tokenAmountSchema,
} from '@/shared/hook-form/validation';
import { awaitWithTimeout } from '@/utils/await-with-timeout';
import type {
  RepayTokens,
  WithdrawalFormValidatedValues,
  WithdrawalFormValidationAsyncContextType,
  WithdrawalFormValidationContextType,
  WithdrawalFormValues,
} from './types';

import type { Resolver } from 'react-hook-form';

export const withdrawalFormValidationSchema = (
  repayToken: RepayTokens,
  {
    balanceInEth,
    maxWithdrawalInEth,
    minWithdrawalInEth,
    calcWithdrawalRepayRebalanceRatio,
  }: WithdrawalFormValidationAsyncContextType,
) => {
  let amountSchema = tokenAmountSchema(
    balanceInEth,
    maxWithdrawalInEth ?? undefined,
    'Exceeds maximum withdrawal limit',
  );

  if (minWithdrawalInEth !== null) {
    amountSchema = amountSchema.gte(
      minWithdrawalInEth,
      'Below minimum withdrawal limit',
    );

    amountSchema = amountSchema.refine((value) => {
      const { withdrawalValue } = calcWithdrawalRepayRebalanceRatio(
        value,
        repayToken,
      );
      return withdrawalValue >= minWithdrawalInEth;
    }, 'Withdrawal amount minus the rebalanced value is less then minimum allowed withdrawable value');
  }

  return z.object({
    token: z.literal('ETH'),
    amount: amountSchema,
    repayToken: mintTokenSchema,
  });
};

export const WithdrawalFormResolver: Resolver<
  WithdrawalFormValues,
  WithdrawalFormValidationContextType,
  WithdrawalFormValidatedValues
> = async (values, context, options) => {
  invariant(context, '[WithdrawalFormResolver] context is undefined');

  const contextValue = await awaitWithTimeout(context.asyncContext, 4000);

  const schema = withdrawalFormValidationSchema(
    values.repayToken,
    contextValue,
  );

  return zodResolver<
    WithdrawalFormValues,
    unknown,
    WithdrawalFormValidatedValues
  >(schema)(values, context, options);
};
