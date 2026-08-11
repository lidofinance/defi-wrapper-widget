// Small ABI fragments needed only by the test harness (setup / teardown),
// not by the widget itself — e.g. AccessControl role management and
// WithdrawalQueue.finalize (an operator action, never called from the UI).
// src/AllowList.sol — addToAllowList requires the caller to already hold
// ALLOW_LIST_MANAGER_ROLE (granted directly to the timelock at
// initialize()-time via _initializeAllowList, both on the pool and on a
// strategy contract).
export const ALLOW_LIST_ABI = [
  {
    type: 'function',
    name: 'addToAllowList',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'isAllowListed',
    stateMutability: 'view',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

export const WITHDRAWAL_QUEUE_ABI = [
  {
    type: 'function',
    name: 'finalize',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'maxRequests', type: 'uint256' },
      { name: 'gasCostCoverageRecipient', type: 'address' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'FINALIZE_ROLE',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    type: 'function',
    name: 'withdrawalRequestsOf',
    stateMutability: 'view',
    inputs: [{ name: '_owner', type: 'address' }],
    outputs: [{ name: 'requestIds', type: 'uint256[]' }],
  },
  {
    type: 'function',
    name: 'getWithdrawalStatusBatch',
    stateMutability: 'view',
    inputs: [{ name: '_requestIds', type: 'uint256[]' }],
    outputs: [
      {
        name: 'statuses',
        type: 'tuple[]',
        components: [
          { name: 'amountOfStv', type: 'uint256' },
          { name: 'amountOfStethShares', type: 'uint256' },
          { name: 'amountOfAssets', type: 'uint256' },
          { name: 'owner', type: 'address' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'isFinalized', type: 'bool' },
          { name: 'isClaimed', type: 'bool' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'getClaimableEther',
    stateMutability: 'view',
    inputs: [{ name: '_requestId', type: 'uint256' }],
    outputs: [{ name: 'claimableEth', type: 'uint256' }],
  },
] as const;
