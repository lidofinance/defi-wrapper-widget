export const DistributorAbi = [
  {
    type: 'function',
    name: 'cid',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'string',
        internalType: 'string',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'claim',
    inputs: [
      {
        name: '_recipient',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_cumulativeAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_proof',
        type: 'bytes32[]',
        internalType: 'bytes32[]',
      },
    ],
    outputs: [
      {
        name: 'claimedAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'previewClaim',
    inputs: [
      {
        name: '_recipient',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_cumulativeAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_proof',
        type: 'bytes32[]',
        internalType: 'bytes32[]',
      },
    ],
    outputs: [
      {
        name: 'claimable',
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
    name: 'AlreadyProcessed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ClaimableTooLow',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidProof',
    inputs: [],
  },
  {
    type: 'error',
    name: 'RootNotSet',
    inputs: [],
  },
  {
    type: 'error',
    name: 'SafeERC20FailedOperation',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'TokenAlreadyAdded',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'TokenNotSupported',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'ZeroAddress',
    inputs: [],
  },
] as const;

export type DistributorAbiType = typeof DistributorAbi;
