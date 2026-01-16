import React from 'react';
import { QueryClient } from '@tanstack/query-core';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from '@/config';
import { STRATEGY_LAZY } from '@/consts/react-query-strategies';

import { WrapperProvider } from '@/modules/defi-wrapper';
import { VaultProvider } from '@/modules/vaults';
import { Web3Provider } from '@/modules/web3/web3-provider';

import App from './app';

const container = document.getElementById('root');
const root = createRoot(container!); // Use createRoot for React 18+

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      ...STRATEGY_LAZY,
    },
  },
});

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider>
        <Web3Provider>
          <WrapperProvider>
            <VaultProvider>
              <App />
            </VaultProvider>
          </WrapperProvider>
        </Web3Provider>
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
