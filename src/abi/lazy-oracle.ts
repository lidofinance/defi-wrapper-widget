export const LazyOracleAbi = [
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
    inputs: [],
    name: 'AdminCannotBeZero',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'feeIncrease',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxFeeIncrease',
        type: 'uint256',
      },
    ],
    name: 'CumulativeLidoFeesTooLarge',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'reportingFees',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'previousFees',
        type: 'uint256',
      },
    ],
    name: 'CumulativeLidoFeesTooLow',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InOutDeltaCacheIsOverwritten',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidInitialization',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidMaxLiabilityShares',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidProof',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'feeRate',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxFeeRate',
        type: 'uint256',
      },
    ],
    name: 'MaxLidoFeeRatePerSecondTooLarge',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'rewardRatio',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxRewardRatio',
        type: 'uint256',
      },
    ],
    name: 'MaxRewardRatioTooLarge',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotAuthorized',
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
        internalType: 'uint256',
        name: 'quarantinePeriod',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxQuarantinePeriod',
        type: 'uint256',
      },
    ],
    name: 'QuarantinePeriodTooLarge',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TotalValueTooLarge',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UnderflowInTotalValueCalculation',
    type: 'error',
  },
  {
    inputs: [],
    name: 'VaultReportIsFreshEnough',
    type: 'error',
  },
  {
    inputs: [],
    name: 'latestReportData',
    outputs: [
      {
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'refSlot',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'treeRoot',
        type: 'bytes32',
      },
      {
        internalType: 'string',
        name: 'reportCid',
        type: 'string',
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
      {
        internalType: 'uint256',
        name: '_totalValue',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_cumulativeLidoFees',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_liabilityShares',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_maxLiabilityShares',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_slashingReserve',
        type: 'uint256',
      },
      {
        internalType: 'bytes32[]',
        name: '_proof',
        type: 'bytes32[]',
      },
    ],
    name: 'updateVaultData',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export type LazyOracleAbiType = typeof LazyOracleAbi;
