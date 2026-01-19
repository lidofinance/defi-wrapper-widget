import { useCallback } from 'react';

import invariant from 'tiny-invariant';
import { useLidoSDK } from '@/modules/web3';

import { ReportMissingError } from '../consts';
import { getLazyOracleContract } from '../contracts';
import { useVault } from '../vault-context';

export const useReportCalls = () => {
  const { publicClient } = useLidoSDK();
  const { activeVault } = useVault();
  return useCallback(() => {
    invariant(activeVault, 'activeVault is required');

    const { report, isReportFresh } = activeVault;

    const lazyOracle = getLazyOracleContract(publicClient);

    lazyOracle.read.latestReportData().then((latestReport) => {
      console.debug('DEBUGGING INFO, SCREENSHOT ME', {
        latestReport,
        report,
        isReportFresh,
      });
    });

    if (!report) {
      if (!isReportFresh) {
        throw new ReportMissingError();
      }
      return [];
    }

    return [
      {
        loadingText: 'Applying vault oracle report on-chain',
        signingDescription: 'Confirm this transaction in your wallet',
        loadingDescription: 'Awaiting block confirmation',
        successText: 'Report has been created',
        errorText: 'Report has failed',
        ...lazyOracle.encode.updateVaultData([
          report.vault,
          report.totalValueWei,
          report.fee,
          report.liabilityShares,
          report.maxLiabilityShares,
          report.slashingReserve,
          report.proof,
        ]),
      },
    ];
  }, [activeVault, publicClient]);
};
