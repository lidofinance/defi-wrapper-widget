import './config/env';

import type { ReporterDescription } from '@playwright/test';

const SENSITIVE_ENV_KEYS = [
  'RPC_URL',
  'VITE_PUBLIC_EL_RPC_URLS_1',
  'VITE_PUBLIC_EL_RPC_URLS_560048',
  'TEST_WALLET_SEED_PHRASE',
  'TEST_WALLET_PASSWORD',
  'WC_PROJECT_ID',
  'VITE_WALLETCONNECT_PROJECT_ID',
];

export const getReporters = (): ReporterDescription[] => {
  const reporters: ReporterDescription[] = process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list']];

  return [
    [
      '@lidofinance/secret-guard-reporter',
      {
        reporters,
        sensitiveEnvKeys: SENSITIVE_ENV_KEYS,
      },
    ],
  ];
};
