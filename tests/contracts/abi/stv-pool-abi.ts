export const STV_POOL_ABI = [
  {
    type: 'function',
    name: 'assetsOf',
    stateMutability: 'view',
    inputs: [{ name: '_account', type: 'address' }],
    outputs: [{ name: 'assets', type: 'uint256' }],
  },
] as const;
