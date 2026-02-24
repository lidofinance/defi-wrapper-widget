import type { Abi } from 'viem';
import { erc20abi } from '@lidofinance/lido-ethereum-sdk';

export const WethABI = [
  ...erc20abi,
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
