import React from 'react';
import {
  QueryClientProvider,
  QueryClient,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query';
import { ChakraProvider, Theme } from '@chakra-ui/react';
import { ConfigProvider } from '@/config';
import { STRATEGY_LAZY } from '@/consts/react-query-strategies';

import { WrapperSwitch } from '@/features/wrapper-switch';
import { WrapperProvider } from '@/modules/defi-wrapper';
import { VaultProvider } from '@/modules/vaults';
import { Web3Provider } from '@/modules/web3/web3-provider';

import { system } from '@/theme';

import { ErrorBoundary } from './shared/components/error-boundary';
import { bigIntHashKey } from './utils/bn-int-hash-key';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error('[queryClient] Query error', {
        error,
        queryKey: query.queryKey,
        queryHash: query.queryHash,
        query,
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, mutation: any) => {
      console.error('[queryClient] Mutation error', {
        error,
        mutationKey: mutation?.mutationKey,
        mutationHash: mutation?.mutationHash,
        mutation,
      });
    },
  }),
  defaultOptions: {
    queries: {
      queryKeyHashFn: bigIntHashKey,
      ...STRATEGY_LAZY,
    },
  },
});

export const App: React.FC = () => {
  return (
    <React.StrictMode>
      <ChakraProvider value={system}>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <ConfigProvider>
              <Web3Provider>
                <WrapperProvider>
                  <VaultProvider>
                    <Theme colorPalette="blue" backgroundColor="transparent">
                      <WrapperSwitch />
                    </Theme>
                  </VaultProvider>
                </WrapperProvider>
              </Web3Provider>
            </ConfigProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </ChakraProvider>
    </React.StrictMode>
  );
};
