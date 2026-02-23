import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { http, publicActions } from 'viem';
import { createConfig, fallback, useConnections, WagmiProvider } from 'wagmi';
import { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';
// @ts-expect-error lido ui has old package.json
import { CookieThemeProvider } from '@lidofinance/lido-ui';
import {
  getDefaultWalletsModalConfig,
  ReefKnotWalletsModal,
} from 'reef-knot/connect-wallet-modal';
import { getDefaultConfig, ReefKnotProvider } from 'reef-knot/core-react';
import { WalletIdsEthereum, WalletsListEthereum } from 'reef-knot/wallets';
import invariant from 'tiny-invariant';
import * as WagmiChains from 'wagmi/chains';
import {
  PROVIDER_BATCH_TIME,
  PROVIDER_MAX_BATCH,
  PROVIDER_POLLING_INTERVAL,
  useUserConfig,
} from '@/config';
import type {
  ChainsList,
  MainnetConfig,
  MainnetPublicClient,
  RegisteredConfig,
} from '../types';
import { SupportL1Chains } from './dapp-chain';
import { useWeb3Transport } from './use-web3-transport';

const WALLETS_PINNED: WalletIdsEthereum[] = ['browserExtension'];
const WALLETS_SHOWN: WalletIdsEthereum[] = [
  'browserExtension',
  'metaMask',
  'okx',
  'ledgerHID',
  'ledgerLive',
  'walletConnect',
  'bitget',
  'imToken',
  'ambire',
  'safe',
  'dappBrowserInjected',
  'coinbaseSmartWallet',
];
export const wagmiChainMap = Object.values(WagmiChains).reduce(
  (acc, chain) => {
    acc[chain.id] = chain;
    return acc;
  },
  {} as Record<number, WagmiChains.Chain>,
);

type Web3ProviderContextValue = {
  mainnetConfig: MainnetConfig;
  publicClientMainnet: MainnetPublicClient;
};

const Web3ProviderContext = createContext<Web3ProviderContextValue | null>(
  null,
);
Web3ProviderContext.displayName = 'Web3ProviderContext';

export const useMainnetOnlyWagmi = () => {
  const value = useContext(Web3ProviderContext);
  invariant(value, 'useMainnetOnlyWagmi was used outside of Web3Provider');
  return value;
};

export const Web3Provider: FC<PropsWithChildren> = ({ children }) => {
  const {
    defaultChain: defaultChainId,
    supportedChainIds,
    walletconnectProjectId,
    publicElRpcUrls,
  } = useUserConfig();

  const { supportedChains, defaultChain } = useMemo(() => {
    // must preserve order of supportedChainIds
    const supportedChainsList = supportedChainIds
      .map((id) => wagmiChainMap[id])
      .filter((chain) => chain) as unknown as ChainsList;

    const defaultChainEntry =
      wagmiChainMap[defaultChainId] || supportedChainsList[0];

    return {
      supportedChains: supportedChainsList,
      defaultChain: defaultChainEntry,
    };
  }, [defaultChainId, supportedChainIds]);

  const {
    rpcUrlsByChain,
    singleRpcUrlByChain,
  }: {
    rpcUrlsByChain: Record<number, string[]>;
    singleRpcUrlByChain: Record<number, string>;
  } = useMemo(() => {
    const supportedChainIdsWithMainnet = supportedChainIds.includes(
      CHAINS.Mainnet,
    )
      ? supportedChainIds
      : [CHAINS.Mainnet, ...supportedChainIds];

    return {
      rpcUrlsByChain: supportedChainIdsWithMainnet.reduce(
        (res, curr) => ({
          ...res,
          [curr]: publicElRpcUrls[curr as CHAINS] || [],
        }),
        {},
      ),
      singleRpcUrlByChain: supportedChainIdsWithMainnet.reduce(
        (res, curr) => ({
          ...res,
          [curr]: publicElRpcUrls[curr as CHAINS][0],
        }),
        {},
      ),
    };
  }, [supportedChainIds, publicElRpcUrls]);

  const { transportMap, onActiveConnection } = useWeb3Transport(
    supportedChains,
    rpcUrlsByChain,
  );

  // Separate wagmi config for readonly Mainnet (powers USD feeds, ENS and etc)
  const web3ProviderContextValue = useMemo(() => {
    const batchConfig = {
      wait: PROVIDER_BATCH_TIME,
      batchSize: PROVIDER_MAX_BATCH,
    };

    const rpcUrlMainnet = rpcUrlsByChain[CHAINS.Mainnet] ?? [];

    const mainnetConfig = createConfig({
      chains: [WagmiChains.mainnet],
      ssr: true,
      connectors: [],
      batch: {
        multicall: false,
      },
      pollingInterval: PROVIDER_POLLING_INTERVAL,
      transports: {
        [WagmiChains.mainnet.id]: fallback([
          // api/rpc
          ...rpcUrlMainnet.map((url) =>
            http(url, {
              batch: batchConfig,
              name: url,
            }),
          ),
          // fallback rpc from wagmi.chains like cloudfare-eth
          http(undefined, {
            batch: batchConfig,
            name: 'default public RPC URL',
          }),
        ]),
      },
    });

    const publicClientMainnet = mainnetConfig
      .getClient({
        chainId: CHAINS.Mainnet,
      })
      .extend(publicActions) as MainnetPublicClient;

    return { mainnetConfig, publicClientMainnet };
  }, [rpcUrlsByChain]);

  const { wagmiConfig, reefKnotConfig, walletsModalConfig } = useMemo(() => {
    return getDefaultConfig({
      // Reef-Knot config args
      rpc: singleRpcUrlByChain,
      defaultChain: defaultChain,
      walletconnectProjectId,
      walletsList: WalletsListEthereum,

      // Wagmi config args
      transports: transportMap,
      chains: supportedChains,
      autoConnect: true,
      ssr: true,
      pollingInterval: PROVIDER_POLLING_INTERVAL,
      batch: {
        multicall: false,
      },

      // Wallets config args
      ...getDefaultWalletsModalConfig(),
      walletsPinned: WALLETS_PINNED,
      walletsShown: WALLETS_SHOWN,
    });
  }, [
    singleRpcUrlByChain,
    supportedChains,
    defaultChain,
    walletconnectProjectId,
    transportMap,
  ]);

  const [activeConnection] = useConnections({ config: wagmiConfig });

  useEffect(() => {
    void onActiveConnection(activeConnection ?? null);
  }, [activeConnection, onActiveConnection]);

  return (
    <Web3ProviderContext.Provider value={web3ProviderContextValue}>
      {/* default wagmi autoConnect, MUST be false in our case, because we use custom autoConnect from Reef Knot */}
      <WagmiProvider
        config={wagmiConfig as RegisteredConfig}
        reconnectOnMount={false}
      >
        <ReefKnotProvider config={reefKnotConfig}>
          {/* lido ui provider for ReefKnotWalletsModal */}
          <CookieThemeProvider overrideThemeName="light">
            <ReefKnotWalletsModal
              style={{ maxWidth: '440px' }}
              config={walletsModalConfig}
              darkThemeEnabled={false}
            />
          </CookieThemeProvider>
          <SupportL1Chains>{children}</SupportL1Chains>
        </ReefKnotProvider>
      </WagmiProvider>
    </Web3ProviderContext.Provider>
  );
};
