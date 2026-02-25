import type { Address } from 'viem';

const API_LIST = ['vaultsApi', 'ethApi', 'ggvApi', 'mellowApi'] as const;

const CONTRACT_LIST = [
  'lido',
  'wsteth',
  'lidoLocator',
  'withdrawalQueue',
  'stakingRouter',
  'aggregatorEthUsdPriceFeed',
  'ensPublicResolver',
  'ensUniversalResolver',
  'ensRegistry',
  'predepositGuarantee',
  'vaultHub',
  'vaultFactory',
  'lazyOracle',
  'vaultViewer',
  'operatorGrid',
  'weth',
] as const;

export const CONTRACTS = Object.fromEntries(
  CONTRACT_LIST.map((contract) => [contract, contract]),
) as { [key in (typeof CONTRACT_LIST)[number]]: key };

export const APIS = Object.fromEntries(API_LIST.map((api) => [api, api])) as {
  [key in (typeof API_LIST)[number]]: key;
};

export type CONTRACT_NAMES = (typeof CONTRACT_LIST)[number];
export type API_NAMES = (typeof API_LIST)[number];

export type NetworkConfig = {
  api: {
    [K in keyof typeof APIS]?: string;
  };
  contracts: {
    [K in keyof typeof CONTRACTS]?: Address;
  };
};
