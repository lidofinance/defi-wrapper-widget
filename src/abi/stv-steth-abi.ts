import { StvPoolAbi } from './stv-pool-abi';

export const StvStethAbi = [
  ...StvPoolAbi,
  {
    type: 'function',
    name: 'MINTING_FEATURE',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'burnStethShares',
    inputs: [
      {
        name: '_stethShares',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'burnWsteth',
    inputs: [
      {
        name: '_wsteth',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'calcAssetsToLockForStethShares',
    inputs: [
      {
        name: '_stethShares',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'assetsToLock',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'calcStethSharesToMintForAssets',
    inputs: [
      {
        name: '_assets',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'stethShares',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'depositETHAndMintStethShares',
    inputs: [
      {
        name: '_referral',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_stethSharesToMint',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'stv',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'depositETHAndMintWsteth',
    inputs: [
      {
        name: '_referral',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_wstethToMint',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'stv',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'mintStethShares',
    inputs: [
      {
        name: '_stethShares',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'mintWsteth',
    inputs: [
      {
        name: '_wsteth',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'mintedStethSharesOf',
    inputs: [
      {
        name: '_account',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'stethShares',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'poolReserveRatioBP',
    inputs: [],
    outputs: [
      {
        name: 'reserveRatio',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'remainingMintingCapacitySharesOf',
    inputs: [
      {
        name: '_account',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_ethToFund',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'stethShares',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalMintingCapacitySharesOf',
    inputs: [
      {
        name: '_account',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'stethShares',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'unlockedAssetsOf',
    inputs: [
      {
        name: '_account',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_stethSharesToBurn',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'assets',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'unlockedStvOf',
    inputs: [
      {
        name: '_account',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_stethSharesToBurn',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'stv',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'error',
    name: 'CannotRebalanceWithdrawalQueue',
    inputs: [],
  },
  {
    type: 'error',
    name: 'CollateralizedAccount',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ExcessiveLossSocialization',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientBalance',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientExceedingShares',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientMintedShares',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientMintingCapacity',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientReservedBalance',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientStethShares',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientStv',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidValue',
    inputs: [],
  },
  {
    type: 'error',
    name: 'SameValue',
    inputs: [],
  },
  {
    type: 'error',
    name: 'UndercollateralizedAccount',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ZeroArgument',
    inputs: [],
  },
] as const;

export type StvStethAbiType = typeof StvStethAbi;
