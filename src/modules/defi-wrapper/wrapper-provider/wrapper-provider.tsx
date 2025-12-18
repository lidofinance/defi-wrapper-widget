import { createContext, useContext, useEffect, useMemo } from 'react';
import { isAddressEqual, fromHex } from 'viem';
import { usePublicClient } from 'wagmi';
import { LIDO_CONTRACT_NAMES } from '@lidofinance/lido-ethereum-sdk';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { USER_CONFIG } from '@/config';
import {
  getDashboardContract,
  getStakingVaultContract,
  getVaultHubContract,
} from '@/modules/vaults';
import { useLidoSDK } from '@/modules/web3';

import { BYTES_TO_STRATEGY_ID, STRATEGY_IDS } from '../const';
import {
  getWQContract,
  getStvPoolContract,
  getStvStethContract,
  getStrategyContract,
  getDistributorContract,
  stvContractByType,
} from '../contracts';
import type { DefiWrapperTypes } from '../types';

export type WidgetFlow = 'strategy' | 'mint' | 'stake';

export type WrapperContextValue = {
  isLoading: boolean;
  error?: Error | null;
  // sync available contracts
  wrapperType: DefiWrapperTypes;
  vaultHub: ReturnType<typeof getVaultHubContract>;

  // async available contracts
  withdrawalQueue?: ReturnType<typeof getWQContract>;
  dashboard?: ReturnType<typeof getDashboardContract>;
  stakingVault?: ReturnType<typeof getStakingVaultContract>;
  distributor?: ReturnType<typeof getDistributorContract>;

  // async available configuration
  configuration?: {
    name: string;
    symbol: string;
    decimals: number;
    assetDecimals: number;
    isWhitelistEnabled: boolean;
  };
} & (
  | {
      wrapperType: Extract<DefiWrapperTypes, 'StvPool'>;
      wrapper: ReturnType<typeof getStvPoolContract>;
      strategy: null;
      strategyId: null;
    }
  | {
      wrapperType: Extract<DefiWrapperTypes, 'StvStETHPool'>;
      wrapper: ReturnType<typeof getStvStethContract>;
      strategy: null;
      strategyId: null;
    }
  | {
      wrapperType: Extract<DefiWrapperTypes, 'StvStrategyPool'>;
      wrapper: ReturnType<typeof getStvStethContract>;
      strategy?: ReturnType<typeof getStrategyContract>;
      strategyId?: (typeof STRATEGY_IDS)[number];
    }
);

const WrapperContext = createContext<WrapperContextValue | null>(null);

export const useDefiWrapper = () => {
  const value = useContext(WrapperContext);
  invariant(value, 'useWrapperContext must be used within a WrapperProvider');
  return value;
};

export const useStvPool = () => {
  const value = useDefiWrapper();
  invariant(
    value.wrapperType === 'StvPool',
    'useStvPool must be used with StvPool wrapper',
  );
  return value;
};

export const useStvSteth = () => {
  const value = useDefiWrapper();
  invariant(
    value.wrapperType === 'StvStETHPool' ||
      value.wrapperType === 'StvStrategyPool',
    'useStvSteth must be used with StvStETHPool/StvStrategyPool wrapper',
  );
  return value;
};

export const useStvStrategy = () => {
  const value = useDefiWrapper();
  invariant(
    value.wrapperType === 'StvStrategyPool',
    'useStvStrategy must be used with StvStrategyPool wrapper',
  );
  return value;
};

