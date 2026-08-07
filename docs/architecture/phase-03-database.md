# Phase 03: Database Indexes & Query Budgets

> **Phase Status**: NOT STARTED  
> **Target Version**: Virlio v1.0  
> **Owner**: Database Architect  
> **Dependencies**: Phase 01 (Observability)  
> **Expected Performance Gain**: Prevents full table scans, reduces query execution time from >120ms to <5ms.  

---

## 1. Purpose & Scope

Audit database schema indexes and enforce strict **Max SQL Query Budgets** per route to prevent database performance degradation.

### Scope:
- Create composite database indexes for frequent filters (`memes`, `activities`, `templates`, `brand_social_connections`).
- Enforce strict query count assertions in CI pipeline.

---

## 2. Files to Modify

- `packages/database/src/schema/memes.ts`
- `packages/database/src/schema/activity.ts`
- `packages/database/src/schema/templates.ts`
- `packages/database/src/schema/social.ts`
- `packages/database/drizzle/`

---

## 3. Implementation Migration Script

```sql
-- Drizzle Database Performance Index Migration
CREATE INDEX IF NOT EXISTS memes_visibility_created_idx ON memes (visibility, deleted_at, created_at DESC);
CREATE INDEX IF NOT EXISTS memes_brand_created_idx ON memes (brand_id, created_at DESC);
CREATE INDEX IF NOT EXISTS activities_user_created_idx ON activities (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS templates_status_created_idx ON templates (status, created_at DESC);
CREATE INDEX IF NOT EXISTS brand_social_conn_brand_platform_idx ON brand_social_connections (brand_id, platform);
CREATE INDEX IF NOT EXISTS user_badges_user_unlocked_idx ON user_badges (user_id, unlocked_at DESC);
```

---

## 4. Query Budget Matrix

| Page / Route | Max Allowed SQL Queries |
| :--- | :--- |
| **Public Profile (`/profiles/[username]`)** | **Max 3 Queries** |
| **Dashboard Overview (`/dashboard/overview`)** | **Max 5 Queries** |
| **Explore Feed (`/explore`)** | **Max 2 Queries** |
| **Leaderboard (`/leaderboard`)** | **Max 2 Queries** |

---

## 5. Validation & Rollback

- [ ] Run `npx drizzle-kit generate:pg` and apply migrations.
- [ ] Verify `EXPLAIN ANALYZE` shows Index Scan instead of Seq Scan for `/explore` and `/profiles`.
- [ ] Rollback: Execute `DROP INDEX <index_name>` if migration encounters locks.
