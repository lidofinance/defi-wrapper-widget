import type { Address } from 'viem';
import type { VaultReportType } from '@/modules/vaults';
import type { RegisteredPublicClient } from '@/modules/web3';
import type { Token } from '@/types/token';
import type { withdrawalFormValidationSchema } from './validation';
import type { WithdrawalQueueContract } from '../utils/min-withdrawal-error';
import type {
  RepayRebalanceWrapper,
  SharesContract,
  TokenContract,
} from '../utils/repay-rebalance';
import type z from 'zod';

// withdrawal can only be made in ETH
export type WithdrawalTokens = Extract<Token, 'ETH'>;
export type RepayTokens = Extract<Token, 'WSTETH' | 'STETH'>;

export type WithdrawalFormValidationAsyncContextType = {
  balanceInEth: bigint;
  maxWithdrawalInEth: bigint | null;
  minWithdrawalInEth: bigint | null;
  minWithdrawalValidationDeps?: {
    publicClient: RegisteredPublicClient;
    report: VaultReportType | null | undefined;
    wrapper: RepayRebalanceWrapper;
    withdrawalQueue: WithdrawalQueueContract;
    address: Address;
    shares: SharesContract;
    wstETH: TokenContract;
    stETH: TokenContract;
  };
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
