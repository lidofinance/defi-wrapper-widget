// Minimal Factory ABI (createPoolStvStart / createPoolStvStETHStart /
// createPoolStart / createPoolFinish) extracted from
// vaults-wrapper/out/Factory.sol/Factory.json.
export const FACTORY_ABI = [
  {
    type: 'event',
    name: 'PoolCreationStarted',
    inputs: [
      { name: 'sender', type: 'address', indexed: true },
      {
        name: 'vaultConfig',
        type: 'tuple',
        components: [
          { name: 'nodeOperator', type: 'address' },
          { name: 'nodeOperatorManager', type: 'address' },
          { name: 'nodeOperatorFeeBP', type: 'uint256' },
          { name: 'confirmExpiry', type: 'uint256' },
        ],
      },
      {
        name: 'commonPoolConfig',
        type: 'tuple',
        components: [
          { name: 'minWithdrawalDelayTime', type: 'uint256' },
          { name: 'name', type: 'string' },
          { name: 'symbol', type: 'string' },
          { name: 'emergencyCommittee', type: 'address' },
        ],
      },
      {
        name: 'auxiliaryConfig',
        type: 'tuple',
        components: [
          { name: 'allowListEnabled', type: 'bool' },
          { name: 'allowListManager', type: 'address' },
          { name: 'mintingEnabled', type: 'bool' },
          { name: 'reserveRatioGapBP', type: 'uint256' },
        ],
      },
      {
        name: 'timelockConfig',
        type: 'tuple',
        components: [
          { name: 'minDelaySeconds', type: 'uint256' },
          { name: 'proposer', type: 'address' },
          { name: 'executor', type: 'address' },
        ],
      },
      { name: 'strategyFactory', type: 'address', indexed: true },
      { name: 'strategyDeployBytes', type: 'bytes' },
      {
        name: 'intermediate',
        type: 'tuple',
        components: [
          { name: 'dashboard', type: 'address' },
          { name: 'poolProxy', type: 'address' },
          { name: 'poolImpl', type: 'address' },
          { name: 'withdrawalQueueProxy', type: 'address' },
          { name: 'wqImpl', type: 'address' },
          { name: 'timelock', type: 'address' },
        ],
      },
      { name: 'finishDeadline', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'PoolCreated',
    inputs: [
      { name: 'vault', type: 'address', indexed: false },
      { name: 'pool', type: 'address', indexed: false },
      { name: 'poolType', type: 'bytes32', indexed: true },
      { name: 'withdrawalQueue', type: 'address', indexed: false },
      { name: 'strategyFactory', type: 'address', indexed: true },
      { name: 'strategyDeployBytes', type: 'bytes', indexed: false },
      { name: 'strategy', type: 'address', indexed: false },
    ],
  },
  {
    type: 'function',
    name: 'createPoolStvStart',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: '_vaultConfig',
        type: 'tuple',
        internalType: 'struct Factory.VaultConfig',
        components: [
          { name: 'nodeOperator', type: 'address' },
          { name: 'nodeOperatorManager', type: 'address' },
          { name: 'nodeOperatorFeeBP', type: 'uint256' },
          { name: 'confirmExpiry', type: 'uint256' },
        ],
      },
      {
        name: '_timelockConfig',
        type: 'tuple',
        internalType: 'struct Factory.TimelockConfig',
        components: [
          { name: 'minDelaySeconds', type: 'uint256' },
          { name: 'proposer', type: 'address' },
          { name: 'executor', type: 'address' },
        ],
      },
      {
        name: '_commonPoolConfig',
        type: 'tuple',
        internalType: 'struct Factory.CommonPoolConfig',
        components: [
          { name: 'minWithdrawalDelayTime', type: 'uint256' },
          { name: 'name', type: 'string' },
          { name: 'symbol', type: 'string' },
          { name: 'emergencyCommittee', type: 'address' },
        ],
      },
      { name: '_allowListEnabled', type: 'bool' },
      { name: '_allowListManager', type: 'address' },
    ],
    outputs: [
      {
        name: 'intermediate',
        type: 'tuple',
        internalType: 'struct Factory.PoolIntermediate',
        components: [
          { name: 'dashboard', type: 'address' },
          { name: 'poolProxy', type: 'address' },
          { name: 'poolImpl', type: 'address' },
          { name: 'withdrawalQueueProxy', type: 'address' },
          { name: 'wqImpl', type: 'address' },
          { name: 'timelock', type: 'address' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'createPoolStvStETHStart',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: '_vaultConfig',
        type: 'tuple',
        internalType: 'struct Factory.VaultConfig',
        components: [
          { name: 'nodeOperator', type: 'address' },
          { name: 'nodeOperatorManager', type: 'address' },
          { name: 'nodeOperatorFeeBP', type: 'uint256' },
          { name: 'confirmExpiry', type: 'uint256' },
        ],
      },
      {
        name: '_timelockConfig',
        type: 'tuple',
        internalType: 'struct Factory.TimelockConfig',
        components: [
          { name: 'minDelaySeconds', type: 'uint256' },
          { name: 'proposer', type: 'address' },
          { name: 'executor', type: 'address' },
        ],
      },
      {
        name: '_commonPoolConfig',
        type: 'tuple',
        internalType: 'struct Factory.CommonPoolConfig',
        components: [
          { name: 'minWithdrawalDelayTime', type: 'uint256' },
          { name: 'name', type: 'string' },
          { name: 'symbol', type: 'string' },
          { name: 'emergencyCommittee', type: 'address' },
        ],
      },
      { name: '_allowListEnabled', type: 'bool' },
      { name: '_allowListManager', type: 'address' },
      { name: '_reserveRatioGapBP', type: 'uint256' },
    ],
    outputs: [
      {
        name: 'intermediate',
        type: 'tuple',
        internalType: 'struct Factory.PoolIntermediate',
        components: [
          { name: 'dashboard', type: 'address' },
          { name: 'poolProxy', type: 'address' },
          { name: 'poolImpl', type: 'address' },
          { name: 'withdrawalQueueProxy', type: 'address' },
          { name: 'wqImpl', type: 'address' },
          { name: 'timelock', type: 'address' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'createPoolStart',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: '_vaultConfig',
        type: 'tuple',
        internalType: 'struct Factory.VaultConfig',
        components: [
          { name: 'nodeOperator', type: 'address' },
          { name: 'nodeOperatorManager', type: 'address' },
          { name: 'nodeOperatorFeeBP', type: 'uint256' },
          { name: 'confirmExpiry', type: 'uint256' },
        ],
      },
      {
        name: '_timelockConfig',
        type: 'tuple',
        internalType: 'struct Factory.TimelockConfig',
        components: [
          { name: 'minDelaySeconds', type: 'uint256' },
          { name: 'proposer', type: 'address' },
          { name: 'executor', type: 'address' },
        ],
      },
      {
        name: '_commonPoolConfig',
        type: 'tuple',
        internalType: 'struct Factory.CommonPoolConfig',
        components: [
          { name: 'minWithdrawalDelayTime', type: 'uint256' },
          { name: 'name', type: 'string' },
          { name: 'symbol', type: 'string' },
          { name: 'emergencyCommittee', type: 'address' },
        ],
      },
      {
        name: '_auxiliaryConfig',
        type: 'tuple',
        internalType: 'struct Factory.AuxiliaryPoolConfig',
        components: [
          { name: 'allowListEnabled', type: 'bool' },
          { name: 'allowListManager', type: 'address' },
          { name: 'mintingEnabled', type: 'bool' },
          { name: 'reserveRatioGapBP', type: 'uint256' },
        ],
      },
      { name: '_strategyFactory', type: 'address' },
      { name: '_strategyDeployBytes', type: 'bytes' },
    ],
    outputs: [
      {
        name: 'intermediate',
        type: 'tuple',
        internalType: 'struct Factory.PoolIntermediate',
        components: [
          { name: 'dashboard', type: 'address' },
          { name: 'poolProxy', type: 'address' },
          { name: 'poolImpl', type: 'address' },
          { name: 'withdrawalQueueProxy', type: 'address' },
          { name: 'wqImpl', type: 'address' },
          { name: 'timelock', type: 'address' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'createPoolFinish',
    stateMutability: 'payable',
    inputs: [
      {
        name: '_vaultConfig',
        type: 'tuple',
        internalType: 'struct Factory.VaultConfig',
        components: [
          { name: 'nodeOperator', type: 'address' },
          { name: 'nodeOperatorManager', type: 'address' },
          { name: 'nodeOperatorFeeBP', type: 'uint256' },
          { name: 'confirmExpiry', type: 'uint256' },
        ],
      },
      {
        name: '_timelockConfig',
        type: 'tuple',
        internalType: 'struct Factory.TimelockConfig',
        components: [
          { name: 'minDelaySeconds', type: 'uint256' },
          { name: 'proposer', type: 'address' },
          { name: 'executor', type: 'address' },
        ],
      },
      {
        name: '_commonPoolConfig',
        type: 'tuple',
        internalType: 'struct Factory.CommonPoolConfig',
        components: [
          { name: 'minWithdrawalDelayTime', type: 'uint256' },
          { name: 'name', type: 'string' },
          { name: 'symbol', type: 'string' },
          { name: 'emergencyCommittee', type: 'address' },
        ],
      },
      {
        name: '_auxiliaryConfig',
        type: 'tuple',
        internalType: 'struct Factory.AuxiliaryPoolConfig',
        components: [
          { name: 'allowListEnabled', type: 'bool' },
          { name: 'allowListManager', type: 'address' },
          { name: 'mintingEnabled', type: 'bool' },
          { name: 'reserveRatioGapBP', type: 'uint256' },
        ],
      },
      { name: '_strategyFactory', type: 'address' },
      { name: '_strategyDeployBytes', type: 'bytes' },
      {
        name: '_intermediate',
        type: 'tuple',
        internalType: 'struct Factory.PoolIntermediate',
        components: [
          { name: 'dashboard', type: 'address' },
          { name: 'poolProxy', type: 'address' },
          { name: 'poolImpl', type: 'address' },
          { name: 'withdrawalQueueProxy', type: 'address' },
          { name: 'wqImpl', type: 'address' },
          { name: 'timelock', type: 'address' },
        ],
      },
    ],
    outputs: [
      {
        name: 'deployment',
        type: 'tuple',
        internalType: 'struct Factory.PoolDeployment',
        components: [
          { name: 'poolType', type: 'bytes32' },
          { name: 'vault', type: 'address' },
          { name: 'dashboard', type: 'address' },
          { name: 'pool', type: 'address' },
          { name: 'withdrawalQueue', type: 'address' },
          { name: 'distributor', type: 'address' },
          { name: 'timelock', type: 'address' },
          { name: 'strategy', type: 'address' },
        ],
      },
    ],
  },
  // Custom errors from Factory.sol + anything a strategy factory's deploy()
  // call can bubble up (MellowStrategy.sol) — included so viem can decode a
  // revert during createPoolFinish (which calls IStrategyFactory.deploy())
  // instead of reporting an opaque "execution reverted".
  {
    type: 'error',
    name: 'InvalidConfiguration',
    inputs: [{ name: 'reason', type: 'string' }],
  },
  {
    type: 'error',
    name: 'InsufficientConnectDeposit',
    inputs: [
      { name: 'provided', type: 'uint256' },
      { name: 'required', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'ZeroArgument',
    inputs: [{ name: 'name', type: 'string' }],
  },
  {
    type: 'error',
    name: 'InvalidQueue',
    inputs: [{ name: 'name', type: 'string' }],
  },
  { type: 'error', name: 'InsufficientMellowShares', inputs: [] },
  { type: 'error', name: 'WithdrawalFailed', inputs: [] },
  { type: 'error', name: 'RedeemFailed', inputs: [] },
  { type: 'error', name: 'SupplyFailed', inputs: [] },
  { type: 'error', name: 'NoAsyncDepositQueue', inputs: [] },
] as const;

export const STV_POOL_DISTRIBUTOR_ABI = [
  {
    type: 'function',
    name: 'DISTRIBUTOR',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;
