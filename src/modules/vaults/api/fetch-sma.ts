import type { Address } from 'viem';
import { getApiURL } from '@/config';
import type { RegisteredPublicClient } from '@/modules/web3';
import { aprToApy } from '@/utils/apr-to-apy';
import { fromBlockChainTime } from '@/utils/blockchain-time';
import { vaultApiRoutes } from '../consts';

export type FetchVaultSMAReturn = {
  days: number;
  count: number;
  updatedAt: Date;
  aprSma: number;
  apySma: number;
  aprDaily: number;
  apyDaily: number;

  range: {
    fromTimestamp: number;
    toTimestamp: number;
  };
  meta: {
    reportCid: string;
    timestamp: number;
  }[];
  grossStakingApr: {
    sma: number;
    aprs: number[];
  };
  netStakingApr: {
    sma: number;
    aprs: number[];
  };
  carrySpreadApr: {
    sma: number;
    aprs: number[];
  };
};

type FetchVaultSMAContext = {
  publicClient: RegisteredPublicClient;
};

type FetchVaultSMAParams = {
  vaultAddress: Address;
};

export const fetchVaultSMA = async (
  { publicClient }: FetchVaultSMAContext,
  { vaultAddress }: FetchVaultSMAParams,
): Promise<FetchVaultSMAReturn> => {
  const apiURL = getApiURL(publicClient.chain.id, 'vaultsApi');
  if (!apiURL) {
    throw new Error(`API URL not found for chain ID: ${publicClient.chain.id}`);
  }

  const res = await fetch(vaultApiRoutes.vaultAprSma(apiURL, vaultAddress));

  if (!res.ok) {
    throw new Error(`Error fetching vault SMA: ${res.statusText}`);
  }

  const data = await res.json();
  const aprDaily =
    data.netStakingApr.aprs.length > 0
      ? data.netStakingApr.aprs[data.netStakingApr.aprs.length - 1]
      : 0;

  return {
    ...data,
    updatedAt: fromBlockChainTime(data.range.toTimestamp),
    aprSma: data.netStakingApr.sma,
    apySma: aprToApy(data.netStakingApr.sma),
    aprDaily: aprDaily,
    apyDaily: aprToApy(aprDaily),
  };
};
