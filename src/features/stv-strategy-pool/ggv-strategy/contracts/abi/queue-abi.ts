export const GgvQueueAbi = [
  {
    inputs: [],
    name: 'BoringOnChainQueue__BadDeadline',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BoringOnChainQueue__BadDiscount',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BoringOnChainQueue__BadInput',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BoringOnChainQueue__BadShareAmount',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BoringOnChainQueue__BadUser',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BoringOnChainQueue__DeadlinePassed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BoringOnChainQueue__Keccak256Collision',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BoringOnChainQueue__MAXIMUM_MINIMUM_SECONDS_TO_DEADLINE',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BoringOnChainQueue__MAXIMUM_SECONDS_TO_MATURITY',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BoringOnChainQueue__MAX_DISCOUNT',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BoringOnChainQueue__NotEnoughWithdrawCapacity',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BoringOnChainQueue__NotMatured',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BoringOnChainQueue__Overflow',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BoringOnChainQueue__Paused',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BoringOnChainQueue__PermitFailedAndAllowanceTooLow',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BoringOnChainQueue__RequestNotFound',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BoringOnChainQueue__RescueCannotTakeSharesFromActiveRequests',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BoringOnChainQueue__SolveAssetMismatch',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BoringOnChainQueue__WithdrawsNotAllowedForAsset',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'assetOut',
        type: 'address',
      },
      {
        internalType: 'uint128',
        name: 'amountOfShares',
        type: 'uint128',
      },
      {
        internalType: 'uint16',
        name: 'discount',
        type: 'uint16',
      },
    ],
    name: 'previewAssetsOut',
    outputs: [
      {
        internalType: 'uint128',
        name: 'amountOfAssets128',
        type: 'uint128',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'withdrawAssets',
    outputs: [
      {
        internalType: 'bool',
        name: 'allowWithdraws',
        type: 'bool',
      },
      {
        internalType: 'uint24',
        name: 'secondsToMaturity',
        type: 'uint24',
      },
      {
        internalType: 'uint24',
        name: 'minimumSecondsToDeadline',
        type: 'uint24',
      },
      {
        internalType: 'uint16',
        name: 'minDiscount',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: 'maxDiscount',
        type: 'uint16',
      },
      {
        internalType: 'uint96',
        name: 'minimumShares',
        type: 'uint96',
      },
      {
        internalType: 'uint256',
        name: 'withdrawCapacity',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export type GgvQueueAbiType = typeof GgvQueueAbi;
