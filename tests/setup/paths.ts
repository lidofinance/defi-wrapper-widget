import path from 'path';

// Single source of truth for the tests/ root, so state.<type>.json and
// pools.<type>.json paths can't drift between the setup entrypoint (which
// writes them) and the worker fixture (which reads them).
export const TESTS_ROOT = path.resolve(__dirname, '..');

export const statePath = (poolType: string) =>
  path.join(TESTS_ROOT, `state.${poolType}.json`);
