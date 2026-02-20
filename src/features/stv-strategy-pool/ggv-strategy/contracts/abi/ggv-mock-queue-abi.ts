export const GgvMockQueueAbi = [
  {
    inputs: [],
    name: 'getRequestIds',
    outputs: [
      {
        internalType: 'bytes32[]',
        name: '',
        type: 'bytes32[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'requestId',
        type: 'bytes32',
      },
    ],
    name: 'mockGetRequestById',
    outputs: [
      {
        components: [
          {
            internalType: 'uint96',
            name: 'nonce',
            type: 'uint96',
          },
          {
            internalType: 'address',
            name: 'user',
            type: 'address',
          },
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
            internalType: 'uint128',
            name: 'amountOfAssets',
            type: 'uint128',
          },
          {
            internalType: 'uint40',
            name: 'creationTime',
            type: 'uint40',
          },
          {
            internalType: 'uint24',
            name: 'secondsToMaturity',
            type: 'uint24',
          },
          {
            internalType: 'uint24',
            name: 'secondsToDeadline',
            type: 'uint24',
          },
        ],
        internalType: 'struct IBoringOnChainQueue.OnChainWithdraw',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export type GgvMockQueueAbiType = typeof GgvMockQueueAbi;
