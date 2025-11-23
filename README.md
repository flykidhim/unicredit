# UniCredit Banking – Full Starter

This is a **full Next.js 14 + Prisma** starter that gives you:

- A **UniCredit-style landing page** for `/` (header, sidebar, hero, sections, footer) with IT/EN texts.
- Simple **auth pages**:
  - `/login` – demo login form posting to `/api/auth/login`
  - `/register` – demo registration posting to `/api/auth/register`
- A demo **customer area** at `/app` that reads a seeded user, accounts and transactions from Prisma.
- A demo **admin dashboard** at `/admin` that lists users, accounts and transactions.
- **Prisma** models for `User`, `Account`, `Transaction`, `ContentItem`, with enums for roles, statuses, etc.
- Fully wired TailwindCSS design matching the UniCredit Privati landing you described.

> ⚠️ Auth is **demo-only**: passwords are stored in clear text in the seed, and the login endpoint does not set
> real sessions or cookies. This is for UI + DB structure only; you will plug real auth (NextAuth, Clerk, etc.).

## Getting started

1. Install deps:

```bash
pnpm install     # or npm install / yarn
```

2. Copy `.env.example` to `.env` and set `DATABASE_URL` to your Neon / Postgres URI.

3. Run Prisma:

```bash
pnpm prisma:generate
pnpm prisma:migrate --name init
pnpm prisma:seed
```

4. Start dev server:

```bash
pnpm dev
```

5. Visit:

- `http://localhost:3000/` – marketing landing (UniCredit-style).
- `http://localhost:3000/login` – login form (demo).
- `http://localhost:3000/register` – register form (demo).
- `http://localhost:3000/app` – customer dashboard for `mario.rossi@example.com` (from seed).
- `http://localhost:3000/admin` – admin overview (users, accounts, transactions).

## Where to plug real auth

- Replace `passwordHash` usage and `/api/auth/*` routes with a proper auth provider:
  - NextAuth, Clerk, Auth.js, etc.
- Add middleware or server-side checks to protect `/app` and `/admin` routes based on user role.
- Enhance transactions with more fields: category, counterparty IBAN, etc.
