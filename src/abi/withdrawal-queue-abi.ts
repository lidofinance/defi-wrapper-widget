export const WithdrawalQueueAbi = [
  {
    type: 'function',
    name: 'MAX_WITHDRAWAL_ASSETS',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'MIN_WITHDRAWAL_VALUE',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'WITHDRAWALS_FEATURE',
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
    name: 'claimWithdrawalBatch',
    inputs: [
      {
        name: '_recipient',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_requestIds',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
      {
        name: '_hints',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    outputs: [
      {
        name: 'claimedAmounts',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'findCheckpointHintBatch',
    inputs: [
      {
        name: '_requestIds',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
      {
        name: '_firstIndex',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_lastIndex',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'hintIds',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getLastCheckpointIndex',
    inputs: [],
    outputs: [
      {
        name: 'index',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getWithdrawalStatusBatch',
    inputs: [
      {
        name: '_requestIds',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    outputs: [
      {
        name: 'statuses',
        type: 'tuple[]',
        internalType: 'struct WithdrawalQueue.WithdrawalRequestStatus[]',
        components: [
          {
            name: 'amountOfStv',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'amountOfStethShares',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'amountOfAssets',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'owner',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'timestamp',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'isFinalized',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'isClaimed',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isFeaturePaused',
    inputs: [
      {
        name: '_featureId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: 'isPaused',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'requestWithdrawal',
    inputs: [
      {
        name: '_owner',
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
    name: 'withdrawalRequestsOf',
    inputs: [
      {
        name: '_owner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'requestIds',
        type: 'uint256[]',
        internalType: 'uint256[]',
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
    name: 'ArraysLengthMismatch',
    inputs: [
      {
        name: 'firstArrayLength',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'secondArrayLength',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'CantSendValueRecipientMayHaveReverted',
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
    name: 'GasCostCoverageTooLarge',
    inputs: [
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'InvalidHint',
    inputs: [
      {
        name: 'hint',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'InvalidInitialization',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidRange',
    inputs: [
      {
        name: 'start',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'end',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'InvalidRequestId',
    inputs: [
      {
        name: 'requestId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'InvalidWithdrawalDelay',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NoRequestsToFinalize',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotInitializing',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotOwner',
    inputs: [
      {
        name: '_requestor',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_owner',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'RebalancingIsNotSupported',
    inputs: [],
  },
  {
    type: 'error',
    name: 'RequestAlreadyClaimed',
    inputs: [
      {
        name: 'requestId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'RequestAssetsTooLarge',
    inputs: [
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'RequestIdsNotSorted',
    inputs: [],
  },
  {
    type: 'error',
    name: 'RequestNotFoundOrNotFinalized',
    inputs: [
      {
        name: 'requestId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'RequestValueTooSmall',
    inputs: [
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
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
    name: 'VaultReportStale',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ZeroAddress',
    inputs: [],
  },
] as const;

export type WithdrawalQueueAbiType = typeof WithdrawalQueueAbi;
