export const LidoV3Abi = [
  {
    constant: true,
    inputs: [],
    name: 'getMaxMintableExternalShares',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'getExternalShares',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export type LidoV3AbiType = typeof LidoV3Abi;
