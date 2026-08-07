# Phase 04: SQL Query Optimization & Aggregation Consolidation

> **Phase Status**: NOT STARTED  
> **Target Version**: Virlio v1.0  
> **Owner**: Database Architect  
> **Dependencies**: Phase 03 (Database Indexes)  
> **Expected Performance Gain**: Consolidates 10 separate queries into 1 SQL query, saving ~200ms per dashboard load.  

---

## 1. Purpose & Scope

Currently, `userStatsEngine.getUserStatistics(userId)` executes 10 parallel queries and loads 500 rows into Node.js memory to compute totals. This phase replaces in-memory array filtering with single-query SQL aggregations and separates read queries from database mutations.

---

## 2. Files to Modify

- `apps/web/src/server/services/user-stats-engine.service.ts`
- `apps/web/src/server/services/activity-engine.service.ts`

---

## 3. SQL Aggregation Implementation

```sql
-- Single-Query User Statistics Aggregations
SELECT 
  (SELECT COUNT(*) FROM brands WHERE owner_id = $1) AS brands_owned,
  (SELECT COUNT(*) FROM brands WHERE owner_id = $1 AND LOWER(verification_status) = 'verified') AS verified_brands,
  (SELECT COUNT(*) FROM templates WHERE contributor_id = $1 AND status = 'approved' AND deleted_at IS NULL) AS approved_templates,
  (SELECT COALESCE(SUM(views_count), 0) FROM templates WHERE contributor_id = $1 AND deleted_at IS NULL) AS template_views,
  (SELECT COALESCE(SUM(upvotes_count), 0) FROM templates WHERE contributor_id = $1 AND deleted_at IS NULL) AS template_upvotes,
  (SELECT COUNT(*) FROM memes WHERE generator_id = $1 AND deleted_at IS NULL) AS total_memes,
  (SELECT COALESCE(SUM(engagement_score), 0) FROM memes WHERE generator_id = $1 AND deleted_at IS NULL) AS meme_upvotes;
```

- **Unbounded Memory Fix**: Bound `calculateStreaksFromEvents` to last 60 days (`WHERE created_at >= NOW() - INTERVAL '60 days'`).
- **Write-on-Read Elimination**: Remove DB writes (`syncOfficialBadgesAndPurgeLegacy()`, `awardBadgeBySlug()`) from read method `getUserStatistics()`.

---

## 4. Validation Checklist

- [ ] `getUserStatistics()` executes strictly **1 aggregated SQL query** for user stats.
- [ ] Read requests perform **zero database write statements**.
- [ ] User level, XP, and streak calculations match baseline values.
