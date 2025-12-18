import type { Token } from '@/types/token';

// withdrawal can only be made in ETH
export type WithdrawalTokens = Extract<Token, 'ETH'>;

export type WithdrawalFormValidationAsyncContextType = {
  balanceInEth: bigint;

  maxWithdrawalInEth: bigint | null;
  minWithdrawalInEth: bigint;
};

export type WithdrawalFormValidationContextType = {
  asyncContext: Promise<WithdrawalFormValidationAsyncContextType>;
  isWalletConnected: boolean;
};

export type WithdrawalFormValues = {
  token: WithdrawalTokens;
  amount: bigint | null;
};

export type WithdrawalFormValidatedValues = {
  amount: NonNullable<WithdrawalFormValues['amount']>;
};
