import { createContext, useContext, useMemo } from 'react';
import { useAccount } from 'wagmi';
import invariant from 'tiny-invariant';
import { USER_CONFIG } from '@/config';
import { LidoSDKProvider } from './lido-sdk';
import { wagmiChainMap } from './web3-provider';
import type { SupportedChainIds } from '../types';

type DappChainContextValue = {
  supportedChainIds: number[];
  isChainTypeMatched: boolean;
};

export type SupportedChainLabels = {
  [key: string]: string;
};

type UseDappChainValue = {
  chainId: SupportedChainIds;
  isSupportedChain: boolean;
  supportedChainLabels: SupportedChainLabels;
} & DappChainContextValue;

const DappChainContext = createContext<DappChainContextValue | null>(null);
DappChainContext.displayName = 'DappChainContext';

const getChainLabelById = (chainId: number) => {
  const chain = wagmiChainMap[chainId];
  return chain ? chain.name : '';
};

export const useDappChain = (): UseDappChainValue => {
  const context = useContext(DappChainContext);
  invariant(context, 'useDappChain was used outside of DappChainProvider');
  const { chainId: walletChain } = useAccount();
  return useMemo(() => {
    const supportedChainLabels = context.supportedChainIds.reduce(
      (acc, chainId) => ({
        ...acc,
        [chainId]: getChainLabelById(chainId),
      }),
      {},
    ) as SupportedChainLabels;

    return {
      ...context,
      chainId: (walletChain && context.supportedChainIds.includes(walletChain)
        ? walletChain
        : USER_CONFIG.defaultChain) as SupportedChainIds,
      isSupportedChain: walletChain
        ? context.supportedChainIds.includes(walletChain)
        : true,
      supportedChainLabels,
    };
  }, [context, walletChain]);
};

export const SupportL1Chains: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { chainId } = useAccount();

  return (
    <DappChainContext.Provider
      value={useMemo(
        () => ({
          supportedChainIds: USER_CONFIG.supportedChainIds,
          isChainTypeMatched: chainId
            ? USER_CONFIG.supportedChainIds.includes(chainId)
            : false,
        }),
        [chainId],
      )}
    >
      <LidoSDKProvider>{children}</LidoSDKProvider>
    </DappChainContext.Provider>
  );
};
