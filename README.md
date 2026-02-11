# Stv Pool Dapp Widget

[Demo widget inside of an iframe](https://lidofinance.github.io/defi-wrapper-widget/iframe.html)

### Configuration

> [!WARNING]
> Testent only, has not passed audits yet, do not apply on mainnet until further notice

Based on your deployment of Stv Pool you must fill in variables in `.env` file:

- `VITE_POOL_TYPE` - The type of stv pool (`StvPool`, `StvStETHPool`, `StvStrategyPool`)
- `VITE_POOL_ADDRESS` - The address of the pool contract
- `VITE_STRATEGY_ADDRESS` - The address of the current strategy used for StvStrategyPool (leave empty for other types)
- `VITE_WIDGET_TITLE` - Name of the pool to be displayed in the widget
- Other environment variables as seen in [`.env.example`](./.env.example)

### Building static HTML

- Use node LTS V22 or higher
- install dependencies with `yarn install`
- fill in envs in `.env`, see `.env.example` for build specific envs like base path and out dir
- run `yarn build:preview` to run a test server and preview your dapp (do not use this for production)
- build dapp with `yarn build`
- serve build from `/dist` as static HTML via your web server of choice
- you can serve app as is or embedded via iframe inside other websites

### Running with Docker

See `DOCKER.md` for Docker and Nginx setup, build, and run instructions.

### Customizing/Developing

For dev server and install dependencies and fill envs and run `yarn dev`

The dapp widget is a Single Page React App build with Chakra UI and Wagmi/Viem/React-query.
You can adjust any part of the UI as you see fit.

- For adjust visual styling and colors see `/theme` and [Chakra UI docs](https://chakra-ui.com/docs/theming/overview).
- Each pool type code is separate feature, see `/src/features`
- Each strategy for `StvStrategyPool` is a separate feature, for adding new supported strategies follow example of `/src/features/stv-strategy-pool/ggv-strategy`
- Shared logic code is stored in `/src/modules` in a relevant module folder
- Shared UI components and utils are stored in `/src/shared`
- Assets are stored in `/assets`
- `/public` contents will be copied into build directory
- for more info see [Vite Docs](https://vite.dev/)

#### Updating the header logo

The header logo is an SVG imported from `assets/icons/header_logo.svg` and rendered in `src/shared/wrapper/layout/header.tsx`.

To change it:

1. Replace `assets/icons/header_logo.svg` with your SVG (keep the same filename), or
2. Add a new SVG file in `assets/icons/` and update the import in `src/shared/wrapper/layout/header.tsx`:

```tsx
import MainLogo from 'assets/icons/your_logo.svg?react';
```

You can also adjust the rendered size in the same component:

```tsx
<MainLogo width="94px" height="23px" />
```

### Iframe Demo App

The iframe build showcases iframe embeddeding

```bash
yarn build:iframe
```

### Syncing the latest upstream commit

If you maintain a fork, run `bash sync-with-fork.sh ${RELEASE_TAG_NAME}` to fetch a tag you specify from source repo and merge it into your current branch.

### Release notifications

To get notified about new GitHub releases and be up to date with latest updates, subscribe to releases for this repository in GitHub. [The official step-by-step guide is here](https://docs.github.com/en/subscriptions-and-notifications/how-tos/managing-subscriptions-for-activity-on-github/viewing-your-subscriptions)
