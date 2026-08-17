import { parseEther } from 'viem';

import { getChainConfig } from '@tests/config';
import { FactoryContract } from '@tests/contracts';
import {
  commonPoolConfig,
  getRoleSigner,
  POOL_PARAMS,
  timelockConfig,
  vaultConfig,
} from '@tests/testData';

import { encodeMellowDeployBytes } from './mellowMock';
import type { DefiWrapperTypes } from '../../../src/modules/defi-wrapper';
import type { EthereumNodeService } from '@lidofinance/wallets-testing-nodes';
import type { PoolDeployment } from '@tests/contracts';

/**
 * Creates a fresh pool of `poolType` on the forked Anvil node behind
 * `nodeService`, using its pool creator test account. All three pool types are
 * wired up end-to-end.
 */
export const createPool = async (
  nodeService: EthereumNodeService,
  poolType: DefiWrapperTypes,
): Promise<PoolDeployment> => {
  const poolCreator = getRoleSigner(nodeService, 'poolCreator');
  const factoryContract = new FactoryContract(getChainConfig().factoryAddress);
  const params = POOL_PARAMS[poolType];
  const vault = vaultConfig(nodeService);
  const timelock = timelockConfig(nodeService);
  const common = commonPoolConfig(nodeService, poolType);
  const auxiliary = {
    allowListEnabled: params.allowListEnabled,
    allowListManager: params.allowListManager,
    mintingEnabled: params.mintingEnabled,
    reserveRatioGapBP: params.reserveRatioGapBP,
  };
  const strategyDeployBytes =
    poolType === 'StvStrategyPool'
      ? encodeMellowDeployBytes(params.allowListEnabled)
      : '0x';

  let intermediate;
  if (poolType === 'StvStrategyPool') {
    intermediate = await factoryContract.createPoolStart(
      vault,
      timelock,
      common,
      auxiliary,
      params.strategyFactory,
      strategyDeployBytes,
      poolCreator,
    );
  } else if (poolType === 'StvStETHPool') {
    intermediate = await factoryContract.createPoolStvStethStart(
      vault,
      timelock,
      common,
      params.allowListEnabled,
      params.allowListManager,
      params.reserveRatioGapBP,
      poolCreator,
    );
  } else {
    intermediate = await factoryContract.createPoolStvStart(
      vault,
      timelock,
      common,
      params.allowListEnabled,
      params.allowListManager,
      poolCreator,
    );
  }

  return factoryContract.createPoolFinish(
    vault,
    timelock,
    common,
    auxiliary,
    params.strategyFactory,
    strategyDeployBytes,
    intermediate,
    parseEther('1'),
    poolCreator,
  );
};
