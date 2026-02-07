# Embedding Dashboard

Next.js App Router dashboard for monitoring embedding services, search, records, graph, and user/workspace administration.

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS v4 (CSS-first)
- shadcn/ui + Radix primitives
- TanStack Query
- Supabase (optional auth/data backend)

## Package Manager

This repo is standardized on `pnpm`.

```bash
pnpm install
```

## Local Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Mode with Local Simulation

Run strict API mode (no mocks):

```bash
pnpm dev:api
```

Run API mode with opt-in simulation:

```bash
NEXT_PUBLIC_DEV_API_SCENARIO=success pnpm dev:api:scenario
```

Supported scenarios are `off`, `success`, `error`, and `slow`.

You can also override per page using the URL query param:

```text
?scenario=success
?scenario=error
?scenario=slow
```

## Quality Checks

```bash
pnpm lint
pnpm type-check
pnpm test
pnpm test:e2e
```

## Tailwind v4 + shadcn Notes

- Tailwind is configured with CSS-first v4 setup in `src/app/globals.css`.
- `components.json` intentionally keeps `tailwind.config` empty for Tailwind v4 compatibility.
- PostCSS uses `@tailwindcss/postcss` in `postcss.config.mjs`.

## Environment Flags

- `NEXT_PUBLIC_AUTH_MODE` (`mock` or `supabase`)
- `NEXT_PUBLIC_AUTH_REQUIRED` (`true` or `false`)
- `NEXT_PUBLIC_DATA_MODE` (`api` default, or `demo` for explicit mock dataset mode)
- `NEXT_PUBLIC_DEV_API_SCENARIO` (`off`, `success`, `error`, or `slow`; only used in development)
- `NEXT_PUBLIC_SUPABASE_URL` (used for Supabase client and image remote host allow-list)

## Local Supabase (Optional)

This repo includes a minimal self-hosted Supabase stack.

1. Start containers:

```bash
docker compose -f supabase/docker-compose.yml up -d
```

2. Configure `.env.local` from `.env.local.example`.
3. Start app with `pnpm dev`.

Notes:
- `db/schema.sql` is loaded on first boot.
- Magic-link emails are available in Inbucket at `http://localhost:54324`.
- Compose setup is intentionally minimal (Auth + REST + gateway).

## Removing Demo Mocks

Mock/demo data is centralized under `src/mocks` and wired through repository factories.

To fully remove demo mode once the real API is complete:

1. Delete `src/mocks`.
2. Remove `src/lib/runtime/data-mode.ts`.
3. Remove repository demo branches in `src/lib/repositories/*/index.ts`.
4. Remove `check:mocks` and any demo env config (for example `NEXT_PUBLIC_DATA_MODE`).
5. Run `pnpm lint`, `pnpm type-check`, and `pnpm test`.
