# Phase 01: Observability & Baseline Benchmarking

> **Phase Status**: NOT STARTED  
> **Target Version**: Virlio v1.0  
> **Owner**: Lead Engineer  
> **Dependencies**: None (Baseline Setup)  
> **Expected Performance Gain**: Establishes empirical measurement baseline for TTFB, LCP, INP, and DB query counts.  

---

## 1. Purpose & Scope

Before making architectural modifications, Virlio requires full-stack telemetry to measure baseline timing across rendering, database queries, and API routes.

### Scope:
- Configure OpenTelemetry and Sentry Performance tracing.
- Enable PostgreSQL slow query logging (`log_min_duration_statement = 100`).
- Attach `Server-Timing` HTTP headers to all Next.js responses.
- Measure baseline metrics for TTFB, LCP, INP, CLS, and DB query counts per route.

---

## 2. Files to Modify & Files to Avoid

### Files to Modify / Create:
- `apps/web/src/instrumentation.ts` (NEW)
- `apps/web/src/lib/telemetry/opentelemetry.ts` (NEW)
- `apps/web/src/middleware.ts`
- `apps/web/next.config.js`

### Files to Avoid:
- Application UI components in `apps/web/src/components/`
- Application pages in `apps/web/src/app/`

---

## 3. Architecture Decisions

1. **Server-Timing Headers**: Server responses must emit `Server-Timing` headers (`db;dur=X, auth;dur=Y, total;dur=Z`) to allow browser DevTools inspection.
2. **Non-Blocking Telemetry**: Telemetry batching must execute asynchronously without introducing request latency.

---

## 4. Implementation Steps

1. Create `apps/web/src/instrumentation.ts` to register OpenTelemetry hooks on server startup.
2. Configure Sentry performance tracing in `next.config.js`.
3. Add `Server-Timing` response header generation to `middleware.ts`.
4. Run automated baseline Lighthouse CI audit against staging deployment and record benchmark data below.

---

## 5. Validation & Benchmark Checklist

- [ ] `instrumentation.ts` executes cleanly on Next.js server startup.
- [ ] Browser DevTools Network tab displays `Server-Timing` header on API responses.
- [ ] PostgreSQL logs queries exceeding 100ms.
- [ ] Baseline performance benchmarks are documented in the table below.

### Benchmark Data:

| Route / Page | Baseline TTFB | Baseline LCP | Baseline DB Queries | Baseline Score |
| :--- | :--- | :--- | :--- | :--- |
| **`/explore`** | TBD | TBD | TBD | TBD |
| **`/profiles/ateebnoone`** | TBD | TBD | TBD | TBD |
| **`/dashboard/overview`** | TBD | TBD | TBD | TBD |
| **`/leaderboard`** | TBD | TBD | TBD | TBD |

---

## 6. Rollback Instructions

If telemetry initialization causes build or runtime issues, set `NEXT_PUBLIC_ENABLE_TELEMETRY=false` in environment variables or remove `instrumentation.ts`.

---

## 7. Lessons Learned & Future Optimization Ideas

*(To be populated upon completion of Phase 01)*
