import { defineConfig } from '@playwright/test';

import { getReporters } from './reportSettings';
import type { TestOptions } from './test.fixture';

// One {type}-setup / {type}-ui project pair per pool type.
export default defineConfig<TestOptions>({
  timeout: 220 * 1000,
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
      timeout: 480 * 1000,
      use: { poolType: 'StvPool' },
    },
    {
      name: 'stv-pool-ui',
      testDir: './test/stv-pool',
      dependencies: ['stv-pool-setup'],
      use: {
        baseURL: 'http://localhost:4100',
        poolType: 'StvPool',
        devServerBasePort: 4100,
      },
    },
    {
      name: 'stv-steth-setup',
      testMatch: /setup\/stvSteth\.setup\.ts/,
      timeout: 480 * 1000,
      use: { poolType: 'StvStETHPool' },
    },
    {
      name: 'stv-steth-ui',
      testDir: './test/stv-steth',
      dependencies: ['stv-steth-setup'],
      use: {
        baseURL: 'http://localhost:4200',
        poolType: 'StvStETHPool',
        devServerBasePort: 4200,
      },
    },
    {
      name: 'stv-strategy-setup',
      testMatch: /setup\/stvStrategy\.setup\.ts/,
      timeout: 480 * 1000,
      use: { poolType: 'StvStrategyPool' },
    },
    {
      name: 'stv-strategy-ui',
      testDir: './test/stv-strategy',
      dependencies: ['stv-strategy-setup'],
      use: {
        baseURL: 'http://localhost:4300',
        poolType: 'StvStrategyPool',
        devServerBasePort: 4300,
      },
    },
  ],
});
