import type { Token } from '@/types/token';
import type { withdrawalFormValidationSchema } from './validation';
import type z from 'zod';

// withdrawal can only be made in ETH
export type WithdrawalTokens = Extract<Token, 'ETH'>;

export type WithdrawalFormValidationAsyncContextType = {
  balanceInEth: bigint;

  maxWithdrawalInEth: bigint | null;
  minWithdrawalInEth: bigint | null; // Changed to bigint | null to match schema
};

export type WithdrawalFormValidationContextType = {
  asyncContext: Promise<WithdrawalFormValidationAsyncContextType>;
  isWalletConnected: boolean;
};

export type WithdrawalFormValidatedValues = z.infer<
  ReturnType<typeof withdrawalFormValidationSchema>
>;

export type WithdrawalFormValues = Omit<
  WithdrawalFormValidatedValues,
  'amount'
> & {
  amount: WithdrawalFormValidatedValues['amount'] | null;
};
