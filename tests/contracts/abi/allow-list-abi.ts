// addToAllowList requires ALLOW_LIST_MANAGER_ROLE, which initialize() grants to
// the timelock.
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
