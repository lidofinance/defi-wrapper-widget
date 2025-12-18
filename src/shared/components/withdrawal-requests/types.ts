import type { Token } from '@/types/token';

export type WithdrawalRequest = {
  id: bigint;
  isFinalized: boolean;
  isClaimed: boolean;
  amountOfAssets: bigint;
  timestamp?: bigint;
  token?: Token;
};

export type FinalizedWithdrawalRequest = WithdrawalRequest & {
  checkpointHint: bigint;
};
