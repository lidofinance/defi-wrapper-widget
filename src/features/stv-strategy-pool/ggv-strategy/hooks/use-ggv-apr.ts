import type { Address } from 'viem';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { getApiURL } from '@/config/network';
import { RegisteredPublicClient, useLidoSDK } from '@/modules/web3';
import { useGGVStrategy } from './use-ggv-strategy';

export type SevenSeasAPIDailyResponseItem = {
  block_number: number;
  daily_apy: number;
  price_usd: string;
  share_price: number;
  timestamp: string;
  total_assets: string;
  tvl: string;
  unix_seconds: number;
  vault_address: Address;
};
type SevenSeasAPIDailyResponse = {
  Response: SevenSeasAPIDailyResponseItem[];
};

const WEEK_SECONDS = 7 * 24 * 60 * 60;

const apyToApr = (apyPercent: number) => {
  const apy = apyPercent / 100;
  return (Math.pow(apy + 1, 1 / 365) - 1) * 365 * 100;
};

export const fetchGGVApr = async (
  publicClient: RegisteredPublicClient,
  ggvVault: Address,
) => {
  const ggvApi = getApiURL(publicClient.chain.id, 'ggvApi');
  invariant(
    ggvApi,
    `GGV API URL is not defined for this network ${publicClient.chain.id}`,
  );

  const weekAgo = Math.floor(new Date().getTime() / 1000 - WEEK_SECONDS);
  const url = `${ggvApi}/dailyData/ethereum/${ggvVault}/${weekAgo}/latest`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `[GGV-APY] Failed to fetch data: ${res.status} ${res.statusText}`,
    );
  }
  const data = (await res.json()) as SevenSeasAPIDailyResponse;
  const latestApy = data.Response[0];

  if (!latestApy) {
    throw new Error('[GGV-APY] No data found');
  }

  // 7 day sliding window average APY, safe if some data from api is missing
  const averageApy =
    data.Response.reduce((acc, curr) => acc + curr.daily_apy, 0) /
    data.Response.length;

  return {
    dailyApy: latestApy.daily_apy,
    dailyApr: apyToApr(latestApy.daily_apy),
    averageApy,
    averageApr: apyToApr(averageApy),
  };
};

export const useGGVApr = () => {
  const { publicClient } = useLidoSDK();
  const { data: ggvData } = useGGVStrategy();
  return useQuery({
    queryKey: [
      'wrapper',
      'ggv-apr',
      { chainId: publicClient.chain?.id, ggvVault: ggvData?.ggvVault.address },
    ],
    enabled: !!ggvData,
    queryFn: async () => {
      invariant(ggvData, 'ggvData is required');
      // for non-mainnet chains, use hardcoded mainnet vault address
      const vaultAddress =
        publicClient.chain.id === 1
          ? ggvData.ggvVault.address
          : '0xef417FCE1883c6653E7dC6AF7c6F85CCDE84Aa09';

      return fetchGGVApr(publicClient, vaultAddress);
    },
  });
};
