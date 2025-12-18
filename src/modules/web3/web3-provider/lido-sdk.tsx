import { createContext, useContext, useEffect, useMemo } from 'react';
import {
  useAccount,
  useConfig,
  usePublicClient,
  useSwitchChain,
  useWalletClient,
} from 'wagmi';
import { LidoSDKShares } from '@lidofinance/lido-ethereum-sdk';
import { CHAINS, LidoSDKCore } from '@lidofinance/lido-ethereum-sdk/core';
import {
  LidoSDKstETH,
  LidoSDKwstETH,
} from '@lidofinance/lido-ethereum-sdk/erc20';
import { LidoSDKStake } from '@lidofinance/lido-ethereum-sdk/stake';
import { LidoSDKStatistics } from '@lidofinance/lido-ethereum-sdk/statistics';
import { LidoSDKWithdraw } from '@lidofinance/lido-ethereum-sdk/withdraw';
import { LidoSDKWrap } from '@lidofinance/lido-ethereum-sdk/wrap';
import invariant from 'tiny-invariant';
import { USER_CONFIG } from '@/config';
// EXTRA MODULE
import { getContractAddress } from '@/config';
import { LidoSDKwETH } from '@/modules/vaults/contracts/weth';
import { useTokenTransferSubscription } from '../hooks';
import { useDappChain } from './dapp-chain';
import type { RegisteredPublicClient, RegisteredWalletClient } from '../types';

type LidoSDKContextValue = {
  chainId: CHAINS;
  core: LidoSDKCore;
  stake: LidoSDKStake;
  stETH: LidoSDKstETH;
  shares: LidoSDKShares;
  wstETH: LidoSDKwstETH;
  WETH: LidoSDKwETH;
  wrap: LidoSDKWrap;
  withdraw: LidoSDKWithdraw;
  statistics: LidoSDKStatistics;
  publicClient: RegisteredPublicClient;
  walletClient?: RegisteredWalletClient;
  subscribeToTokenUpdates: ReturnType<typeof useTokenTransferSubscription>;
};

const LidoSDKContext = createContext<LidoSDKContextValue | null>(null);
LidoSDKContext.displayName = 'LidoSDKContext';

export const useLidoSDK = () => {
  const value = useContext(LidoSDKContext);
  invariant(value, 'useLidoSDK was used outside of LidoSDKProvider');
  return value;
};

export const LidoSDKProvider = ({ children }: React.PropsWithChildren) => {
  const subscribe = useTokenTransferSubscription();

  // will only have
  const { chainId } = useDappChain();
  const { data: walletClient } = useWalletClient({ chainId });
  const publicClient = usePublicClient({ chainId });
  // reset internal wagmi state after disconnect
  const { isConnected } = useAccount();

  const wagmiConfig = useConfig();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (isConnected) {
      return () => {
        // protecs from side effect double run
        if (!wagmiConfig.state.current) {
          switchChain({
            chainId: USER_CONFIG.defaultChain as CHAINS,
          });
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  const contextValue = useMemo(() => {
    const customLidoLocatorAddress = getContractAddress(chainId, 'lidoLocator');
    invariant(
      customLidoLocatorAddress,
      '[LidoSDKProvider] lidoLocator is not defined',
    );
    const core = new LidoSDKCore({
      chainId,
      logMode: 'none',
      // @ts-ignore
      rpcProvider: publicClient,
      web3Provider: walletClient,
      customLidoLocatorAddress,
    });

    const stake = new LidoSDKStake({ core });
    const stETH = new LidoSDKstETH({ core });
    const shares = new LidoSDKShares({ core });
    const wstETH = new LidoSDKwstETH({ core });
    const WETH = new LidoSDKwETH({ core });
    const wrap = new LidoSDKWrap({ core });
    const withdraw = new LidoSDKWithdraw({ core });
    const statistics = new LidoSDKStatistics({ core });

    return {
      chainId: core.chainId,
      core,
      stake,
      stETH,
      shares,
      wstETH,
      WETH,
      wrap,
      withdraw,
      statistics,
      publicClient,
      walletClient,
      subscribeToTokenUpdates: subscribe,
    };
  }, [chainId, publicClient, subscribe, walletClient]);
  return (
    <LidoSDKContext.Provider value={contextValue}>
      {children}
    </LidoSDKContext.Provider>
  );
};
