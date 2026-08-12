import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../.env'), quiet: true });

// Harness env from tests/.env (fork RPC, wallet). The widget's own build-time
// env is separate and generated per worker — see devServer.ts.
const schema = z
  .object({
    // Required, no default — explicit stand switch. See chainConfig.ts.
    CHAIN_ID: z.string().min(1),
    // Anvil fork source; falls back to a public no-key RPC per chain.
    RPC_URL: z.string().url().optional(),
    TEST_WALLET_SEED_PHRASE: z.string().min(1),
    // Extension unlock password — unused by walletconnect.
    TEST_WALLET_PASSWORD: z.string().min(1).optional(),
    // walletconnect is the default: no extension, no popup clicks.
    WALLET_NAME: z.string().default('walletconnect'),
    // Read straight from process.env by wallets-testing-wallets' WCWallet.
    WC_PROJECT_ID: z.string().min(1).optional(),
  })
  // Fail at config load, not deep inside wallet setup where the cause is opaque.
  .refine((env) => env.WALLET_NAME !== 'walletconnect' || !!env.WC_PROJECT_ID, {
    path: ['WC_PROJECT_ID'],
    message: 'WC_PROJECT_ID is required when WALLET_NAME=walletconnect',
  })
  .refine(
    (env) => env.WALLET_NAME === 'walletconnect' || !!env.TEST_WALLET_PASSWORD,
    {
      path: ['TEST_WALLET_PASSWORD'],
      message:
        'TEST_WALLET_PASSWORD is required for extension wallets (WALLET_NAME=metamask | okx)',
    },
  );

export const testEnv = schema.parse({
  CHAIN_ID: process.env.CHAIN_ID,
  RPC_URL: process.env.RPC_URL,
  TEST_WALLET_SEED_PHRASE: process.env.TEST_WALLET_SEED_PHRASE,
  TEST_WALLET_PASSWORD: process.env.TEST_WALLET_PASSWORD,
  WALLET_NAME: process.env.WALLET_NAME,
  WC_PROJECT_ID: process.env.WC_PROJECT_ID,
});
