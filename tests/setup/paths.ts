import path from 'path';

import type { DefiWrapperTypes } from '../../src/modules/defi-wrapper';

// Single source of truth for the tests/ root, so the setup entrypoint and the
// worker fixture can't disagree on where state/pools files live.
export const TESTS_ROOT = path.resolve(__dirname, '..');

export const statePath = (poolType: DefiWrapperTypes) =>
  path.join(TESTS_ROOT, `state.${poolType}.json`);

export const poolRegistryPath = (poolType: DefiWrapperTypes) =>
  path.join(TESTS_ROOT, `pools.${poolType}.json`);