export const WrapperProvider = ({ children }: React.PropsWithChildren) => {
  const { core } = useLidoSDK();
  const publicClient = usePublicClient();

  const { poolAddress, poolType, strategyAddress } = USER_CONFIG;

  const wrapperStaticConfig = useQuery({
    queryKey: [
      'wrapper',
      'static-configuration',
      {
        poolAddress,
        poolType,
        strategyAddress,
        chainId: publicClient.chain.id,
      },
    ],
    queryFn: async () => {
      const wrapper = stvContractByType(poolType)(poolAddress, publicClient);

      const strategy = strategyAddress
        ? getStrategyContract(strategyAddress, publicClient)
        : null;

      const [
        name,
        symbol,
        decimals,
        dashboardAddress,
        stakingVaultAddress,
        withdrawalQueueAddress,
        stethAddress,
        contractPoolTypeHex,
        isStrategyAddressAllowListed,
        strategtyIdContract,
        isWhitelistEnabled,
        distributorAddress,
        canonicalStethAddress,
      ] = await Promise.all([
        wrapper.read.name(),
        wrapper.read.symbol(),
        wrapper.read.decimals(),
        wrapper.read.DASHBOARD(),
        wrapper.read.VAULT(),
        wrapper.read.WITHDRAWAL_QUEUE(),
        wrapper.read.STETH(),
        wrapper.read.poolType(),
        strategyAddress
          ? wrapper.read.isAllowListed([strategyAddress])
          : Promise.resolve(false),
        strategy ? strategy.read.STRATEGY_ID() : Promise.resolve(null),
        wrapper.read.ALLOW_LIST_ENABLED(),
        wrapper.read.DISTRIBUTOR(),
        core.getContractAddress(LIDO_CONTRACT_NAMES.lido),
      ]);

      const poolTypeContract = fromHex(contractPoolTypeHex, 'string').replace(
        /\W/g,
        '',
      );

      const strategyId = strategtyIdContract
        ? BYTES_TO_STRATEGY_ID[strategtyIdContract]
        : null;

      if (USER_CONFIG.isDev && typeof window !== 'undefined') {
        (window as any).__POOL_STATIC_CONFIG__ = {
          name,
          symbol,
          decimals,
          poolAddress,
          poolType,
          poolTypeContract,
          strategyAddress,
          strategyId,
          strategtyIdContract,
          dashboardAddress,
          stakingVaultAddress,
          withdrawalQueueAddress,
          distributorAddress,
          isWhitelistEnabled,
        };
        console.info(
          '__POOL_STATIC_CONFIG__',
          (window as any).__POOL_STATIC_CONFIG__,
        );
      }

      if (poolType === 'StvStrategyPool') {
        invariant(
          isStrategyAddressAllowListed,
          `ENV Strategy address (${strategyAddress}) is not allowlisted on pool (${poolAddress}). Check your configuration.`,
        );
      }

      invariant(
        poolTypeContract === poolType,
        `ENV Wrapper type (${poolType}) does not match with contract (${poolTypeContract}). Check your configuration.`,
      );

      invariant(
        isAddressEqual(canonicalStethAddress, stethAddress),
        `Wrapper stETH address (${stethAddress}) does not match canonical stETH address (${canonicalStethAddress}). Check your configuration.`,
      );

      return {
        name,
        symbol,
        decimals,
        assetDecimals: 18, // ETH decimals
        // for StvStrategyPool whitelist is per strategy
        isWhitelistEnabled: strategyAddress ? false : isWhitelistEnabled,
        dashboard: getDashboardContract(dashboardAddress, publicClient),
        stakingVault: getStakingVaultContract(
          stakingVaultAddress,
          publicClient,
        ),
        distributor: getDistributorContract(distributorAddress, publicClient),
        withdrawalQueue: getWQContract(withdrawalQueueAddress, publicClient),
        strategy: strategyAddress
          ? getStrategyContract(strategyAddress, publicClient)
          : null,
        strategyId,
        stethAddress,
      };
    },
  });

  useEffect(() => {
    if (wrapperStaticConfig.error)
      console.error(
        `[WrapperProvider] error fetching ${poolAddress} static config:`,
        wrapperStaticConfig.error,
      );
  }, [wrapperStaticConfig.error, poolAddress]);

  const value = useMemo(() => {
    return {
      wrapper: stvContractByType(poolType)(poolAddress, publicClient),
      vaultHub: getVaultHubContract(publicClient),
      wrapperType: poolType,
      configuration: wrapperStaticConfig.data
        ? {
            name: wrapperStaticConfig.data.name,
            symbol: wrapperStaticConfig.data.symbol,
            decimals: wrapperStaticConfig.data.decimals,
            isWhitelistEnabled: wrapperStaticConfig.data?.isWhitelistEnabled,
            // safe to cast
            assetDecimals: Number(wrapperStaticConfig.data.assetDecimals),
          }
        : undefined,
      withdrawalQueue: wrapperStaticConfig.data?.withdrawalQueue,
      dashboard: wrapperStaticConfig.data?.dashboard,
      stakingVault: wrapperStaticConfig.data?.stakingVault,
      strategy: wrapperStaticConfig.data?.strategy,
      strategyId: wrapperStaticConfig.data?.strategyId,
      distributor: wrapperStaticConfig.data?.distributor,
      isLoading: wrapperStaticConfig.isLoading,
      error: wrapperStaticConfig.error,
    } as WrapperContextValue;
  }, [
    poolAddress,
    poolType,
    publicClient,
    wrapperStaticConfig.data,
    wrapperStaticConfig.error,
    wrapperStaticConfig.isLoading,
  ]);

  return (
    <WrapperContext.Provider value={value}>{children}</WrapperContext.Provider>
  );
};
