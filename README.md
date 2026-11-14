# Danmaku Somewhere (Web App)

Angular web application for Danmaku Anywhere. Provides a Kazumi-style video aggregation experience in the browser.

**Requires the [Danmaku Anywhere](https://github.com/Danmaku-Anywhere/danmaku-anywhere) browser extension to function.**

## Tech Stack

- Angular 21+ with standalone components
- PrimeNG + Tailwind CSS
- TanStack Query (Angular), RxJS, Angular signals
- Artplayer for video playback

## Setup

```bash
pnpm install
pnpm build:packages
```

`build:packages` builds the Bangumi API types in `packages/bangumi-api`. The dev server, tests and type check need them; `pnpm build` runs it first on its own.

## Scripts

| Command     | Description              |
| ----------- | ------------------------ |
| `pnpm start` | Dev server with HMR      |
| `pnpm build` | Production build         |
| `pnpm test:ng` | Run unit tests (Vitest)  |
| `pnpm lint` | Biome check and fix      |

## Dependencies

- `@danmaku-anywhere/bangumi-api` (in `packages/bangumi-api`): Bangumi API types
- `@danmaku-anywhere/danmaku-model`: shared episode and comment types
- `@danmaku-anywhere/extension-protocol`: messages exchanged with the extension

The last two are published to npm from the [monorepo](https://github.com/Danmaku-Anywhere/danmaku-anywhere).

The backend base URL is `environment.apiRoot`. The Kazumi rule list and rule files are fetched from it by `features/kazumi/services/kazumi-api.ts`.
