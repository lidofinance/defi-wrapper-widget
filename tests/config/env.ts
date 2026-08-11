import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../.env'), quiet: true });

// Test-suite env, loaded from tests/.env. Kept separate from the widget's own
// build-time .env — these vars configure the harness (fork RPC, wallet), not
// the widget itself (the widget's env is generated per-worker, see devServer.ts).
const schema = z.object({
  // Which chain to fork — required, explicit stand switch, no default (see
  // config/chainConfig.ts's getChainConfig()). Listed here only so this schema
  // documents the full set of harness env vars.
  CHAIN_ID: z.string().min(1),
  // Fork source for whichever chain CHAIN_ID selects; falls back to a public
  // no-key RPC per chain (config/chainConfig.ts's CHAIN_CONFIGS) when unset.
  RPC_URL: z.string().url().optional(),
  WALLET_SECRET_PHRASE: z.string().min(1),
  WALLET_PASSWORD: z.string().min(1),
  WALLET_NAME: z.string().default('metamask'),
  // Read directly from process.env by @lidofinance/wallets-testing-wallets'
  // WCWallet — listed here only so a missing value fails fast and loudly.
  WC_PROJECT_ID: z.string().min(1).optional(),
});

export const testEnv = schema.parse({
  CHAIN_ID: process.env.CHAIN_ID,
  RPC_URL: process.env.RPC_URL,
  WALLET_SECRET_PHRASE: process.env.WALLET_SECRET_PHRASE,
  WALLET_PASSWORD: process.env.WALLET_PASSWORD,
  WALLET_NAME: process.env.WALLET_NAME,
  WC_PROJECT_ID: process.env.WC_PROJECT_ID,
});
