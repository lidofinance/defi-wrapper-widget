import type { Address } from 'viem';
import fs from 'fs';
import path from 'path';

import { TESTS_ROOT } from './paths';
import type { PoolDeployment } from '../utils/nodeHelpers/createPool';
import type { DefiWrapperTypes } from '../../src/modules/defi-wrapper';

const registryPath = (poolType: DefiWrapperTypes) =>
  path.join(TESTS_ROOT, `pools.${poolType}.json`);

export const writePoolRegistry = (
  poolType: DefiWrapperTypes,
  deployment: PoolDeployment,
) => {
  fs.writeFileSync(registryPath(poolType), JSON.stringify(deployment, null, 2));
};

export const readPoolRegistry = (
  poolType: DefiWrapperTypes,
): PoolDeployment => {
  const raw = fs.readFileSync(registryPath(poolType), 'utf-8');
  return JSON.parse(raw) as PoolDeployment;
};

export const readPoolAddress = (poolType: DefiWrapperTypes): Address =>
  readPoolRegistry(poolType).pool;
