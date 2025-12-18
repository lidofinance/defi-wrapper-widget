import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import { Distribution } from '@/modules/vaults/proof-generator/types';

export const generateProofByIndex = (
  distribution: Distribution,
  index: number,
): {
  proof: readonly `0x${string}`[];
  value: string[];
  treeIndex: number;
} | null => {
  if (index < 0 || index >= distribution.values.length) {
    return null;
  }

  const merkleTree = StandardMerkleTree.load({
    ...distribution,
    values: distribution.values.map(({ treeIndex, value }) => ({
      value,
      treeIndex: Number(treeIndex),
    })),
  });

  const proof = merkleTree.getProof(index);
  const value = distribution.values[index];

  return {
    proof: proof as readonly `0x${string}`[],
    value: value?.value || [],
    treeIndex: Number(value?.treeIndex) || 0,
  };
};
