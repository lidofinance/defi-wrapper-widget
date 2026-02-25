import { encodeAbiParameters, Hex } from 'viem';

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
