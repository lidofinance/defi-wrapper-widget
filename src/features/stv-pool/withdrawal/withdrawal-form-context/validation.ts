import { zodResolver } from '@hookform/resolvers/zod';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import { ASYNC_FORM_CONTEXT_TIMEOUT } from '@/consts/form';
import { tokenAmountSchema } from '@/shared/hook-form/validation';
import { awaitWithTimeout } from '@/utils/await-with-timeout';

import type {
  WithdrawalFormValidatedValues,
  WithdrawalFormValidationAsyncContextType,
  WithdrawalFormValidationContextType,
  WithdrawalFormValues,
} from './types';
import type { Resolver } from 'react-hook-form';

export const withdrawalFormValidationSchema = ({
  balanceInEth,
  maxWithdrawalInEth,
  minWithdrawalInEth,
}: WithdrawalFormValidationAsyncContextType) => {
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
  }

  return z.object({
    token: z.literal('ETH'),
    amount: amountSchema,
  });
};

export const WithdrawalFormResolver: Resolver<
  WithdrawalFormValues,
  WithdrawalFormValidationContextType,
  WithdrawalFormValidatedValues
> = async (values, context, options) => {
  invariant(context, '[WithdrawalFormResolver] context is undefined');

  const contextValue = await awaitWithTimeout(
    context.asyncContext,
    ASYNC_FORM_CONTEXT_TIMEOUT,
  );

  const schema = withdrawalFormValidationSchema(contextValue);

  return zodResolver<
    WithdrawalFormValues,
    unknown,
    WithdrawalFormValidatedValues
  >(schema)(values, context, options);
};
