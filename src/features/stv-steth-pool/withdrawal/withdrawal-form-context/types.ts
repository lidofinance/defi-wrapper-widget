import type { Token } from '@/types/token';

// withdrawal can only be made in ETH
export type WithdrawalTokens = Extract<Token, 'ETH'>;
export type RepayTokens = Extract<Token, 'WSTETH' | 'STETH'>;

export type WithdrawalFormValidationAsyncContextType = {
  balanceInEth: bigint;

  maxWithdrawalInEth: bigint;
  minWithdrawalInEth: bigint;
};

export type WithdrawalFormValidationContextType = {
  asyncContext: Promise<WithdrawalFormValidationAsyncContextType>;
  isWalletConnected: boolean;
};

export type WithdrawalFormValues = {
  token: WithdrawalTokens;
  amount: bigint | null;
  repayToken: RepayTokens;
};

export type WithdrawalFormValidatedValues = {
  amount: NonNullable<WithdrawalFormValues['amount']>;
  repayToken: RepayTokens;
};
