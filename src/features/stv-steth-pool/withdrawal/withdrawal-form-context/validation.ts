import invariant from 'tiny-invariant';
import { validateBigintMax } from '@/shared/hook-form/validation/validate-bigint-max';
import { validateBigintMin } from '@/shared/hook-form/validation/validate-bigint-min';
import { validateEtherAmount } from '@/shared/hook-form/validation/validate-ether-amount';
import { handleResolverValidationError } from '@/shared/hook-form/validation/validation-error';
import { awaitWithTimeout } from '@/utils/await-with-timeout';
import type {
  WithdrawalFormValidatedValues,
  WithdrawalFormValidationContextType,
  WithdrawalFormValues,
} from './types';
import type { Resolver } from 'react-hook-form';

export const WithdrawalFormResolver: Resolver<
  WithdrawalFormValues,
  WithdrawalFormValidationContextType,
  WithdrawalFormValidatedValues
> = async (values, context) => {
  invariant(context, '[WithdrawalFormResolver] context is undefined');
  try {
    validateEtherAmount('amount', values.amount, 'ETH');

    if (!context.isWalletConnected) {
      throw new Error('Wallet is not connected');
    }

    const contextValue = await awaitWithTimeout(context.asyncContext, 4000);

    validateBigintMin(
      'amount',
      values.amount,
      100n,
      'Minimum withdrawal is 100 wei',
    );
    validateBigintMax(
      'amount',
      values.amount,
      contextValue.balanceInEth,
      'Insufficient balance',
    );

    contextValue.maxWithdrawalInEth !== null &&
      validateBigintMax(
        'amount',
        values.amount,
        contextValue.maxWithdrawalInEth,
        'Exceeds maximum withdrawal limit',
      );

    contextValue.minWithdrawalInEth !== null &&
      validateBigintMin(
        'amount',
        values.amount,
        contextValue.minWithdrawalInEth,
        'Exceeds minimum withdrawal limit',
      );

    return {
      values: {
        ...values,
        amount: values.amount,
      },
      errors: {},
    };
  } catch (error) {
    return handleResolverValidationError(error, 'WithdrawalForm', 'token');
  }
};
