import { parseEther } from 'viem';

export const VAULTS_CONNECT_DEPOSIT = parseEther('1');
export const LAZY_ORACLE_ROOT_HASH_SLOT =
  '0xe5459f2b48ec5df2407caac4ec464a5cb0f7f31a1f22f649728a9579b25c1d00';

export const VAULT_REPORT_REFETCH_INTERVAL_MS = 60_000; // 1 minute

export const VAULT_TOTAL_BASIS_POINTS = 10_000;
export const VAULT_TOTAL_BASIS_POINTS_BN = 10_000n;

// forms validation values
export const MIN_FEE_VALUE = 0;
export const MAX_FEE_VALUE = 100;
export const MIN_CONFIRM_EXPIRY = 24;
export const MIN_CONFIRM_EXPIRY_SECONDS = 24 * 3600;
export const MAX_CONFIRM_EXPIRY = 24 * 30;
export const MAX_CONFIRM_EXPIRY_SECONDS = 24 * 30 * 3600;

export const DEFAULT_TIER_ID = 0n;
