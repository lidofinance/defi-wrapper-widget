import { zeroAddress } from 'viem';
import { BrowserService } from '@lidofinance/browser-service';
import { test as base } from '@playwright/test';

import { getChainConfig, getNodeUrl } from './config/chainConfig';
import { testEnv } from './config/env';
import { getWalletConfigByName } from './config/walletConfig';
import { startDevServer, type DevServerHandle } from './devServer';
import { DwService } from './services/dw.service';
import { statePath } from './setup/paths';
import { readPoolRegistry } from './setup/poolRegistry';
import { getRoleAccounts, getRoleAddress } from './testData/accounts';
import type { DefiWrapperTypes } from '../src/modules/defi-wrapper';

export type TestOptions = {
  // Set per-project via playwright.config.ts `use: { poolType: 'StvPool' }`.
  poolType: DefiWrapperTypes;
  // Fixed dev-server port for this project; the suite runs with one worker.
  devServerBasePort: number;
};

type Fixtures = {
  browserWithWallet: BrowserService;
  devServer: DevServerHandle;
  dwService: DwService;
  nodeRunOptions: string[];
};

export const test = base.extend<object, TestOptions & Fixtures>({
  poolType: ['StvPool', { scope: 'worker', option: true }],
  devServerBasePort: [4000, { scope: 'worker', option: true }],

  nodeRunOptions: [
    async ({ poolType }, use) => {
      await use([`--load-state=${statePath(poolType)}`]);
    },
    { scope: 'worker' },
  ],

  browserWithWallet: [
    async ({ nodeRunOptions }, use) => {
      const { networkConfig } = getChainConfig();
      const browserService = new BrowserService({
        networkConfig,
        accountConfig: {
          SECRET_PHRASE: testEnv.WALLET_SECRET_PHRASE,
          // Only extension wallets read this; config/env.ts requires it there.
          PASSWORD: testEnv.WALLET_PASSWORD ?? '',
        },
        walletConfig: getWalletConfigByName(testEnv.WALLET_NAME),
        nodeConfig: {
          rpcUrl: networkConfig.rpcUrl,
          mockConfig: { rpcUrlToMock: [], mockEnabled: false },
          runOptions: nodeRunOptions,
          // Same port providers/clients.ts's getNodeUrl() reads — don't rely on
          // the library's default matching it.
          port: getChainConfig().nodeConfig.port,
        },
        browserOptions: { cookies: [] },
      });

      await browserService.initWalletSetup(true);
      await use(browserService);
      await browserService.teardown();
    },
    { scope: 'worker' },
  ],

  dwService: [
    async ({ browserWithWallet, devServer: _devServer }, use) => {
      const walletPage = browserWithWallet.getWalletPage();

      for (const account of getRoleAccounts(
        browserWithWallet.ethereumNodeService,
      )) {
        const alreadyImported = await walletPage.isWalletAddressExist?.(
          account.address,
        );
        if (!alreadyImported) {
          await walletPage.importKey(account.secretKey);
          await walletPage.page?.close();
        }
      }

      await walletPage.changeWalletAccountByAddress?.(
        getRoleAddress(browserWithWallet.ethereumNodeService, 'depositor'),
        true,
      );

      await use(
        new DwService(browserWithWallet.getBrowserContextPage(), walletPage),
      );
    },
    { scope: 'worker' },
  ],

  devServer: [
    async (
      // Unused, but keep it: this dependency is the only thing guaranteeing the
      // Anvil node is up before the dev server starts.
      { poolType, devServerBasePort, browserWithWallet: _browserWithWallet },
      use,
    ) => {
      const deployment = readPoolRegistry(poolType);

      const server = await startDevServer({
        port: devServerBasePort,
        poolType,
        poolAddress: deployment.pool,
        strategyAddress:
          deployment.strategy === zeroAddress ? undefined : deployment.strategy,
        nodeUrl: getNodeUrl(),
      });

      await use(server);
      await server.stop();
    },
    { scope: 'worker' },
  ],
});
