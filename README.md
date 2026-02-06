This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Auth.js (Production Fallback)

Auth.js uses its own tables under an `auth` schema to avoid collisions with the domain tables in `db/schema.sql`.

1. Configure environment variables in `.env.local` (see `.env.local.example`).
2. Create the Auth.js tables:

```bash
psql "$AUTH_DATABASE_URL" -f db/auth.sql
```

If you want to share a single database, point both `DATABASE_URL` and `AUTH_DATABASE_URL` at the same Postgres instance.

## Local Supabase (Self-Hosted)

This repo includes a minimal Supabase stack (Postgres + Auth + PostgREST + a small gateway)
so the frontend can connect locally.

1. Start the containers:

```bash
docker compose -f supabase/docker-compose.yml up -d
```

2. Configure local env vars (use `.env.local.example` as the base and keep the Supabase values as-is).

3. Start the Next.js app:

```bash
npm run dev
```

Notes:
- The database schema in `db/schema.sql` is loaded automatically on first boot.
- Magic-link emails are delivered to Inbucket at `http://localhost:54324`.
- This compose file is minimal (Auth + REST). Add Realtime/Storage if you need those APIs.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
