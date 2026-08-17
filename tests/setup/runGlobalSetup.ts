import { statePath } from './paths';
import { writePoolRegistry } from './poolRegistry';
import { test } from '../test.fixture';
import { getRoleAddress, getRoleSigner } from '../testData/accounts';
import {
  addToAllowListViaImpersonation,
  createPool,
  ensureMellowVaultLiquidity,
  MELLOW_VAULT_LIQUIDITY_TOP_UP,
} from '../utils';
import type { DefiWrapperTypes } from '../../src/modules/defi-wrapper';

// Creates a pool and persists its Anvil state for the UI project.
export const runGlobalSetup = (poolType: DefiWrapperTypes) => {
  test.use({
    poolType,
    nodeRunOptions: [
      `--dump-state=${statePath(poolType)}`,
      '--state-interval=1',
    ],
  });

  test(`Global setup: create ${poolType}`, async ({ browserWithWallet }) => {
    const deployment = await createPool(
      browserWithWallet.ethereumNodeService,
      poolType,
    );
    writePoolRegistry(poolType, deployment);

    if (poolType === 'StvStrategyPool') {
      // The strategy allow list checks the depositor directly.
      const depositor = getRoleAddress(
        browserWithWallet.ethereumNodeService,
        'depositor',
      );
      await addToAllowListViaImpersonation(
        deployment.strategy,
        depositor,
        deployment.timelock,
      );

      const poolCreator = getRoleSigner(
        browserWithWallet.ethereumNodeService,
        'poolCreator',
      );
      await ensureMellowVaultLiquidity(
        poolCreator,
        MELLOW_VAULT_LIQUIDITY_TOP_UP,
      );
    }
  });
};
