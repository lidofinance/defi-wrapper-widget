// Core Lido ABIs, only the parts needed to inject and refresh oracle reports on
// the fork. Source: vaults-wrapper/test/utils/CoreHarness.sol.
export const LIDO_LOCATOR_ABI = [
  {
    type: 'function',
    name: 'accountingOracle',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'function',
    name: 'vaultHub',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'function',
    name: 'lazyOracle',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'function',
    name: 'lido',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

export const DASHBOARD_ABI = [
  {
    type: 'function',
    name: 'totalValue',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export const BASE_ORACLE_ABI = [
  {
    type: 'function',
    name: 'getConsensusContract',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

export const HASH_CONSENSUS_ABI = [
  {
    type: 'function',
    name: 'getCurrentFrame',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'refSlot', type: 'uint256' },
      { name: 'reportProcessingDeadlineSlot', type: 'uint256' },
    ],
  },
] as const;

export const LAZY_ORACLE_ABI = [
  {
    type: 'function',
    name: 'updateReportData',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_vaultsDataTimestamp', type: 'uint256' },
      { name: '_vaultsDataRefSlot', type: 'uint256' },
      { name: '_vaultsDataTreeRoot', type: 'bytes32' },
      { name: '_vaultsDataReportCid', type: 'string' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'updateVaultData',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_vault', type: 'address' },
      { name: '_totalValue', type: 'uint256' },
      { name: '_cumulativeLidoFees', type: 'uint256' },
      { name: '_liabilityShares', type: 'uint256' },
      { name: '_maxLiabilityShares', type: 'uint256' },
      { name: '_slashingReserve', type: 'uint256' },
      { name: '_proof', type: 'bytes32[]' },
    ],
    outputs: [],
  },
] as const;

export const VAULT_HUB_ABI = [
  {
    type: 'function',
    name: 'vaultRecord',
    stateMutability: 'view',
    inputs: [{ name: '_vault', type: 'address' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          {
            name: 'report',
            type: 'tuple',
            components: [
              { name: 'totalValue', type: 'uint104' },
              { name: 'inOutDelta', type: 'int104' },
              { name: 'timestamp', type: 'uint48' },
            ],
          },
          { name: 'maxLiabilityShares', type: 'uint96' },
          { name: 'liabilityShares', type: 'uint96' },
        ],
      },
    ],
  },
] as const;
