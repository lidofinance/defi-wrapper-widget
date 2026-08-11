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
          PASSWORD: testEnv.WALLET_PASSWORD,
        },
        walletConfig: getWalletConfigByName(testEnv.WALLET_NAME),
        nodeConfig: {
          rpcUrl: networkConfig.rpcUrl,
          mockConfig: { rpcUrlToMock: [], mockEnabled: false },
          runOptions: nodeRunOptions,
          // Pin the port explicitly to the same static config
          // providers/clients.ts's getNodeUrl() reads (config/chainConfig.ts's
          // ChainConfig.nodeConfig) — one source of truth for "where the
          // fork node listens", not an assumption that the library's default
          // happens to match.
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
      // browserWithWallet isn't read here anymore (nodeUrl now comes from
      // static config via getNodeUrl()), but it must stay a fixture
      // dependency — Playwright only guarantees the Anvil node is up before
      // devServer starts because this destructure pulls it in.
      { poolType, devServerBasePort, browserWithWallet: _browserWithWallet },
      use,
    ) => {
      const deployment = readPoolRegistry(poolType);

      const server = await startDevServer({
        port: devServerBasePort,
        poolType,
        poolAddress: deployment.pool,
        strategyAddress:
          deployment.strategy === '0x0000000000000000000000000000000000000000'
            ? undefined
            : deployment.strategy,
        nodeUrl: getNodeUrl(),
      });

      await use(server);
      await server.stop();
    },
    { scope: 'worker' },
  ],
});

export const skipIf = (condition: boolean, message: string) =>
  condition ? { annotation: { type: 'skip', description: message } } : {};
