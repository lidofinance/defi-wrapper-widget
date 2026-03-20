import type {
  Address,
  Hex,
  ReadContractReturnType,
  GetContractReturnType,
} from 'viem';
import { RegisteredPublicClient } from '../web3';
import type { EncodableContract } from '@lidofinance/lido-ethereum-sdk';
import type {
  VaultHubAbiType,
  StakingVaultAbiType,
  DashboardAbiType,
  LazyOracleAbiType,
  VaultFactoryAbiType,
} from '@lidofinance/lido-ethereum-sdk/stvault';

export type VaultFactoryContract = EncodableContract<
  GetContractReturnType<VaultFactoryAbiType, RegisteredPublicClient>
>;

export type VaultHubContract = EncodableContract<
  GetContractReturnType<VaultHubAbiType, RegisteredPublicClient>
>;

export type StakingVaultContract = EncodableContract<
  GetContractReturnType<StakingVaultAbiType, RegisteredPublicClient>
>;

export type DashboardContract = EncodableContract<
  GetContractReturnType<DashboardAbiType, RegisteredPublicClient>
>;

export type LazyOracleContract = EncodableContract<
  GetContractReturnType<LazyOracleAbiType, RegisteredPublicClient>
>;

export type VaultConnection = ReadContractReturnType<
  VaultHubAbiType,
  'vaultConnection',
  [Address]
>;

export type VaultRecord = ReadContractReturnType<
  VaultHubAbiType,
  'vaultRecord',
  [Address]
>;

export type VaultReportType = {
  vault: Address;
  totalValueWei: bigint;
  fee: bigint;
  liabilityShares: bigint;
  maxLiabilityShares: bigint;
  slashingReserve: bigint;
  proof: Hex[];
  vaultLeafHash: Hex;
};

export type HubReportData = {
  root: Hex;
  refSlot: bigint;
  cid: string;
  timestamp: bigint;
};

export type VaultBaseInfo = {
  address: Address;
  vault: StakingVaultContract;
  hub: VaultHubContract;
  lazyOracle: LazyOracleContract;
  dashboard: DashboardContract;
  nodeOperator: Address;
  withdrawalCredentials: Hex;
  isReportFresh: boolean;
  isReportMissing: boolean;
  hubReport: HubReportData;
  report: VaultReportType | null;
  isConnected: boolean;
} & VaultConnection;
