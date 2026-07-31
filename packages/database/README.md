# @virlio/database

Database package for Virlio providing Drizzle ORM schemas, PostgreSQL database client, seed scripts, migration tools, and environment diagnostics.

---

## Commands

```bash
# Safe environment, DNS, TCP & table health diagnostic
pnpm --filter @virlio/database db:doctor

# Generate SQL migration file from Drizzle schema definitions
pnpm dlx dotenv-cli -e apps/web/.env -- pnpm --filter @virlio/database db:generate

# Apply DDL migration file directly to PostgreSQL
pnpm dlx dotenv-cli -e apps/web/.env -- pnpm --filter @virlio/database db:migrate:direct

# Push Drizzle schema changes interactively
pnpm dlx dotenv-cli -e apps/web/.env -- pnpm --filter @virlio/database db:push

# Seed initial database records
pnpm dlx dotenv-cli -e apps/web/.env -- pnpm --filter @virlio/database db:seed
```

---

## Schema Structure (`src/schema/`)

- `auth.ts`: Auth.js / NextAuth tables (`users`, `accounts`, `sessions`, `verificationToken`).
- `brands.ts`: Brand entities and membership tables.
- `templates.ts`: Meme templates.
- `memes.ts`: User & brand generated memes.
- `engagement.ts`: Bookmarks, comments, votes, follows.
- `gamification.ts`: Streaks, achievements, badges, XP events.
- `activity.ts`: User & system activity streams.
- `stats.ts`: Analytics & aggregate performance tables.
- `storage.ts`: Cloud asset references.
