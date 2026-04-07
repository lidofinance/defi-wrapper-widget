import type { Address, Hex, ReadContractReturnType } from 'viem';

import type {
  VaultHubAbiType,
  DashboardContractType,
  LazyOracleContractType,
  StakingVaultContractType,
  VaultHubContractType,
} from '@lidofinance/lido-ethereum-sdk/stvault';

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
  vault: StakingVaultContractType;
  hub: VaultHubContractType;
  lazyOracle: LazyOracleContractType;
  dashboard: DashboardContractType;
  nodeOperator: Address;
  withdrawalCredentials: Hex;
  isReportFresh: boolean;
  isReportMissing: boolean;
  hubReport: HubReportData;
  report: VaultReportType | null;
  isConnected: boolean;
} & VaultConnection;
