import { getStvPoolContract } from './stv-pool';
import { getStvStethContract } from './stv-steth';
import type { DefiWrapperTypes } from '../types';

export const stvContractByType = (
  type: DefiWrapperTypes,
): typeof getStvPoolContract | typeof getStvStethContract => {
  switch (type) {
    case 'StvPool':
      return getStvPoolContract;
    case 'StvStrategyPool':
    case 'StvStETHPool':
      return getStvStethContract;
  }
};
