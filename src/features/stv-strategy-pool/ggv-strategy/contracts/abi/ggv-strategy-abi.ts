export const GgvStrategyAbi = [
  {
    type: 'function',
    name: 'BORING_QUEUE',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IBoringOnChainQueue',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'TELLER',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract ITellerWithMultiAssetSupport',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'WSTETH',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IWstETH',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'burnWsteth',
    inputs: [
      {
        name: '_wstethToBurn',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'cancelGGVOnChainWithdraw',
    inputs: [
      {
        name: '_request',
        type: 'tuple',
        internalType: 'struct IBoringOnChainQueue.OnChainWithdraw',
        components: [
          {
            name: 'nonce',
            type: 'uint96',
            internalType: 'uint96',
          },
          {
            name: 'user',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'assetOut',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'amountOfShares',
            type: 'uint128',
            internalType: 'uint128',
          },
          {
            name: 'amountOfAssets',
            type: 'uint128',
            internalType: 'uint128',
          },
          {
            name: 'creationTime',
            type: 'uint40',
            internalType: 'uint40',
          },
          {
            name: 'secondsToMaturity',
            type: 'uint24',
            internalType: 'uint24',
          },
          {
            name: 'secondsToDeadline',
            type: 'uint24',
            internalType: 'uint24',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getStrategyCallForwarderAddress',
    inputs: [
      {
        name: '_user',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'callForwarder',
        type: 'address',
        internalType: 'contract IStrategyCallForwarder',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'ggvOf',
    inputs: [
      {
        name: '_user',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'ggvShares',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'mintedStethSharesOf',
    inputs: [
      {
        name: '_user',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'mintedStethShares',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'previewWstethByGGV',
    inputs: [
      {
        name: '_ggvShares',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_params',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: 'wsteth',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'requestExitByWsteth',
    inputs: [
      {
        name: '_wsteth',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_params',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: 'requestId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'requestWithdrawalFromPool',
    inputs: [
      {
        name: '_recipient',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_stvToWithdraw',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_stethSharesToRebalance',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'requestId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'safeTransferERC20',
    inputs: [
      {
        name: '_token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_recipient',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_amount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'supply',
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
      {
        name: '_params',
        type: 'bytes',
        internalType: 'bytes',
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
    name: 'wstethOf',
    inputs: [
      {
        name: '_user',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'wsteth',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'error',
    name: 'AccessControlBadConfirmation',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AccessControlUnauthorizedAccount',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'neededRole',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
  },
  {
    type: 'error',
    name: 'CallForwarderZeroArgument',
    inputs: [
      {
        name: 'name',
        type: 'string',
        internalType: 'string',
      },
    ],
  },
  {
    type: 'error',
    name: 'FailedDeployment',
    inputs: [],
  },
  {
    type: 'error',
    name: 'FeaturePauseEnforced',
    inputs: [
      {
        name: 'featureId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
  },
  {
    type: 'error',
    name: 'FeaturePauseExpected',
    inputs: [
      {
        name: 'featureId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
  },
  {
    type: 'error',
    name: 'InsufficientBalance',
    inputs: [
      {
        name: 'balance',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'needed',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'InsufficientWsteth',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidInitialization',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidSender',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidWstethAmount',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotImplemented',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotInitializing',
    inputs: [],
  },
  {
    type: 'error',
    name: 'SafeCastOverflowedUintDowncast',
    inputs: [
      {
        name: 'bits',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: 'value',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'ZeroArgument',
    inputs: [
      {
        name: 'name',
        type: 'string',
        internalType: 'string',
      },
    ],
  },
] as const;

export type GgvStrategyAbiType = typeof GgvStrategyAbi;
