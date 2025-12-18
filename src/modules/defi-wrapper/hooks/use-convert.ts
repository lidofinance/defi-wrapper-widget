import { useCallback } from 'react';
import type { ContractFunctionParameters } from 'viem';
import invariant from 'tiny-invariant';
import { readWithReport } from '@/modules/vaults';
import type { VaultReportType } from '@/modules/vaults/types';
import type { RegisteredPublicClient } from '@/modules/web3';
import { useDefiWrapper } from '../wrapper-provider';

export const useConvert = () => {
  const { wrapper } = useDefiWrapper();

  const convert = useCallback(
    async (
      amount: bigint,
      contract: ContractFunctionParameters,
      publicClient: RegisteredPublicClient,
      report: VaultReportType | null,
    ): Promise<bigint> => {
      invariant(amount > 0n, 'amount should be more than 0');

      const [convertedAmount] = await readWithReport({
        publicClient,
        report,
        contracts: [contract] as const,
      });

      return convertedAmount as bigint;
    },
    [],
  );

  const convertFromStvToEth = useCallback(
    async (
      publicClient: RegisteredPublicClient,
      report: VaultReportType | null,
      amount: bigint,
    ) => {
      invariant(wrapper, 'wrapper is required');
      return convert(
        amount,
        wrapper.prepare.previewRedeem([amount]),
        publicClient,
        report,
      );
    },
    [wrapper, convert],
  );

  const convertFromEthToStv = useCallback(
    async (
      publicClient: RegisteredPublicClient,
      report: VaultReportType | null,
      amount: bigint,
    ) => {
      invariant(wrapper, 'wrapper is required');
      return convert(
        amount,
        wrapper.prepare.previewDeposit([amount]),
        publicClient,
        report,
      );
    },
    [wrapper, convert],
  );

  return {
    convertFromStvToEth,
    convertFromEthToStv,
  };
};
