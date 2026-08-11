import {
  createPublicClient,
  createTestClient,
  createWalletClient,
  http,
} from 'viem';

import { getNodeUrl, getViemChain } from '../config/chainConfig';
import { RPC_TRANSPORT_TIMEOUT } from '../testData/timeouts';

const getTransport = () =>
  http(getNodeUrl(), { timeout: RPC_TRANSPORT_TIMEOUT });

export const getPublicClient = () =>
  createPublicClient({ chain: getViemChain(), transport: getTransport() });

let cachedSharedWalletClient: ReturnType<typeof createWalletClient> | undefined;

export const getSharedWalletClient = () => {
  if (!cachedSharedWalletClient) {
    cachedSharedWalletClient = createWalletClient({
      chain: getViemChain(),
      transport: getTransport(),
    });
  }
  return cachedSharedWalletClient;
};

let cachedTestClient: ReturnType<typeof createTestClient> | undefined;

export const getTestClient = () => {
  if (!cachedTestClient) {
    cachedTestClient = createTestClient({
      chain: getViemChain(),
      mode: 'anvil',
      transport: getTransport(),
    });
  }
  return cachedTestClient;
};

/**
 * Advances the fork clock by `seconds` and mines a block. Used to clear
 * WithdrawalQueue.minWithdrawalDelayTime (3600s on Hoodi, see
 * config/hoodi-stv.json) before finalize() — well short of the 2-day
 * report-freshness window, so no oracle re-report is needed for the
 * happy-path milestone (see docs/context/contracts.md).
 */
export const advanceTime = async (seconds: number) => {
  const testClient = getTestClient();
  await testClient.increaseTime({ seconds });
  await testClient.mine({ blocks: 1 });
};
