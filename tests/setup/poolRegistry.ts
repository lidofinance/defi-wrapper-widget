import type { Address } from 'viem';
import fs from 'fs';

import { poolRegistryPath } from './paths';
import type { PoolDeployment } from '../utils/nodeHelpers/createPool';
import type { DefiWrapperTypes } from '../../src/modules/defi-wrapper';

export const writePoolRegistry = (
  poolType: DefiWrapperTypes,
  deployment: PoolDeployment,
) => {
  fs.writeFileSync(
    poolRegistryPath(poolType),
    JSON.stringify(deployment, null, 2),
  );
};

export const readPoolRegistry = (
  poolType: DefiWrapperTypes,
): PoolDeployment => {
  const raw = fs.readFileSync(poolRegistryPath(poolType), 'utf-8');
  return JSON.parse(raw) as PoolDeployment;
};

export const readPoolAddress = (poolType: DefiWrapperTypes): Address =>
  readPoolRegistry(poolType).pool;
