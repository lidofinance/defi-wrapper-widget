// getPooledEthByShares/getSharesByPooledEth ported from
// lido-autotests/tests/vaults/contracts/abi/stethAbi.ts; balanceOf added
// (standard ERC20) since the E2E suite needs to assert the depositor's
// minted stETH balance.
export const STETH_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: '_sharesAmount', type: 'uint256' },
    ],
    name: 'getPooledEthByShares',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_ethAmount', type: 'uint256' }],
    name: 'getSharesByPooledEth',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_account', type: 'address' }],
    name: 'sharesOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
