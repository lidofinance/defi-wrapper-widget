import { type Address } from 'viem';
import { useQuery } from '@tanstack/react-query';

import invariant from 'tiny-invariant';
import { useLidoSDK } from '@/modules/web3';

import { fetchReport } from '../api';
import {
  DisplayableError,
  VaultOwnerNotDashboardError,
  vaultQueryKeys,
  VAULT_REPORT_REFETCH_INTERVAL_MS,
} from '../consts';
import {
  getLazyOracleContract,
  getDashboardContract,
  getStakingVaultContract,
  getVaultHubContract,
} from '../contracts';
import type { VaultBaseInfo } from '../types';
import { isDashboard } from '../utils/is-dashboard';

export const useBaseVaultData = (vaultAddress: Address | undefined) => {
  const { publicClient } = useLidoSDK();
  const base = vaultQueryKeys(vaultAddress).stateBase;

  return useQuery<VaultBaseInfo>({
    queryKey: [...base, 'base-vault-data'] as const,
    enabled: !!vaultAddress,
    refetchInterval: VAULT_REPORT_REFETCH_INTERVAL_MS,
    retry: (failureCount, error) => {
      // retry only if the error is not our custom error
      return failureCount < 3 && !(error instanceof DisplayableError);
    },
    queryFn: async () => {
      invariant(vaultAddress, '[useBaseVaultData] vaultAddress is not defined');

      const hub = getVaultHubContract(publicClient);
      const lazyOracle = getLazyOracleContract(publicClient);
      const vault = getStakingVaultContract(vaultAddress, publicClient);

      const [
        nodeOperator,
        withdrawalCredentials,
        connection,
        isReportFresh,
        latestVaultReport,
        latestHubReport,
      ] = await Promise.all([
        vault.read.nodeOperator(),
        vault.read.withdrawalCredentials(),
        hub.read.vaultConnection([vaultAddress]),
        hub.read.isReportFresh([vaultAddress]),
        hub.read.latestReport([vaultAddress]),
        lazyOracle.read.latestReportData(),
      ]);

      const [
        latestHubReportTimestamp,
        latestDataRefSlot,
        latestHubReportRoot,
        latestHubReportCID,
      ] = latestHubReport;

      const isReportAvailable =
        latestHubReportTimestamp > latestVaultReport.timestamp;

      // we might not have a report even when fresh is not true
      const report = isReportAvailable
        ? await fetchReport(
            { publicClient },
            { cid: latestHubReportCID, vault: vaultAddress },
          )
        : null;

      const isReportMissing = !report && !isReportFresh;

      if (!(await isDashboard(publicClient, connection.owner))) {
        throw new VaultOwnerNotDashboardError();
      }

      const dashboard = getDashboardContract(connection.owner, publicClient);

      return {
        address: vaultAddress,
        vault,
        dashboard,
        hub,
        nodeOperator,
        withdrawalCredentials,
        report,
        hubReport: {
          root: latestHubReportRoot,
          refSlot: latestDataRefSlot,
          cid: latestHubReportCID,
          timestamp: latestHubReportTimestamp,
        },
        isReportFresh,
        isReportMissing,
        ...connection,
      };
    },
  });
};
