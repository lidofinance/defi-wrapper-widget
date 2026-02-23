export const VaultHubAbi = [
  {
    inputs: [],
    name: 'AccessControlBadConfirmation',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'neededRole',
        type: 'bytes32',
      },
    ],
    name: 'AccessControlUnauthorizedAccount',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'AlreadyConnected',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'totalValue',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'withdrawAmount',
        type: 'uint256',
      },
    ],
    name: 'AmountExceedsTotalValue',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'withdrawable',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'requested',
        type: 'uint256',
      },
    ],
    name: 'AmountExceedsWithdrawableValue',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BadDebtSocializationNotAllowed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ForcedValidatorExitNotAllowed',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'InsufficientSharesToBurn',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
    ],
    name: 'InsufficientStagedBalance',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'etherToLock',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxLockableValue',
        type: 'uint256',
      },
    ],
    name: 'InsufficientValue',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'valueBP',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxValueBP',
        type: 'uint256',
      },
    ],
    name: 'InvalidBasisPoints',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidInitialization',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
    ],
    name: 'NoFundsForForceRebalance',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'unsettledLidoFees',
        type: 'uint256',
      },
    ],
    name: 'NoFundsToSettleLidoFees',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'liabilityShares',
        type: 'uint256',
      },
    ],
    name: 'NoLiabilitySharesShouldBeLeft',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
    ],
    name: 'NoReasonForForceRebalance',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'unsettledLidoFees',
        type: 'uint256',
      },
    ],
    name: 'NoUnsettledLidoFeesShouldBeLeft',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
    ],
    name: 'NoUnsettledLidoFeesToSettle',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotAuthorized',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
    ],
    name: 'NotConnectedToHub',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotInitializing',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
    ],
    name: 'PDGNotDepositor',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PartialValidatorWithdrawalNotAllowed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PauseIntentAlreadySet',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PauseIntentAlreadyUnset',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PauseUntilMustBeInFuture',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PausedExpected',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ResumedExpected',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'int256',
        name: 'value',
        type: 'int256',
      },
    ],
    name: 'SafeCastOverflowedIntToUint',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'bits',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'SafeCastOverflowedUintDowncast',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'expectedSharesAfterMint',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'shareLimit',
        type: 'uint256',
      },
    ],
    name: 'ShareLimitExceeded',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'shareLimit',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxShareLimit',
        type: 'uint256',
      },
    ],
    name: 'ShareLimitTooHigh',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
    ],
    name: 'VaultHubNotPendingOwner',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'currentBalance',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'expectedBalance',
        type: 'uint256',
      },
    ],
    name: 'VaultInsufficientBalance',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
    ],
    name: 'VaultIsDisconnecting',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'totalValue',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'liabilityShares',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'newRebalanceThresholdBP',
        type: 'uint256',
      },
    ],
    name: 'VaultMintingCapacityExceeded',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
    ],
    name: 'VaultNotFactoryDeployed',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
    ],
    name: 'VaultOssified',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
    ],
    name: 'VaultReportStale',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ZeroAddress',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ZeroArgument',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ZeroPauseDuration',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
    ],
    name: 'isReportFresh',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
    ],
    name: 'latestReport',
    outputs: [
      {
        components: [
          {
            internalType: 'uint104',
            name: 'totalValue',
            type: 'uint104',
          },
          {
            internalType: 'int104',
            name: 'inOutDelta',
            type: 'int104',
          },
          {
            internalType: 'uint48',
            name: 'timestamp',
            type: 'uint48',
          },
        ],
        internalType: 'struct VaultHub.Report',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
    ],
    name: 'vaultConnection',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'uint96',
            name: 'shareLimit',
            type: 'uint96',
          },
          {
            internalType: 'uint96',
            name: 'vaultIndex',
            type: 'uint96',
          },
          {
            internalType: 'uint48',
            name: 'disconnectInitiatedTs',
            type: 'uint48',
          },
          {
            internalType: 'uint16',
            name: 'reserveRatioBP',
            type: 'uint16',
          },
          {
            internalType: 'uint16',
            name: 'forcedRebalanceThresholdBP',
            type: 'uint16',
          },
          {
            internalType: 'uint16',
            name: 'infraFeeBP',
            type: 'uint16',
          },
          {
            internalType: 'uint16',
            name: 'liquidityFeeBP',
            type: 'uint16',
          },
          {
            internalType: 'uint16',
            name: 'reservationFeeBP',
            type: 'uint16',
          },
          {
            internalType: 'bool',
            name: 'beaconChainDepositsPauseIntent',
            type: 'bool',
          },
        ],
        internalType: 'struct VaultHub.VaultConnection',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
    ],
    name: 'vaultRecord',
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: 'uint104',
                name: 'totalValue',
                type: 'uint104',
              },
              {
                internalType: 'int104',
                name: 'inOutDelta',
                type: 'int104',
              },
              {
                internalType: 'uint48',
                name: 'timestamp',
                type: 'uint48',
              },
            ],
            internalType: 'struct VaultHub.Report',
            name: 'report',
            type: 'tuple',
          },
          {
            internalType: 'uint96',
            name: 'maxLiabilityShares',
            type: 'uint96',
          },
          {
            internalType: 'uint96',
            name: 'liabilityShares',
            type: 'uint96',
          },
          {
            components: [
              {
                internalType: 'int104',
                name: 'value',
                type: 'int104',
              },
              {
                internalType: 'int104',
                name: 'valueOnRefSlot',
                type: 'int104',
              },
              {
                internalType: 'uint48',
                name: 'refSlot',
                type: 'uint48',
              },
            ],
            internalType: 'struct DoubleRefSlotCache.Int104WithCache[2]',
            name: 'inOutDelta',
            type: 'tuple[2]',
          },
          {
            internalType: 'uint128',
            name: 'minimalReserve',
            type: 'uint128',
          },
          {
            internalType: 'uint128',
            name: 'redemptionShares',
            type: 'uint128',
          },
          {
            internalType: 'uint128',
            name: 'cumulativeLidoFees',
            type: 'uint128',
          },
          {
            internalType: 'uint128',
            name: 'settledLidoFees',
            type: 'uint128',
          },
        ],
        internalType: 'struct VaultHub.VaultRecord',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export type VaultHubAbiType = typeof VaultHubAbi;
