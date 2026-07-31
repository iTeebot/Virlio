# Virlio — Brand Meme & Viral Content Engine

Virlio is an enterprise brand meme and viral content generation platform built with Next.js 16, React 19, Auth.js v5, Drizzle ORM, PostgreSQL (Supabase), and TypeScript.

---

## Quick Start

### 1. Prerequisites
- **Node.js**: `v20+` or `v24+`
- **pnpm**: `v11+` (`corepack enable`)
- **PostgreSQL Database**: Supabase or local PostgreSQL instance

---

## 2. Environment Setup

Copy `apps/web/.env` and configure your environment variables:

```bash
cp apps/web/.env apps/web/.env.local
```

### Database Connection Configuration (`apps/web/.env`)

```env
# ── Application Runtime Database Connection ──
# Supabase Transaction Pooler (port 6543) or direct connection
DATABASE_URL="postgresql://postgres.<project_ref>:<password>@<pooler_host>:6543/postgres"

# ── Direct DDL Connection (used for migrations & Drizzle Kit) ──
# Supabase Direct PostgreSQL connection or Session Pooler host
DIRECT_DATABASE_URL="postgresql://postgres.<project_ref>:<password>@<pooler_host>:6543/postgres"
```

---

## 3. Database Doctor & Diagnostics

Before running migrations or starting the web server, run the **Virlio Database Doctor** to verify environment configuration, DNS resolution, TCP socket connectivity, PostgreSQL authentication, and table existence:

```bash
pnpm --filter @virlio/database db:doctor
```

#### Doctor Checks:
- [x] Validates `DATABASE_URL` & `DIRECT_DATABASE_URL` format.
- [x] Detects invalid/placeholder hostnames (e.g. `aws-0-region.supabase.com`).
- [x] Performs pre-flight DNS lookup & TCP connection tests.
- [x] Authenticates with PostgreSQL and checks required Auth.js tables (`users`, `accounts`, `sessions`, `verificationToken`).

---

## 4. Database Migrations Workflow

### Step 1: Generate SQL Migration Files
When updating Drizzle schema files in `packages/database/src/schema/`, generate the corresponding DDL migration SQL:

```bash
pnpm dlx dotenv-cli -e apps/web/.env -- pnpm --filter @virlio/database db:generate
```

This outputs SQL migration files into `packages/database/drizzle/` (e.g. `0000_useful_enchantress.sql`).

### Step 2: Apply Migrations to PostgreSQL
Apply the DDL migration statements directly to your active PostgreSQL database:

```bash
pnpm dlx dotenv-cli -e apps/web/.env -- pnpm --filter @virlio/database db:migrate:direct
```

Or push schema changes interactively:

```bash
pnpm dlx dotenv-cli -e apps/web/.env -- pnpm --filter @virlio/database db:push
```

### Step 3: Seed Initial Database Records (Optional)
Seed default badges, achievements, and sample data:

```bash
pnpm dlx dotenv-cli -e apps/web/.env -- pnpm --filter @virlio/database db:seed
```

---

## 5. Development Server

Start the Next.js development server:

```bash
pnpm --filter web dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Build & Production Check

Verify clean TypeScript compilation and Next.js static site generation across all 54 routes:

```bash
pnpm --filter web build
```

---

## Package Scripts Summary (`@virlio/database`)

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `db:doctor` | `tsx src/doctor.ts` | Safe environment check, DNS/TCP pre-flight, and table audit |
| `db:generate` | `drizzle-kit generate` | Generates SQL migration files from Drizzle schema |
| `db:migrate:direct` | `tsx src/migrate.ts` | Applies generated DDL migration SQL to PostgreSQL |
| `db:push` | `drizzle-kit push` | Pushes Drizzle schema changes directly to PostgreSQL |
| `db:seed` | `tsx src/seed.ts` | Seeds database with initial badges and achievement records |
