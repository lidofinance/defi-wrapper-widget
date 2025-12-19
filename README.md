# Stv Pool Dapp Widget

[Demo widget inside of an iframe](https://friendly-adventure-3enkg54.pages.github.io/iframe.html)


### Configuration

>  [!WARNING]
> Testent only, did not pass audit, do not apply on mainnet until further notice

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

### Customizing/Developing

For dev server and install dependcies and fill envs and run `yarn dev`

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

### Iframe Demo App

The iframe build showcases iframe embeddeding

```bash
yarn build:iframe
```
