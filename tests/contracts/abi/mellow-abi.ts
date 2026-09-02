// Mellow Oracle test subset.
export const MELLOW_ORACLE_ABI = [
  {
    type: 'function',
    name: 'SUBMIT_REPORTS_ROLE',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    type: 'function',
    name: 'SET_SECURITY_PARAMS_ROLE',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    type: 'function',
    name: 'securityParams',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'maxAbsoluteDeviation', type: 'uint224' },
          { name: 'suspiciousAbsoluteDeviation', type: 'uint224' },
          { name: 'maxRelativeDeviationD18', type: 'uint64' },
          { name: 'suspiciousRelativeDeviationD18', type: 'uint64' },
          { name: 'timeout', type: 'uint32' },
          { name: 'depositInterval', type: 'uint32' },
          { name: 'redeemInterval', type: 'uint32' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'setSecurityParams',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'securityParams_',
        type: 'tuple',
        components: [
          { name: 'maxAbsoluteDeviation', type: 'uint224' },
          { name: 'suspiciousAbsoluteDeviation', type: 'uint224' },
          { name: 'maxRelativeDeviationD18', type: 'uint64' },
          { name: 'suspiciousRelativeDeviationD18', type: 'uint64' },
          { name: 'timeout', type: 'uint32' },
          { name: 'depositInterval', type: 'uint32' },
          { name: 'redeemInterval', type: 'uint32' },
        ],
      },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getReport',
    stateMutability: 'view',
    inputs: [{ name: 'asset', type: 'address' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'priceD18', type: 'uint224' },
          { name: 'timestamp', type: 'uint32' },
          { name: 'isSuspicious', type: 'bool' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'submitReports',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'reports',
        type: 'tuple[]',
        components: [
          { name: 'asset', type: 'address' },
          { name: 'priceD18', type: 'uint224' },
        ],
      },
    ],
    outputs: [],
  },
] as const;

// Mellow vault access-control subset.
export const MELLOW_VAULT_ABI = [
  {
    type: 'function',
    name: 'getRoleMember',
    stateMutability: 'view',
    inputs: [
      { name: 'role', type: 'bytes32' },
      { name: 'index', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'function',
    name: 'getRoleMemberCount',
    stateMutability: 'view',
    inputs: [{ name: 'role', type: 'bytes32' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'grantRole',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'role', type: 'bytes32' },
      { name: 'account', type: 'address' },
    ],
    outputs: [],
  },
] as const;

// Mellow redeem queue test subset.
export const MELLOW_REDEEM_QUEUE_ABI = [
  {
    type: 'function',
    name: 'handleBatches',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'batches', type: 'uint256' }],
    outputs: [{ name: 'counter', type: 'uint256' }],
  },
] as const;

// Single-transaction ETH to wstETH conversion.
export const WSTETH_REFERRAL_STAKER_ABI = [
  {
    type: 'function',
    name: 'stakeETH',
    stateMutability: 'payable',
    inputs: [{ name: '_referral', type: 'address' }],
    outputs: [],
  },
] as const;

// MellowStrategy assertion subset.
export const MELLOW_STRATEGY_READ_ABI = [
  {
    type: 'function',
    name: 'getDepositRequestOf',
    stateMutability: 'view',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [
      { name: 'assets', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'isClaimable', type: 'bool' },
    ],
  },
  {
    type: 'function',
    name: 'sharesOf',
    stateMutability: 'view',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [{ name: 'shares', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'claimableSharesOf',
    stateMutability: 'view',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [{ name: 'shares', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'activeSharesOf',
    stateMutability: 'view',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [{ name: 'shares', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'stvOf',
    stateMutability: 'view',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [{ name: 'stv', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'wstethOf',
    stateMutability: 'view',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [{ name: 'wsteth', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'mintedStethSharesOf',
    stateMutability: 'view',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [{ name: 'mintedStethShares', type: 'uint256' }],
  },
  // Redeem requests are separate from async-deposit claimable shares.
  {
    type: 'function',
    name: 'getRedeemQueueRequests',
    stateMutability: 'view',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'offset', type: 'uint256' },
      { name: 'limit', type: 'uint256' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'timestamp', type: 'uint256' },
          { name: 'shares', type: 'uint256' },
          { name: 'isClaimable', type: 'bool' },
          { name: 'assets', type: 'uint256' },
        ],
      },
    ],
  },
] as const;
