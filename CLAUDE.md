# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 16 App Router dashboard for monitoring embedding services with real-time metrics, search analytics, graph visualization, and user/workspace administration. Built with React 19, TypeScript, Tailwind CSS v4, shadcn/ui, TanStack Query, and optional Supabase backend.

## Commands

**Package Manager**: This repo uses `pnpm` exclusively.

```bash
# Development
pnpm dev                    # Start dev server with Turbopack at http://localhost:3000
pnpm dev:api                # Strict API mode (no mocks, NEXT_PUBLIC_DATA_MODE=api)
pnpm dev:api:scenario       # API mode with scenario simulation (success/error/slow)

# Build & Production
pnpm build                  # Production build
pnpm start                  # Start production server

# Quality Checks
pnpm lint                   # ESLint + mock boundary check + typography check
pnpm type-check             # TypeScript validation
pnpm type-check:strict      # Strict TypeScript validation

# Testing
pnpm test                   # Run Vitest unit tests
pnpm test:ui                # Vitest UI mode
pnpm test:coverage          # Generate coverage report
pnpm test:e2e               # Playwright E2E tests
pnpm test:e2e:api           # E2E tests in API mode
pnpm test:e2e:ui            # Playwright UI mode
```

## Architecture

### Data Flow & Repository Pattern

The app uses a **repository pattern** with dual-mode data sources:

- **API Mode** (`NEXT_PUBLIC_DATA_MODE=api`): Fetches from real backend via `src/lib/api/client.ts`
- **Demo Mode** (`NEXT_PUBLIC_DATA_MODE=demo`): Uses mock data from `src/mocks/`

Each domain has a repository factory in `src/lib/repositories/{domain}/index.ts` that returns the appropriate implementation based on `getDataMode()`. Example structure:

```
src/lib/repositories/metrics/
├── index.ts          # Factory: getMetricsRepository(mode)
├── api.ts            # Real API calls
└── types.ts          # TypeScript interfaces
```

Mock data is imported from `src/mocks/` and is strictly isolated—the `pnpm check:mocks` script enforces that no mock code leaks outside `src/mocks/`.

### Route Structure

- `src/app/(dashboard)/`: Main dashboard routes (route group, no URL segment)
  - `/metrics`, `/search`, `/records`, `/graph`, `/text-embedding`, `/image-embedding`, `/users`, `/settings`
- `src/app/login/`: Authentication page
- `src/app/api/`: API route handlers
- `src/app/auth/callback/`: OAuth callback handler

### Component Organization

- `src/components/ui/`: shadcn/ui primitives (button, dialog, etc.)
- `src/components/dashboard/`: Dashboard-specific components
  - `panels/`: Feature panels (metrics-panel, search-panel, etc.)
  - `sidebar/`: App sidebar with navigation
  - `layout/`: Layout components (app-shell, etc.)
- `src/components/charts/`: Recharts wrappers
- `src/components/providers/`: React context providers

**Important**: ESLint enforces **no barrel imports** for dashboard components. Always import from concrete files:
```typescript
// ✅ Correct
import { MetricsPanel } from '@/components/dashboard/panels/metrics/metrics-panel'

// ❌ Wrong (will fail lint)
import { MetricsPanel } from '@/components/dashboard/panels/metrics'
```

### State Management

- **TanStack Query**: Server state, caching, and data fetching (see `src/lib/hooks/use-*.ts`)
- **Zustand**: Client state for preferences and UI state
- **React Context**: Theme, account, and layout providers

### Authentication

Controlled by environment variables:
- `NEXT_PUBLIC_AUTH_MODE`: `mock` or `supabase`
- `NEXT_PUBLIC_AUTH_REQUIRED`: `true` or `false`

Middleware in `src/proxy.ts` handles Supabase auth checks and redirects. Mock mode bypasses authentication.

### Styling

- **Tailwind CSS v4** (CSS-first): Configuration in `src/app/globals.css`
- PostCSS uses `@tailwindcss/postcss` (see `postcss.config.mjs`)
- `components.json` intentionally keeps `tailwind.config` empty for v4 compatibility
- Design tokens centralized in `src/lib/design/`

## Development Scenarios

Use `NEXT_PUBLIC_DEV_API_SCENARIO` to simulate API conditions in development:

```bash
# Simulate successful responses
NEXT_PUBLIC_DEV_API_SCENARIO=success pnpm dev:api:scenario

# Simulate errors
NEXT_PUBLIC_DEV_API_SCENARIO=error pnpm dev:api:scenario

# Simulate slow responses
NEXT_PUBLIC_DEV_API_SCENARIO=slow pnpm dev:api:scenario
```

Override per-page via URL query: `?scenario=success`, `?scenario=error`, `?scenario=slow`

## Testing Strategy

**Unit Tests** (Vitest):
- Located in `tests/unit/**/*.test.ts(x)`
- Uses `happy-dom` environment
- Setup in `tests/setup.ts`
- Coverage targets `src/lib/**/*.{ts,tsx}` (excludes hooks and types)

**E2E Tests** (Playwright):
- Located in `tests/e2e/**/*.spec.ts`
- Two configs: `playwright.config.ts` (default) and `playwright.api.config.ts` (API mode)
- Prefer stable assertions over timing-dependent checks

## Local Supabase (Optional)

Minimal self-hosted stack for auth and data:

```bash
# Start containers
docker compose -f supabase/docker-compose.yml up -d

# Configure .env.local from .env.local.example
# Start app
pnpm dev
```

- Schema: `db/schema.sql` (loaded on first boot)
- Magic-link emails: Inbucket at `http://localhost:54324`
- Minimal setup: Auth + REST + gateway only

## Key Files

- `src/proxy.ts`: Next.js middleware for auth and routing
- `src/lib/api/client.ts`: API client with Zod validation
- `src/lib/runtime/data-mode.ts`: Data mode detection
- `src/lib/schemas/`: Zod schemas for all domain types
- `scripts/check-mocks.mjs`: Enforces mock isolation boundary
- `scripts/check-typography.mjs`: Typography validation

## Environment Variables

See `.env.local.example` for full list. Key variables:

- `NEXT_PUBLIC_API_URL`: Backend API URL (default: `http://localhost:8000`)
- `NEXT_PUBLIC_DATA_MODE`: `api` or `demo`
- `NEXT_PUBLIC_AUTH_MODE`: `mock` or `supabase`
- `NEXT_PUBLIC_AUTH_REQUIRED`: `true` or `false`
- `NEXT_PUBLIC_DEV_API_SCENARIO`: `off`, `success`, `error`, or `slow` (dev only)
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase instance URL

## Removing Demo Mode

When the real API is complete, remove demo/mock infrastructure:

1. Delete `src/mocks/`
2. Remove `src/lib/runtime/data-mode.ts`
3. Remove demo branches in `src/lib/repositories/*/index.ts`
4. Remove `check:mocks` script and `NEXT_PUBLIC_DATA_MODE` env var
5. Run `pnpm lint`, `pnpm type-check`, and `pnpm test`
