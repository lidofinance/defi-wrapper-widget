import type { Address } from 'viem';
import { LidoSDKShares } from '@lidofinance/lido-ethereum-sdk';
import {
  LidoSDKstETH,
  LidoSDKwstETH,
} from '@lidofinance/lido-ethereum-sdk/erc20';
import { useStvSteth } from '@/modules/defi-wrapper';
import type { VaultReportType } from '@/modules/vaults';
import type { RegisteredPublicClient } from '@/modules/web3';
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
  minWithdrawalValidationDeps?: {
    publicClient: RegisteredPublicClient;
    report: VaultReportType | null | undefined;
    wrapper: ReturnType<typeof useStvSteth>['wrapper'];
    address: Address;
    shares: LidoSDKShares;
    wstETH: LidoSDKwstETH;
    stETH: LidoSDKstETH;
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
