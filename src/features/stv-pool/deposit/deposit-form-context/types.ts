import type { DEPOSIT_TOKENS_VALUE_TYPE } from '@/shared/hook-form/validation';
import type { depositFormValidationSchema } from './validation';
import type z from 'zod';

export type DepositFormValidationAsyncContextType = {
  tokens: {
    [key in DEPOSIT_TOKENS_VALUE_TYPE]: {
      balance: bigint;
      maxDeposit: bigint | null;
    };
  };
};

export type DepositFormValidationContextType = {
  asyncContext: Promise<DepositFormValidationAsyncContextType>;
  isWalletConnected: boolean;
};

export type DepositFormValidatedValues = z.infer<
  ReturnType<typeof depositFormValidationSchema>
>;

export type DepositFormValues = Omit<DepositFormValidatedValues, 'amount'> & {
  amount: DepositFormValidatedValues['amount'] | null;
};
