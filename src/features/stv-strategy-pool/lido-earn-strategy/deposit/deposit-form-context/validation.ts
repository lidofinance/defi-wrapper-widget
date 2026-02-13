import { zodResolver } from '@hookform/resolvers/zod';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import {
  depositTokenSchema,
  tokenAmountSchema,
} from '@/shared/hook-form/validation';
import { awaitWithTimeout } from '@/utils/await-with-timeout';

import type {
  DepositFormValidatedValues,
  DepositFormValidationAsyncContextType,
  DepositFormValidationContextType,
  DepositFormValues,
} from './types';
import type { Resolver } from 'react-hook-form';

type DepositFormValidationSchemaParams =
  DepositFormValidationAsyncContextType & {
    depositToken: z.infer<typeof depositTokenSchema>;
  };

export const depositFormValidationSchema = ({
  depositToken,
  tokens,
}: DepositFormValidationSchemaParams) => {
  const { balance, maxDeposit } = tokens[depositToken];

  return z.object({
    token: depositTokenSchema,
    amount: tokenAmountSchema(
      balance,
      maxDeposit ?? undefined,
      'Exceeds maximum deposit limit',
    ).gte(100n, 'Minimum deposit is 100 wei'),
    referral: z.string().nullable(),
  });
};

export const DepositFormResolver: Resolver<
  DepositFormValues,
  DepositFormValidationContextType,
  DepositFormValidatedValues
> = async (values, context, options) => {
  invariant(context, '[DepositFormResolver] context is undefined');
  const contextValue = await awaitWithTimeout(context.asyncContext, 4000);

  const schema = depositFormValidationSchema({
    ...contextValue,
    depositToken: values.token,
  });

  return zodResolver<DepositFormValues, unknown, DepositFormValidatedValues>(
    schema,
  )(values, context, options);
};
