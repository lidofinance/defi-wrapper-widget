export const STV_STETH_ABI = [
  {
    type: 'function',
    name: 'assetsOf',
    stateMutability: 'view',
    inputs: [{ name: '_account', type: 'address' }],
    outputs: [{ name: 'assets', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'mintedStethSharesOf',
    stateMutability: 'view',
    inputs: [{ name: '_account', type: 'address' }],
    outputs: [{ name: 'stethShares', type: 'uint256' }],
  },
] as const;
