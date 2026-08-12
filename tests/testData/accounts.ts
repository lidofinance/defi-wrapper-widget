import type { Account, Address, Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import type { EthereumNodeService } from '@lidofinance/wallets-testing-nodes';

export type RoleName =
  | 'poolCreator'
  | 'nodeOperator'
  | 'nodeOperatorManager'
  | 'emergencyCommittee'
  | 'timelockProposer'
  | 'timelockExecutor'
  | 'depositor';

// Role → account index, resolved against the live EthereumNodeService rather
// than a locally re-derived mnemonic, which could drift from Anvil's.
const ROLE_ACCOUNT_INDEX: Record<RoleName, number> = {
  poolCreator: 0,
  nodeOperator: 1,
  nodeOperatorManager: 2,
  emergencyCommittee: 3,
  // Same account: the happy-path suite never needs propose and execute to be
  // distinct signers.
  timelockProposer: 4,
  timelockExecutor: 4,
  depositor: 5,
};

export const getRoleSigner = (
  nodeService: EthereumNodeService,
  role: RoleName,
): Account => {
  const { secretKey } = nodeService.getAccount(ROLE_ACCOUNT_INDEX[role]);
  return privateKeyToAccount(secretKey as Hex);
};

export const getRoleAddress = (
  nodeService: EthereumNodeService,
  role: RoleName,
): Address =>
  nodeService.getAccount(ROLE_ACCOUNT_INDEX[role]).address as Address;

export const getRoleAccounts = (nodeService: EthereumNodeService) =>
  [...new Set(Object.values(ROLE_ACCOUNT_INDEX))].map((accountIndex) =>
    nodeService.getAccount(accountIndex),
  );
