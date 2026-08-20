import type { Address } from 'viem';
import { spawn, type ChildProcess } from 'child_process';
import path from 'path';

import { getChainConfig, MAINNET_CHAIN_ID, testEnv } from '@tests/config';
import {
  DEV_SERVER_POLL_INTERVAL,
  DEV_SERVER_READY_TIMEOUT,
} from '@tests/testData';
import type { DefiWrapperTypes } from '../src/modules/defi-wrapper';

const WIDGET_ROOT = path.resolve(__dirname, '..');

export type DevServerHandle = {
  port: number;
  url: string;
  stop: () => Promise<void>;
};

const waitForReady = async (
  url: string,
  timeoutMs = DEV_SERVER_READY_TIMEOUT,
) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, DEV_SERVER_POLL_INTERVAL));
  }
  throw new Error(`Widget dev server did not become ready at ${url}`);
};

/**
 * Spawns `yarn dev` with a per-worker env pointing at the pool created in
 * globalSetup and at the Anvil fork node for this worker. Must run AFTER the
 * pool exists and the fork node URL is known — env is build-time for the
 * widget (see docs/context/widget-web3.md), so it can't be reconfigured once
 * the server is up.
 */
export const startDevServer = async (opts: {
  port: number;
  poolType: DefiWrapperTypes;
  poolAddress: Address;
  strategyAddress?: Address;
  nodeUrl: string;
}): Promise<DevServerHandle> => {
  const chainId = getChainConfig().networkConfig.chainId;
  const env = {
    ...process.env,
    PORT: String(opts.port),
    VITE_POOL_TYPE: opts.poolType,
    VITE_POOL_ADDRESS: opts.poolAddress,
    VITE_STRATEGY_ADDRESS: opts.strategyAddress ?? '',
    VITE_DEFAULT_CHAIN: String(chainId),
    VITE_SUPPORTED_CHAINS: String(chainId),
    [`VITE_PUBLIC_EL_RPC_URLS_${chainId}`]: opts.nodeUrl,
    // Off-mainnet the widget still needs a mainnet RPC for ENS/USD init. On
    // mainnet it would clobber the fork URL set just above.
    ...(chainId === MAINNET_CHAIN_ID
      ? {}
      : { VITE_PUBLIC_EL_RPC_URLS_1: 'https://0xrpc.io/eth' }),
    // Without it reef-knot omits the WalletConnect tile. Never hardcode a
    // fallback — Secret Guard can only mask env values, not source literals.
    VITE_WALLETCONNECT_PROJECT_ID: testEnv.WC_PROJECT_ID ?? '',
  };

  const child: ChildProcess = spawn('yarn', ['dev'], {
    cwd: WIDGET_ROOT,
    env,
    stdio: 'pipe',
  });
  let output = '';
  child.stdout?.on('data', (chunk) => (output += chunk.toString()));
  child.stderr?.on('data', (chunk) => (output += chunk.toString()));

  // Vite's default server binds to IPv6 localhost (::1) — 127.0.0.1 doesn't
  // connect on such setups, so we address it as "localhost" instead.
  const url = `http://localhost:${opts.port}`;
  try {
    await waitForReady(url);
  } catch (error) {
    child.kill('SIGTERM');
    throw new Error(
      `${(error as Error).message}\n--- yarn dev output ---\n${output}`,
    );
  }

  return {
    port: opts.port,
    url,
    stop: async () => {
      child.kill('SIGTERM');
    },
  };
};
