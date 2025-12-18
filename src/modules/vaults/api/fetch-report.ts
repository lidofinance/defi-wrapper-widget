import type { Address, Hex } from 'viem';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import invariant from 'tiny-invariant';
import { getApiURL } from '@/config';
import { Distribution } from '@/modules/vaults/proof-generator/types';

import type { RegisteredPublicClient } from '@/modules/web3';

import { CID_TO_GATEWAY, vaultApiRoutes } from '../consts';

type IPFSReport = {
  blockNumber: number;
  refSlot: number;
  timestamp: number;

  prevTreeCID: string;
  proofsCID: string;

  merkleTreeRoot: Hex;
  tree: Hex[];
  values: {
    treeIndex: number;
    value: [Address, string, string, string, string, string];
  }[];
  format: 'standard-v1';
  leafEncoding: [
    'address',
    'uint256',
    'uint256',
    'uint256',
    'uint256',
    'int256',
  ];
  leafIndexToData: {
    '0': 'vault_address';
    '1': 'total_value_wei';
    '2': 'fee';
    '3': 'liability_shares';
    '4': 'max_liability_shares';
    '5': 'slashing_reserve';
  };
};

type ApiReport = {
  report: {
    data: {
      vaultAddress: Address;
      fee: string;
      totalValueWei: string;
      liabilityShares: string;
      slashingReserve: string;
      maxLiabilityShares: string;
    };
    extraData: {
      inOutDelta: string;
    };
    leaf: string;
    refSlot: number;
    blockNumber: number;
    timestamp: number;
    prevTreeCID: string;
    proof: string[];
  } | null;
};

export type FetchReportContext = {
  publicClient: RegisteredPublicClient;
};

export type FetchReportParams = {
  cid: string;
  vault: Address;
};

export type VaultReport = {
  vault: Address;
  totalValueWei: bigint;
  fee: bigint;
  liabilityShares: bigint;
  maxLiabilityShares: bigint;
  slashingReserve: bigint;
  proof: Hex[];
  vaultLeafHash: Hex;
};

export const fetchIPFS = async <TResult>(cid: string): Promise<TResult> => {
  for (const gateway of CID_TO_GATEWAY) {
    const url = gateway(cid);
    try {
      return await fetch(url).then((res) => res.json());
    } catch (error) {
      console.warn(
        `Error fetching from IPFS gateway(${url}). Trying next...`,
        error,
      );
    }
  }
  throw new Error('Could not fetch report from IPFS');
};

const fetchReportIPFS = async (
  _ctx: FetchReportContext,
  params: FetchReportParams,
) => {
  const IPFSReportData = await fetchIPFS<IPFSReport>(params.cid);

  const merkleTree = StandardMerkleTree.load(IPFSReportData);

  const vaultIndex = IPFSReportData.values.findIndex(
    ({ value }) => value[0].toLowerCase() === params.vault.toLowerCase(),
  );

  if (vaultIndex < 0) {
    return null;
  }

  const vaultEntry = merkleTree.at(vaultIndex);

  invariant(
    vaultEntry,
    'Vault entry not found in the Merkle tree, but index is valid',
  );

  return {
    vault: vaultEntry[0],
    totalValueWei: BigInt(vaultEntry[1]),
    fee: BigInt(vaultEntry[2]),
    liabilityShares: BigInt(vaultEntry[3]),
    maxLiabilityShares: BigInt(vaultEntry[4]),
    slashingReserve: BigInt(vaultEntry[5]),
    proof: merkleTree.getProof(vaultIndex) as Hex[],
    vaultLeafHash: merkleTree.leafHash(vaultEntry) as Hex,
  };
};

const fetchReportApi = async (
  ctx: FetchReportContext,
  _params: FetchReportParams,
): Promise<VaultReport | null> => {
  const apiUrl = getApiURL(ctx.publicClient.chain.id, 'vaultsApi');
  if (!apiUrl) {
    throw new Error(
      `Vault API URL is not defined for ${ctx.publicClient.chain.id}`,
    );
  }

  const response = await fetch(
    vaultApiRoutes.vaultReport(apiUrl, _params.vault, _params.cid),
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch report from API: ${response.statusText}`);
  }

  const reportData: ApiReport = await response.json();

  if (!reportData.report) {
    return null;
  }

  const { data, proof, leaf } = reportData.report;

  return {
    vault: data.vaultAddress,
    totalValueWei: BigInt(data.totalValueWei),
    fee: BigInt(data.fee),
    liabilityShares: BigInt(data.liabilityShares),
    slashingReserve: BigInt(data.slashingReserve),
    maxLiabilityShares: BigInt(data.maxLiabilityShares),
    proof: proof as Hex[],
    vaultLeafHash: leaf as Hex,
  };
};

export const fetchReport = async (
  ctx: FetchReportContext,
  params: FetchReportParams,
) => {
  try {
    return await fetchReportApi(ctx, params);
  } catch (error) {
    console.warn(
      `[fetchReport] Failed to fetch report from API for CID ${params.cid} and vault ${params.vault}. Falling back to IPFS.`,
      error,
    );
    return fetchReportIPFS(ctx, params);
  }
};

export const fetchDistribution = async (cid: string): Promise<Distribution> => {
  return fetchIPFS<Distribution>(cid);
};
