import type { Token } from '@/types/token';

export type DepositTokens = Extract<Token, 'ETH' | 'WETH'>;
export type MintableTokens = Extract<Token, 'WSTETH' | 'STETH'>;

export type DepositFormValidationAsyncContextType = {
  tokens: {
    [key in DepositTokens]: { balance: bigint; maxDeposit: bigint | null };
  };
};

export type DepositFormValidationContextType = {
  asyncContext: Promise<DepositFormValidationAsyncContextType>;
  isWalletConnected: boolean;
};

export type DepositFormValues = {
  token: DepositTokens;
  amount: bigint | null;
  referral: string | null;
  tokenToMint: MintableTokens;
};

export type DepositFormValidatedValues = DepositFormValues & {
  amount: NonNullable<DepositFormValues['amount']>;
};
