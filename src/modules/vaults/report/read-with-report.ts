import {
  type Address,
  type ContractFunctionParameters,
  type MulticallReturnType,
} from 'viem';

import { LidoSDKVaultModule } from '@lidofinance/lido-ethereum-sdk/stvault';
import { type RegisteredPublicClient } from '@/modules/web3';

import type { VaultReportType } from '../types';

type ReadWithReportArgs<
  TContracts extends readonly unknown[] =
    readonly (ContractFunctionParameters & {
      from?: Address;
    })[],
> = {
  publicClient: RegisteredPublicClient;
  contracts: TContracts;
  report?: VaultReportType | null;
};

export const readWithReport = async <
  TContracts extends readonly (ContractFunctionParameters & {
    from?: Address; // this is NOOP for eth_call multicall, but may work with simulateV1
  })[],
>({
  publicClient,
  report,
  contracts,
}: ReadWithReportArgs<TContracts>): Promise<
  MulticallReturnType<TContracts, false>
> => {
  if (report) {
    // there is logic in lazyOracle that does not allow us to bypass it without proof
    // inclusion of proper tx with proof is not sustainable for rpc load and compute
    // as  proof will gradually become larger
    // we need to find a way to bypass it in the future:
    //
    //      1. calculate short-proof and fake root and state override lazyOracle merkle tree
    //      2. eth_call/eth_simulateV1  stateOverride lazyOracle implementation with proof-less updateVaultData
    //      3. eth_call from impersonate DAO agent or other owner of vault
    //
    //  NB!: stateOverride(or smth with this approach) is buggy with eth_call and eth_simulateV1
    //       causes to report not to apply and all views to use pre-report state
    //
    // EXAMPLE OF STATE OVERRIDE THAT ALLOWS FOR ZERO LENGTH PROOF
    //     stateOverride: [
    //   {
    //     address: lazyOracle.address,
    //     state: [
    //       {
    //         slot: LAZY_ORACLE_ROOT_HASH_SLOT,
    //         value: report.vaultLeafHash,
    //       },
    //     ],
    //   },
    // ],

    const vaultContracts = new LidoSDKVaultModule({
      logMode: 'none',
      publicClient,
    }).contracts;
    const lazyOracle = await vaultContracts.getContractLazyOracle();

    const reportCall = lazyOracle.prepare.updateVaultData([
      report.vault,
      report.totalValueWei,
      report.fee,
      report.liabilityShares,
      report.maxLiabilityShares,
      report.slashingReserve,
      report.proof,
    ]);

    const [reportResult, ...contractResults] = await publicClient.multicall({
      contracts: [reportCall, ...contracts] as any,
      batchSize: 0, // this forces to use single call batch for all calls
      allowFailure: true,
    });

    if (reportResult.status === 'failure') {
      // VaultReportIsFreshEnough: another tx already applied this report in the same block.
      // Contract reads still reflect correct post-report state, so we can continue.
      console.warn(
        '[readWithReport] updateVaultData failed — report may already be applied on-chain',
        reportResult.error,
      );
    }

    const failedResult = contractResults.find((r) => r.status === 'failure');
    if (failedResult) {
      throw (failedResult as { status: 'failure'; error: Error }).error;
    }

    return contractResults.map(
      (r) => (r as { status: 'success'; result: unknown }).result,
    ) as unknown as MulticallReturnType<TContracts, false>;
  }

  // if there is only 1 call we can use readContract directly to avoid multicall overhead
  if (contracts.length === 1) {
    return [
      await publicClient.readContract({
        ...contracts[0],
      }),
    ] as unknown as MulticallReturnType<TContracts, false>;
  }

  // fallback multicall when no report is provided
  return publicClient.multicall({
    contracts: contracts as any,
    allowFailure: false,
  }) as unknown as MulticallReturnType<TContracts, false>;
};
