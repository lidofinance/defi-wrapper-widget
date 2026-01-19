import invariant from 'tiny-invariant';

import { validateBigintMax } from '@/shared/hook-form/validation/validate-bigint-max';
import { validateBigintMin } from '@/shared/hook-form/validation/validate-bigint-min';
import { validateEtherAmount } from '@/shared/hook-form/validation/validate-ether-amount';
import { handleResolverValidationError } from '@/shared/hook-form/validation/validation-error';
import { awaitWithTimeout } from '@/utils/await-with-timeout';

import type {
  DepositFormValidatedValues,
  DepositFormValidationContextType,
  DepositFormValues,
} from './types';
import type { Resolver } from 'react-hook-form';

export const DepositFormResolver: Resolver<
  DepositFormValues,
  DepositFormValidationContextType,
  DepositFormValidatedValues
> = async (values, context) => {
  invariant(context, '[DepositFormResolver] context is undefined');
  try {
    validateEtherAmount('amount', values.amount, values.token);

    if (!context.isWalletConnected) {
      throw new Error('Wallet is not connected');
    }

    const contextValue = await awaitWithTimeout(context.asyncContext, 4000);

    const tokenData = contextValue.tokens[values.token];

    validateBigintMin(
      'amount',
      values.amount,
      100n,
      'Minimum deposit is 100 wei',
    );

    tokenData.maxDeposit !== null &&
      validateBigintMax(
        'amount',
        values.amount,
        tokenData.maxDeposit,
        'Exceeds maximum deposit limit',
      );

    validateBigintMax(
      'amount',
      values.amount,
      tokenData.balance,
      'Insufficient balance',
    );

    return {
      values: {
        ...values,
        amount: values.amount,
      },
      errors: {},
    };
  } catch (error) {
    return handleResolverValidationError(error, 'DepositForm', 'token');
  }
};
