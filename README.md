# Danmaku Somewhere (Web App)

Angular web app for Danmaku Anywhere: a Kazumi-style video aggregation site in the browser. It needs the [Danmaku Anywhere](https://github.com/Danmaku-Anywhere/danmaku-anywhere) browser extension for scraping and danmaku.

## Run

```bash
pnpm install
pnpm build:packages
pnpm start
```

`build:packages` builds the Bangumi API types in `packages/bangumi-api`, which the dev server, tests and type check need. `pnpm build` runs it first on its own.

The backend base URL is `environment.apiRoot`.

## Deploys

Cloudflare Workers Builds deploys the `danmaku-anywhere-web` Worker to danmaku.weeblify.app from `master` and uploads a preview version for every other branch.
