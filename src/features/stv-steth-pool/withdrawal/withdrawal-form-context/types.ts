import type { CalcWithdrawalRepayRebalanceRatio } from '@/modules/defi-wrapper';
import type { Token } from '@/types/token';
import type { withdrawalFormValidationSchema } from './validation';
import type z from 'zod';

// withdrawal can only be made in ETH
export type WithdrawalTokens = Extract<Token, 'ETH'>;
export type RepayTokens = Extract<Token, 'WSTETH' | 'STETH'>;

export type WithdrawalFormValidationAsyncContextType = {
  balanceInEth: bigint;
  maxWithdrawalInEth: bigint | null;
  minWithdrawalInEth: bigint | null;
  calcWithdrawalRepayRebalanceRatio: CalcWithdrawalRepayRebalanceRatio;
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
