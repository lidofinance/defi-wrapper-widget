// Named timeout constants (milliseconds) — mirrors lido-autotests'
// timeout.data.ts. No inline magic numbers for waits/polls; add here instead.
export const WALLET_TILE_ENABLED_TIMEOUT = 15_000;
export const DEV_SERVER_READY_TIMEOUT = 60_000;
export const DEV_SERVER_POLL_INTERVAL = 500;
export const RPC_TRANSPORT_TIMEOUT = 60_000;
export const UI_TEST_TIMEOUT = 220_000;
export const SETUP_PROJECT_TIMEOUT = 480_000;
