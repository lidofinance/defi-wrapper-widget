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

// Deterministic account-index-per-role, ported from the pattern in
// lido-autotests/tests/vaults/testData/roles.data.ts. Indices are resolved
// against the live EthereumNodeService (source of truth for the fork's
// prefunded accounts) rather than re-deriving a mnemonic locally, so there's
// no risk of drifting from whatever derivation path Anvil actually used.
const ROLE_ACCOUNT_INDEX: Record<RoleName, number> = {
  poolCreator: 0,
  nodeOperator: 1,
  nodeOperatorManager: 2,
  emergencyCommittee: 3,
  timelockProposer: 4,
  timelockExecutor: 4,
  depositor: 5,
};

export const getRoleSigner = (
  nodeService: EthereumNodeService,
  role: RoleName,
) => {
  const { secretKey } = nodeService.getAccount(ROLE_ACCOUNT_INDEX[role]);
  return privateKeyToAccount(secretKey as `0x${string}`);
};

export const getRoleAddress = (
  nodeService: EthereumNodeService,
  role: RoleName,
) => nodeService.getAccount(ROLE_ACCOUNT_INDEX[role]).address as `0x${string}`;

export const getRoleAccounts = (nodeService: EthereumNodeService) =>
  [...new Set(Object.values(ROLE_ACCOUNT_INDEX))].map((accountIndex) =>
    nodeService.getAccount(accountIndex),
  );
