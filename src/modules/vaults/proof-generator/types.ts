export interface Distribution {
  format: 'standard-v1';
  leafEncoding: ['address', 'address', 'uint256'];
  tree: string[];
  values: {
    treeIndex: bigint;
    value: [string, string, string];
  }[];
  prevTreeCid: string;
  blockNumber: number;
  totalDistributed: { [token: string]: string };
}
