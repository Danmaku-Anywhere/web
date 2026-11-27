# CLAUDE.md

Angular web app for Danmaku Anywhere ("Danmaku Somewhere"). It finds and plays videos using Kazumi rules and needs the [Danmaku Anywhere](https://github.com/Danmaku-Anywhere/danmaku-anywhere) browser extension for scraping and danmaku. Conventions and gotchas are in `AGENTS.md`.

## Layout

- The app is the repo root (`src/`, `angular.json`).
- `packages/bangumi-api` holds the generated Bangumi API types, as a workspace package.
- `@danmaku-anywhere/danmaku-model` and `@danmaku-anywhere/extension-protocol` are installed from npm. They are built and published from the `Danmaku-Anywhere/danmaku-anywhere` monorepo, so changes to them go there first. `extension-protocol` is the message format the extension speaks; installed extensions can be older or newer than this app.

## Commands

| Task         | Command                               |
| ------------ | ------------------------------------- |
| Install      | `pnpm install && pnpm build:packages` |
| Dev server   | `pnpm start`                          |
| Build        | `pnpm build`                          |
| Type check   | `pnpm type-check`                     |
| Lint and fix | `pnpm lint`                           |
| Unit tests   | `pnpm test`                           |

## Deploys

Cloudflare Workers Builds deploys the `danmaku-anywhere-web` Worker (`wrangler.json`) to danmaku.weeblify.app from `master`, and uploads a preview version for every other branch. Both builds run from the repo root with `pnpm build`, which builds `packages/bangumi-api` before the app; `pnpm -r build` would skip the app, because it does not run the root package.

## Style

Biome formats and lints (`biome.json`): single quotes, no semicolons, 2 spaces. pnpm only, never npm or yarn. PR titles follow `(app) description [DA-123]`.
