# E2E test suite

End-to-end UI tests for the Stv Pool widget, written with Playwright.

Every run forks a real chain (Ethereum mainnet or Hoodi) into a local
[Anvil](https://book.getfoundry.sh/anvil/) node, creates a fresh pool inside
that fork, starts the widget's dev server against it and drives the UI with a
real wallet. There is no shared test stand: the tests bring their own
environment up and throw it away afterwards.

## What is covered

One happy-path scenario per pool type. Each step is asserted twice — in the UI
and against on-chain state read with viem.

| Suite               | Pool type         | Flow                                                                                                                                                                                    |
| ------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `test/stv-pool`     | `StvPool`         | connect → deposit ETH → request withdrawal → finalize (operator action, off-UI) → claim ETH                                                                                             |
| `test/stv-steth`    | `StvStETHPool`    | connect → deposit ETH (mints stETH in the same tx) → request withdrawal with full stETH repay (3 signed txs) → finalize → claim ETH                                                     |
| `test/stv-strategy` | `StvStrategyPool` | connect → deposit into the Mellow async queue → make deposit claimable → request exit from Mellow → claim wstETH → Process (creates the Lido withdrawal request) → finalize → claim ETH |

## Requirements

- **Node 22** (see `.nvmrc`).
- **Yarn 4** — `corepack enable`, then install the widget and E2E projects as
  shown below.
- **Foundry** — `anvil` must be on your `PATH`
  ([`foundryup`](https://book.getfoundry.sh/getting-started/installation)).
  The suite spawns Anvil itself; it does not connect to a running node.
- **Chromium for Playwright** — `yarn --cwd tests playwright install chromium`.
- **Free ports**: `4100`, `4200`, `4300` (widget dev servers) and `8545` for
  mainnet or `8045` for Hoodi (Anvil). A leftover `anvil` or `yarn dev` process
  from a killed run will block the next one.

## Setup

```bash
yarn install
yarn --cwd tests install
yarn --cwd tests playwright install chromium

cp tests/.env.example tests/.env
```

Then fill it in:

| Variable                  | Required                         | Description                                                                                                                                                                                                                                                                                    |
| ------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CHAIN_ID`                | **yes**                          | Which chain to fork: `1` (mainnet) or `560048` (Hoodi). No default — this is an explicit switch                                                                                                                                                                                                |
| `RPC_URL`                 | no                               | Fork source for that chain. When unset, a public no-key RPC is used: `https://ethereum-rpc.publicnode.com` (mainnet) or `https://0xrpc.io/hoodi` (Hoodi). Works out of the box, but public endpoints are slower and rate-limited — a dedicated RPC makes runs noticeably faster and less flaky |
| `WALLET_NAME`             | no (defaults to `walletconnect`) | `walletconnect`, `metamask` or `okx`                                                                                                                                                                                                                                                           |
| `TEST_WALLET_SEED_PHRASE` | **yes**                          | For `walletconnect` — the EOA that signs (derived at index 0). For `metamask`/`okx` — the onboarding seed phrase, which **must differ** from Anvil's default `test test … junk` mnemonic, otherwise importing the test account keys fails as duplicates                                        |
| `TEST_WALLET_PASSWORD`    | only `metamask` / `okx`          | Extension unlock password: 8+ characters, at least one digit and one symbol                                                                                                                                                                                                                    |
| `WC_PROJECT_ID`           | only `walletconnect`             | WalletConnect Cloud project id from [dashboard.reown.com](https://dashboard.reown.com)                                                                                                                                                                                                         |

## Running

```bash
yarn test:e2e          # all three pool types
yarn test:stv-pool     # StvPool only
yarn test:stv-steth    # StvStETHPool only
yarn test:stv-strategy # StvStrategyPool only
```

The per-type scripts target the UI project and pull in their setup project
automatically:

```jsonc
"test:stv-pool":     "playwright test -c playwright.config.ts --project=stv-pool-ui",
"test:stv-steth":    "playwright test -c playwright.config.ts --project=stv-steth-ui",
"test:stv-strategy": "playwright test -c playwright.config.ts --project=stv-strategy-ui",
```

Any Playwright flag can be appended:

```bash
# watch the browser / step through
yarn test:stv-pool --headed
yarn test:stv-pool --debug
yarn --cwd tests playwright test -c playwright.config.ts --ui

# narrow down
yarn --cwd tests playwright test -c playwright.config.ts --grep "claim"
yarn --cwd tests playwright test -c playwright.config.ts --last-failed

# re-run against the pool that is already on disk, skipping pool creation
yarn --cwd tests playwright test -c playwright.config.ts --project=stv-pool-ui --no-deps
```

Timeouts are 220s per UI test and 480s for a setup project (pool creation is
slow). Tests run with a single worker, sequentially — one Anvil node, one dev
server and one wallet exist at a time.

### Artifacts

| Path                       | What it is                                                            |
| -------------------------- | --------------------------------------------------------------------- |
| `tests/playwright-report/` | HTML report (`yarn --cwd tests playwright show-report`)               |
| `tests/test-results/`      | Screenshots and traces, kept only for failures                        |
| `tests/state.<type>.json`  | Anvil state snapshot of the created pool                              |
| `tests/pools.<type>.json`  | Addresses of the created pool                                         |
| `local_fork_config.json`   | Fork metadata written by the node service (accounts, block, endpoint) |

## How it works

**One stand, three pool types.** The protocol is deployed once per chain; the
widget supports three pool types on top of it. The suite covers all three
against the same deployment and scales to either chain by flipping `CHAIN_ID` —
mainnet and Hoodi differ only by the address set in `config/chainConfig.ts`.

**Fork, not a live stand.** Nothing here talks to a shared environment. The
chain is forked locally, so real users can never pollute the state a test
depends on, and a test can impersonate accounts, mint balances and move time
freely.

**Two Playwright projects per pool type.** `playwright.config.ts` defines a
`<type>-setup` / `<type>-ui` pair:

| Project        | Runs                    | Does                                                                                          |
| -------------- | ----------------------- | --------------------------------------------------------------------------------------------- |
| `<type>-setup` | `setup/<type>.setup.ts` | Creates a fresh pool in the fork and dumps the node state to `state.<type>.json`              |
| `<type>-ui`    | `test/<type>/`          | Declares `dependencies: [<type>-setup]` and boots Anvil with `--load-state=state.<type>.json` |

The setup project writes two artifacts that the UI project consumes:

- `state.<type>.json` — an Anvil snapshot of the whole fork with the pool
  already created and, for `StvStrategyPool`, the depositor allow-listed and the
  Mellow vault topped up with liquidity.
- `pools.<type>.json` — the deployed addresses (pool, vault, dashboard,
  withdrawal queue, distributor, timelock, strategy) plus `poolType`, read by
  the specs and by the dev server fixture.

**The snapshot is reusable.** The UI project only loads the state, it never
dumps it back, so `state.<type>.json` keeps representing "pool exists, no
deposits yet" no matter how the run ended. That makes re-runs cheap: pass
`--no-deps` to skip pool creation and start straight from the existing
snapshot — useful while debugging a failing spec. The snapshot is tied to the
fork block it was taken at; delete `tests/state.*.json` and
`tests/pools.*.json` to force a clean re-create.

**Each pool type is isolated.** Its own snapshot, its own address registry and
its own dev-server port (`4100` / `4200` / `4300`), so switching between types
never reuses another type's state.

**The dev server starts inside a worker fixture.** The widget reads its
configuration from `import.meta.env`, which Vite inlines at build time — pool
address and RPC URL cannot be changed at runtime. Since both are only known
after the pool has been created inside the fork, the suite spawns `yarn dev`
itself, with the right env, after setup has run, instead of using Playwright's
`webServer` (which would start too early).

## Wallets

`walletconnect` is the default and the recommended path: a headless
WalletConnect SignClient signs transactions directly, with no browser extension
and no popup windows.

Chromium itself still runs headed on every wallet — `browser-service` defaults to
`headless: false` — so CI wraps `yarn test:e2e` in `xvfb-run --auto-servernum`.

`metamask` and `okx` drive a real extension instead. They are supported and
selectable via `WALLET_NAME`, but need `TEST_WALLET_PASSWORD`, are slower and are
more prone to popup race conditions.

## Secret protection in reports

All reporters are wrapped in
[`@lidofinance/secret-guard-reporter`](https://www.npmjs.com/package/@lidofinance/secret-guard-reporter),
configured in `tests/reportSettings.ts`. It is the only top-level reporter;
`list`, `github` and `html` are nested inside it, so every piece of output
passes through the scrubber first.

It replaces the runtime values of the env variables listed in
`SENSITIVE_ENV_KEYS` everywhere they can leak:

- live `stdout` / `stderr`,
- error messages and stack traces,
- text attachments and zip trace archives,
- every text file in `playwright-report/` after the run, including base64-embedded
  traces inside `index.html`.

This matters most for public repositories: a Playwright report uploaded as a CI
artifact is downloadable by anyone who can see the workflow run, and a fork RPC
URL with an API key or a wallet mnemonic in a trace would be exposed for good.

**When you add a new secret-bearing env variable, add it to
`SENSITIVE_ENV_KEYS`** — the reporter matches concrete values, not variable
names, so an unlisted variable is not protected. Values shorter than 5
characters are ignored to avoid false positives.

## CI

`.github/workflows/ui_tests.yml` runs the full suite on every non-draft pull
request and on demand via **Run workflow**, which takes three inputs:

The workflow installs the widget and `tests` as separate Yarn projects. A
regular widget install does not include the E2E wallet or browser tooling.

| Input     | Default         | Meaning                                                                                                     |
| --------- | --------------- | ----------------------------------------------------------------------------------------------------------- |
| `chain`   | `mainnet`       | `mainnet` or `hoodi` → `CHAIN_ID` `1` / `560048`                                                            |
| `rpc_url` | empty           | **Optional.** When empty, `secrets.RPC_URL` is used; if that is unset too, the public per-chain RPC applies |
| `wallet`  | `walletconnect` | `walletconnect` or `metamask` → `WALLET_NAME`                                                               |

Wallet credentials come from repository secrets
(`TEST_WALLET_SEED_PHRASE`, `TEST_WALLET_PASSWORD`; WalletConnect uses the
`VITE_WALLETCONNECT_PROJECT_ID` repository variable). Failing tests are
retried once. The HTML report and `test-results/` are uploaded as artifacts and
kept for 5 days.

## Layout

| Path                           | Contents                                                                                      |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| `setup/`                       | Pool creation, the `state.*.json` / `pools.*.json` handoff and the setup-project entrypoints  |
| `test/<type>/`                 | The specs themselves, one directory per pool type                                             |
| `pages/`, `pages/elements/`    | Locators and atomic single-step UI actions                                                    |
| `services/`                    | `DwService` — multi-step flows composed from page objects                                     |
| `contracts/`, `contracts/abi/` | One viem wrapper class per contract, plus the ABIs                                            |
| `providers/`                   | viem public / wallet / test clients and fork time control                                     |
| `utils/nodeHelpers/`           | Fork manipulation: impersonation, oracle and Mellow report injection, withdrawal finalization |
| `testData/`                    | Role accounts, per-pool-type creation parameters, named timeouts                              |
| `config/`                      | Env parsing, per-chain addresses and node settings, wallet selection                          |
| `test.fixture.ts`              | Worker-scoped fixtures: Anvil + wallet, dev server, page-object facade                        |
| `devServer.ts`                 | Spawns the widget's `yarn dev` with per-run env                                               |
| `playwright.config.ts`         | Project pairs, timeouts, ports                                                                |
| `reportSettings.ts`            | Reporter setup and the secret list                                                            |
