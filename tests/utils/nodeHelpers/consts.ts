import { parseEther } from 'viem';

export const MIN_GAS_AMOUNT_BALANCE = parseEther('0.01');
export const IMPERSONATION_BALANCE = parseEther('100');
// Headroom for pending redeem batches already present on the fork.
export const MELLOW_VAULT_LIQUIDITY_TOP_UP = parseEther('1000');
