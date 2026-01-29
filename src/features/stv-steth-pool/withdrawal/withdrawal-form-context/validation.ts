import { zodResolver } from '@hookform/resolvers/zod';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import {
  mintTokenSchema,
  tokenAmountSchema,
} from '@/shared/hook-form/validation';
import { awaitWithTimeout } from '@/utils/await-with-timeout';
import type {
  WithdrawalFormValidatedValues,
  WithdrawalFormValidationAsyncContextType,
  WithdrawalFormValidationContextType,
  WithdrawalFormValues,
} from './types';
import { getMinWithdrawalError } from '../utils/min-withdrawal-error';

import type { Resolver, ResolverResult } from 'react-hook-form';

export const withdrawalFormValidationSchema = ({
  balanceInEth,
  maxWithdrawalInEth,
  minWithdrawalInEth,
}: WithdrawalFormValidationAsyncContextType) => {
  let amountSchema = tokenAmountSchema(
    balanceInEth,
    maxWithdrawalInEth ?? undefined,
    'Exceeds maximum withdrawal limit',
  ).gte(100n, 'Minimum withdrawal is 100 wei');

  if (minWithdrawalInEth !== null) {
    amountSchema = amountSchema.gte(
      minWithdrawalInEth,
      'Below minimum withdrawal limit',
    );
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

  const schema = withdrawalFormValidationSchema(contextValue);

  const result = await zodResolver<
    WithdrawalFormValues,
    unknown,
    WithdrawalFormValidatedValues
  >(schema)(values, context, options);
  if (
    result.errors.amount ||
    !values.amount ||
    !contextValue.minWithdrawalValidationDeps
  ) {
    return result;
  }

  const { error } = await getMinWithdrawalError({
    amount: values.amount,
    repayToken: values.repayToken,
    ...contextValue.minWithdrawalValidationDeps,
  });

  if (!error) {
    return result;
  }

  return {
    ...result,
    errors: {
      ...result.errors,
      amount: {
        type: 'custom',
        message: error,
      },
    },
  } as ResolverResult<WithdrawalFormValues, WithdrawalFormValidatedValues>;
};
