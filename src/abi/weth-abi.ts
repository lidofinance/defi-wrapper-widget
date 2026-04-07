import { erc20Abi, type Abi } from 'viem';

export const WethABI = [
  ...erc20Abi,
  {
    constant: false,
    inputs: [
      {
        name: 'wad',
        type: 'uint256',
      },
    ],
    name: 'withdraw',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const satisfies Abi;

export type WethABIType = typeof WethABI;
