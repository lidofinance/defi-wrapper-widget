import { defineConfig } from '@playwright/test';

import { getReporters } from './reportSettings';
import type { TestOptions } from './test.fixture';
import { SETUP_PROJECT_TIMEOUT, UI_TEST_TIMEOUT } from './testData/timeouts';

// Anvil port / dev server port are per-type in chainConfig.ts + here; keep this
// table as the single source for the UI project's port (see tests/CLAUDE.md).
const DEV_SERVER_PORT = {
  StvPool: 4100,
  StvStETHPool: 4200,
  StvStrategyPool: 4300,
} as const;

// One {type}-setup / {type}-ui project pair per pool type.
export default defineConfig<TestOptions>({
  timeout: UI_TEST_TIMEOUT,
  workers: 1,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: getReporters(),
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'stv-pool-setup',
      testMatch: /setup\/stvPool\.setup\.ts/,
      timeout: SETUP_PROJECT_TIMEOUT,
      use: { poolType: 'StvPool' },
    },
    {
      name: 'stv-pool-ui',
      testDir: './test/stv-pool',
      dependencies: ['stv-pool-setup'],
      use: {
        baseURL: `http://localhost:${DEV_SERVER_PORT.StvPool}`,
        poolType: 'StvPool',
        devServerBasePort: DEV_SERVER_PORT.StvPool,
      },
    },
    {
      name: 'stv-steth-setup',
      testMatch: /setup\/stvSteth\.setup\.ts/,
      timeout: SETUP_PROJECT_TIMEOUT,
      use: { poolType: 'StvStETHPool' },
    },
    {
      name: 'stv-steth-ui',
      testDir: './test/stv-steth',
      dependencies: ['stv-steth-setup'],
      use: {
        baseURL: `http://localhost:${DEV_SERVER_PORT.StvStETHPool}`,
        poolType: 'StvStETHPool',
        devServerBasePort: DEV_SERVER_PORT.StvStETHPool,
      },
    },
    {
      name: 'stv-strategy-setup',
      testMatch: /setup\/stvStrategy\.setup\.ts/,
      timeout: SETUP_PROJECT_TIMEOUT,
      use: { poolType: 'StvStrategyPool' },
    },
    {
      name: 'stv-strategy-ui',
      testDir: './test/stv-strategy',
      dependencies: ['stv-strategy-setup'],
      use: {
        baseURL: `http://localhost:${DEV_SERVER_PORT.StvStrategyPool}`,
        poolType: 'StvStrategyPool',
        devServerBasePort: DEV_SERVER_PORT.StvStrategyPool,
      },
    },
  ],
});
