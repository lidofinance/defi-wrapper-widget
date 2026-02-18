export const GgvTellerAbi = [
  {
    inputs: [],
    name: 'CrossChainTellerWithGenericBridge__UnsafeCastToUint96',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidDelegate',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidEndpointCall',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: 'optionType',
        type: 'uint16',
      },
    ],
    name: 'InvalidOptionType',
    type: 'error',
  },
  {
    inputs: [],
    name: 'LayerZeroTeller__BadFeeToken',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'chainSelector',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'fee',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxFee',
        type: 'uint256',
      },
    ],
    name: 'LayerZeroTeller__FeeExceedsMax',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'chainSelector',
        type: 'uint256',
      },
    ],
    name: 'LayerZeroTeller__MessagesNotAllowedFrom',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'chainSelector',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'LayerZeroTeller__MessagesNotAllowedFromSender',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'chainSelector',
        type: 'uint256',
      },
    ],
    name: 'LayerZeroTeller__MessagesNotAllowedTo',
    type: 'error',
  },
  {
    inputs: [],
    name: 'LayerZeroTeller__ZeroMessageGasLimit',
    type: 'error',
  },
  {
    inputs: [],
    name: 'LzTokenUnavailable',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MessageLib__ShareAmountOverflow',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint32',
        name: 'eid',
        type: 'uint32',
      },
    ],
    name: 'NoPeer',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'msgValue',
        type: 'uint256',
      },
    ],
    name: 'NotEnoughNative',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'addr',
        type: 'address',
      },
    ],
    name: 'OnlyEndpoint',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint32',
        name: 'eid',
        type: 'uint32',
      },
      {
        internalType: 'bytes32',
        name: 'sender',
        type: 'bytes32',
      },
    ],
    name: 'OnlyPeer',
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
    inputs: [],
    name: 'TellerWithMultiAssetSupport__AssetNotSupported',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TellerWithMultiAssetSupport__BadDepositHash',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TellerWithMultiAssetSupport__CannotDepositNative',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TellerWithMultiAssetSupport__DepositExceedsCap',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TellerWithMultiAssetSupport__DualDeposit',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TellerWithMultiAssetSupport__MinimumAssetsNotMet',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TellerWithMultiAssetSupport__MinimumMintNotMet',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TellerWithMultiAssetSupport__Paused',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TellerWithMultiAssetSupport__PermitFailedAndAllowanceTooLow',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TellerWithMultiAssetSupport__ShareLockPeriodTooLong',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TellerWithMultiAssetSupport__SharePremiumTooLarge',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TellerWithMultiAssetSupport__SharesAreLocked',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TellerWithMultiAssetSupport__SharesAreUnLocked',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
    ],
    name: 'TellerWithMultiAssetSupport__TransferDenied',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TellerWithMultiAssetSupport__ZeroAssets',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TellerWithMultiAssetSupport__ZeroShares',
    type: 'error',
  },
  {
    inputs: [],
    name: 'vault',
    outputs: [
      {
        internalType: 'contract BoringVault',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export type GgvTellerAbiType = typeof GgvTellerAbi;
