export const DashboardAbi = [
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
    name: 'AlreadyInitialized',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ConfirmExpiryOutOfBounds',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ConnectedToVaultHub',
    type: 'error',
  },
  {
    inputs: [],
    name: 'CorrectionAfterReport',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DashboardNotAllowed',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'EthTransferFailed',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'requestedShares',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'remainingShares',
        type: 'uint256',
      },
    ],
    name: 'ExceedsMintingCapacity',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'withdrawableValue',
        type: 'uint256',
      },
    ],
    name: 'ExceedsWithdrawable',
    type: 'error',
  },
  {
    inputs: [],
    name: 'FeeValueExceed100Percent',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ForbiddenByPDGPolicy',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ForbiddenToConnectByNodeOperator',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NonProxyCallsForbidden',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PDGPolicyAlreadyActive',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ReportStale',
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
        internalType: 'int256',
        name: 'value',
        type: 'int256',
      },
    ],
    name: 'SafeCastOverflowedIntDowncast',
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
        name: 'token',
        type: 'address',
      },
    ],
    name: 'SafeERC20FailedOperation',
    type: 'error',
  },
  {
    inputs: [],
    name: 'SameRecipient',
    type: 'error',
  },
  {
    inputs: [],
    name: 'SameSettledGrowth',
    type: 'error',
  },
  {
    inputs: [],
    name: 'SenderNotMember',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TierChangeNotConfirmed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UnexpectedFeeExemptionAmount',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UnexpectedSettledGrowth',
    type: 'error',
  },
  {
    inputs: [],
    name: 'VaultQuarantined',
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
    name: 'ZeroConfirmingRoles',
    type: 'error',
  },
  {
    inputs: [],
    name: 'feeRate',
    outputs: [
      {
        internalType: 'uint16',
        name: '',
        type: 'uint16',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'liabilityShares',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_etherToFund',
        type: 'uint256',
      },
    ],
    name: 'remainingMintingCapacityShares',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
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
] as const;

export type DashboardAbiType = typeof DashboardAbi;
