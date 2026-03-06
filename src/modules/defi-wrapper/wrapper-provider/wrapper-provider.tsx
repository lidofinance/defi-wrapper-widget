import { createContext, useContext, useEffect, useMemo } from 'react';
import { isAddressEqual, fromHex, zeroHash } from 'viem';
import { LIDO_CONTRACT_NAMES } from '@lidofinance/lido-ethereum-sdk/common';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { USER_CONFIG } from '@/config';
import {
  DashboardContract,
  StakingVaultContract,
} from '@/modules/vaults/types';
import { useLidoSDK } from '@/modules/web3';

import { BYTES_TO_STRATEGY_ID, STRATEGY_IDS } from '../const';
import {
  getWQContract,
  getStrategyContract,
  getDistributorContract,
  stvContractByType,
  WQContract,
  DistributorContract,
  StvPoolContract,
  StvStethContract,
  StrategyContract,
} from '../contracts';
import type { DefiWrapperTypes } from '../types';

export type WidgetFlow = 'strategy' | 'mint' | 'stake';

export type WrapperContextValue = {
  isLoading: boolean;
  error?: Error | null;
  // sync available contracts
  wrapperType: DefiWrapperTypes;

  // async available contracts
  withdrawalQueue?: WQContract;
  dashboard?: DashboardContract;
  stakingVault?: StakingVaultContract;
  distributor?: DistributorContract;

  // async available configuration
  configuration?: {
    name: string;
    symbol: string;
    decimals: number;
    isWhitelistEnabled: boolean;
  };

  mintingPaused: boolean;
  withdrawalsPaused: boolean;
  depositsPaused: boolean;
} & (
  | {
      wrapperType: Extract<DefiWrapperTypes, 'StvPool'>;
      wrapper: StvPoolContract;
      strategy: null;
      strategyId: null;
    }
  | {
      wrapperType: Extract<DefiWrapperTypes, 'StvStETHPool'>;
      wrapper: StvStethContract;
      strategy: null;
      strategyId: null;
    }
  | {
      wrapperType: Extract<DefiWrapperTypes, 'StvStrategyPool'>;
      wrapper: StvStethContract;
      strategy?: StrategyContract;
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
  const { core, publicClient, vaults } = useLidoSDK();

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
        contractPoolTypeHex,
        isContractWhitelistEnabled,
        //
        dashboardAddress,
        stakingVaultAddress,
        withdrawalQueueAddress,
        stethAddress,
        distributorAddress,
        //
        canonicalStethAddress,
        //
        strategyIdContract,
        isStrategyAddressAllowListed,
        isStrategyWhitelistEnabled,
        ,
      ] = await Promise.all([
        wrapper.read.name(),
        wrapper.read.symbol(),
        wrapper.read.decimals(),
        wrapper.read.poolType(),
        wrapper.read.ALLOW_LIST_ENABLED(),
        //
        wrapper.read.DASHBOARD(),
        wrapper.read.VAULT(),
        wrapper.read.WITHDRAWAL_QUEUE(),
        wrapper.read.STETH(),
        wrapper.read.DISTRIBUTOR(),
        //
        core.getContractAddress(LIDO_CONTRACT_NAMES.lido),
        //
        strategy ? strategy.read.STRATEGY_ID() : Promise.resolve(null),
        strategyAddress
          ? wrapper.read.isAllowListed([strategyAddress])
          : Promise.resolve(false),
        strategy
          ? strategy.read.ALLOW_LIST_ENABLED().catch(() => false)
          : Promise.resolve(false),
      ]);

      const poolTypeContract = fromHex(contractPoolTypeHex, 'string').replace(
        /\W/g,
        '',
      );

      const strategyId = strategyIdContract
        ? BYTES_TO_STRATEGY_ID[strategyIdContract]
        : null;

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

      const withdrawalQueueContract = getWQContract(
        withdrawalQueueAddress,
        publicClient,
      );

      const canMint: boolean =
        poolType === 'StvStrategyPool' || poolType === 'StvStETHPool';

      // read features
      const [withdrawalsFeatureId, depositsFeatureId, mintingFeatureId] =
        await Promise.all([
          wrapper.read.DEPOSITS_FEATURE(),
          withdrawalQueueContract.read.WITHDRAWALS_FEATURE(),
          canMint
            ? await (wrapper as StvStethContract).read.MINTING_FEATURE()
            : zeroHash,
        ]);

      // read features pause states
      const [withdrawalsPaused, depositsPaused, mintingPaused] =
        await Promise.all([
          withdrawalQueueContract.read.isFeaturePaused([withdrawalsFeatureId]),
          wrapper.read.isFeaturePaused([depositsFeatureId]),
          canMint ? wrapper.read.isFeaturePaused([mintingFeatureId]) : false,
        ]);

      const [stakingVault, dashboard] = await Promise.all([
        await vaults.contracts.getContractVault(stakingVaultAddress),
        await vaults.contracts.getContractVaultDashboard(dashboardAddress),
      ]);

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
          strategyIdContract,
          dashboardAddress,
          stakingVaultAddress,
          withdrawalQueueAddress,
          distributorAddress,
          isContractWhitelistEnabled,
          isStrategyWhitelistEnabled,
          mintingPaused,
          withdrawalsPaused,
          depositsPaused,
        };
        console.info(
          '__POOL_STATIC_CONFIG__',
          (window as any).__POOL_STATIC_CONFIG__,
        );
      }

      return {
        name,
        symbol,
        decimals,
        // for StvStrategyPool whitelist is per strategy
        isContractWhitelistEnabled,
        isStrategyWhitelistEnabled,
        isWhitelistEnabled: strategyAddress
          ? isStrategyWhitelistEnabled
          : isContractWhitelistEnabled,
        dashboard,
        stakingVault,

        distributor: getDistributorContract(distributorAddress, publicClient),
        withdrawalQueue: withdrawalQueueContract,
        strategy: strategyAddress
          ? getStrategyContract(strategyAddress, publicClient)
          : null,
        strategyId,
        stethAddress,
        // injected pause states
        mintingPaused,
        withdrawalsPaused,
        depositsPaused,
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
      wrapperType: poolType,
      configuration: wrapperStaticConfig.data
        ? {
            name: wrapperStaticConfig.data.name,
            symbol: wrapperStaticConfig.data.symbol,
            decimals: wrapperStaticConfig.data.decimals,
            isWhitelistEnabled: wrapperStaticConfig.data.isWhitelistEnabled,
          }
        : undefined,
      withdrawalQueue: wrapperStaticConfig.data?.withdrawalQueue,
      dashboard: wrapperStaticConfig.data?.dashboard,
      stakingVault: wrapperStaticConfig.data?.stakingVault,
      strategy: wrapperStaticConfig.data?.strategy,
      strategyId: wrapperStaticConfig.data?.strategyId,
      distributor: wrapperStaticConfig.data?.distributor,

      mintingPaused: !!wrapperStaticConfig.data?.mintingPaused,
      withdrawalsPaused: !!wrapperStaticConfig.data?.withdrawalsPaused,
      depositsPaused: !!wrapperStaticConfig.data?.depositsPaused,

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
