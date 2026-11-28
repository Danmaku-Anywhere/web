# AGENTS.md

## Conventions

- Standalone components only, no NgModules
- `input()`/`output()` functions, not decorators
- Signals and `computed()` for state
- `ChangeDetectionStrategy.OnPush` always
- Native control flow (`@if`, `@for`, `@switch`), not structural directives
- `injectQuery`/`injectMutation` from TanStack Query
- `inject()`, not constructor injection
- Reactive forms, not template-driven
- `class`/`style` bindings, not `ngClass`/`ngStyle`
- `providedIn: 'root'` for singleton services

## Traps

- Tests run on Vitest + jsdom (`pnpm test`). Specs import from `vitest`, not Jasmine.
- Build with `pnpm build`, not `pnpm -r build`. The recursive form skips the root app and builds only the packages.
- `@danmaku-anywhere/danmaku-model` and `@danmaku-anywhere/extension-protocol` come from npm and are built in the `Danmaku-Anywhere/danmaku-anywhere` monorepo. Change them there first.
- Installed extensions can be older or newer than this app, so the extension protocol must tolerate version skew.

## Rules

- pnpm only, never npm or yarn.
- PR titles: `(app) <description> [DA-123]`.
- Comments only for what the code cannot say: a hidden constraint, a trap, a workaround. No narration, history or defensive argument.
- No em dashes (U+2014) in code, comments or docs.
