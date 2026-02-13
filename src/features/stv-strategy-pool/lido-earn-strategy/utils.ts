import { encodeAbiParameters, Hex } from 'viem';

type Params = {
  discount: number; // - only for Withdrawals
  minimumMint: number; // - of GGV shares, can be zero
  secondsToDeadline: number; // secondsToDeadline - only for Withdrawals
};

type SupplyParams = {
  isSync: boolean;
  merkleProof: Hex[];
};

export const encodeEarnSupplyParams = (params: SupplyParams) => {
  return encodeAbiParameters(
    [
      { name: 'isSync', type: 'bool' },
      { name: 'merkleProof', type: 'bytes32[]' },
    ],
    [params.isSync, params.merkleProof],
  );
};
