import { useCallback } from 'react';

import invariant from 'tiny-invariant';

import { USER_CONFIG } from '@/config';
import { ReportMissingError } from '../consts';
import { useVault } from '../vault-context';

export const useReportCalls = () => {
  const { activeVault } = useVault();
  return useCallback(() => {
    invariant(activeVault, 'activeVault is required');

    const { report, isReportFresh, lazyOracle } = activeVault;

    // Debug logging intended for devs only — do not ship to production
    if (USER_CONFIG.isDev) {
      void lazyOracle.read.latestReportData().then((latestReport) => {
        console.debug('DEBUGGING INFO, SCREENSHOT ME', {
          latestReport,
          report,
          isReportFresh,
        });
      });
    }

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
  }, [activeVault]);
};
