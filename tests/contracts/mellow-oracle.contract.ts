import { getContract } from 'viem';
import type { Account, Address } from 'viem';

import { getViemChain } from '@tests/config';
import { getPublicClient, getSharedWalletClient } from '@tests/providers';
import { MELLOW_ORACLE_ABI } from './abi/mellow-abi';

export type MellowSecurityParams = {
  maxAbsoluteDeviation: bigint;
  suspiciousAbsoluteDeviation: bigint;
  maxRelativeDeviationD18: bigint;
  suspiciousRelativeDeviationD18: bigint;
  timeout: number;
  depositInterval: number;
  redeemInterval: number;
};

export class MellowOracleContract {
  constructor(private readonly address: Address) {}

  private getContract() {
    return getContract({
      address: this.address,
      abi: MELLOW_ORACLE_ABI,
      client: { public: getPublicClient(), wallet: getSharedWalletClient() },
    });
  }

  securityParams() {
    return this.getContract().read.securityParams();
  }

  async setSecurityParams(
    params: MellowSecurityParams,
    account: Account | Address,
  ) {
    const hash = await this.getContract().write.setSecurityParams([params], {
      account,
      chain: getViemChain(),
    });
    return getPublicClient().waitForTransactionReceipt({ hash });
  }

  getReport(asset: Address) {
    return this.getContract().read.getReport([asset]);
  }

  async submitReports(
    reports: readonly { asset: Address; priceD18: bigint }[],
    account: Account | Address,
  ) {
    const hash = await this.getContract().write.submitReports([reports], {
      account,
      chain: getViemChain(),
    });
    return getPublicClient().waitForTransactionReceipt({ hash });
  }

  getSubmitReportRole() {
    return this.getContract().read.SUBMIT_REPORTS_ROLE();
  }

  setSecurityParamsRole() {
    return this.getContract().read.SET_SECURITY_PARAMS_ROLE();
  }
}
