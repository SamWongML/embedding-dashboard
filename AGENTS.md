# Repository Guidelines

## Project Structure & Module Organization
This is a Next.js App Router project. Main code lives in `src/`:
- `src/app/`: routes, layouts, API route handlers, and page-level UI.
- `src/components/`: reusable UI and dashboard components.
- `src/lib/`: runtime logic, repositories, API clients, schemas, and hooks.
- `src/mocks/`: demo/mock data and MSW handlers (kept isolated by `pnpm check:mocks`).

Tests are in `tests/`:
- `tests/unit/**/*.test.ts(x)` for Vitest.
- `tests/e2e/**/*.spec.ts` for Playwright.

Other important folders:
- `public/` static assets.
- `supabase/` local Supabase stack and init files.
- `db/schema.sql` baseline schema.

## Build, Test, and Development Commands
Use `pnpm` only.
- `pnpm dev`: run local app at `http://localhost:3000`.
- `pnpm dev:api`: run in strict API mode.
- `pnpm dev:api:scenario`: API mode with scenario override (`success`, `error`, `slow`, `off`).
- `pnpm build` / `pnpm start`: production build and serve.
- `pnpm lint`: ESLint + mock-boundary check.
- `pnpm type-check` and `pnpm type-check:strict`: TypeScript validation.
- `pnpm test`, `pnpm test:coverage`: unit tests and coverage.
- `pnpm test:e2e`, `pnpm test:e2e:api`: browser E2E suites.

## Coding Style & Naming Conventions
Write TypeScript with strict types (`tsconfig.json` + strict variant). Follow ESLint (`eslint.config.mjs`) and avoid restricted barrel imports (import concrete modules, especially under `src/components/dashboard/**`).

Conventions used in this repo:
- Components/types: `PascalCase`.
- Functions/variables: `camelCase`.
- Route files: Next.js defaults (`page.tsx`, `layout.tsx`, `route.ts`).
- Test files: `*.test.ts(x)` and `*.spec.ts`.

## Testing Guidelines
Unit tests use Vitest with `happy-dom`; setup is in `tests/setup.ts`. Coverage targets `src/lib/**/*.{ts,tsx}` by default. Keep unit tests close to behavioral boundaries (repositories, schemas, runtime helpers).

E2E uses Playwright (`playwright.config.ts`), with a separate API-mode config in `playwright.api.config.ts`. Prefer stable assertions and scenario-based flows over timing-dependent checks.

## Commit & Pull Request Guidelines
Recent commits favor Conventional Commit-style prefixes (`feat:`, `feat(scope):`). Use concise, imperative subjects and keep changes focused.

For pull requests:
- Explain what changed and why.
- Link related issues/tasks.
- Include validation evidence (commands run, e.g. `pnpm lint && pnpm test`).
- Add screenshots or recordings for UI changes.
