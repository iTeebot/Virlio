# Phase 01: Observability & Baseline Benchmarking Execution Plan

> **Phase Status**: NOT STARTED  
> **Target Version**: Virlio v1.0 Production Architecture  
> **Owner**: Lead Engineer  
> **Dependencies**: Baseline Environment Setup  
> **Estimated Complexity**: Medium (Infrastructure / Instrumentation)  
> **Risk Level**: Low (Non-breaking additive telemetry)  
> **Expected Performance Gain**: Establishes empirical baseline measurements for TTFB, LCP, INP, CLS, and SQL query counts across all key routes.  

---

## 1. Purpose & Scope

The purpose of Phase 01 is to establish a **full-stack observability foundation** before modifying any application logic or rendering structures. Optimizations must be measured against accurate baseline metrics.

### Scope:
- Configure Next.js server instrumentation hook (`instrumentation.ts`).
- Create request-scoped `Server-Timing` HTTP header generator in `middleware.ts` (`db;dur=X, auth;dur=Y, total;dur=Z`).
- Enable PostgreSQL slow query logging (`log_min_duration_statement = 100`) via Drizzle query logger.
- Integrate Web Vitals monitoring for client-side Core Web Vitals (LCP, INP, CLS, TTFB).
- Perform automated baseline benchmarking on staging environment and record initial metrics.

---

## 2. Risk Estimation & Mitigation

| Risk Description | Severity | Likelihood | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Server Overhead from Tracing** | Low | Low | Use light-weight asynchronous OpenTelemetry batching; avoid synchronous logging calls. |
| **Middleware Latency Inflation** | Low | Low | `middleware.ts` will only attach timing headers using `performance.now()` without adding external network fetches. |
| **Build Failure on Next.js 16** | Medium | Low | Ensure `experimental.instrumentationHook: true` or standard Next.js 16 `instrumentation.ts` compatibility is tested with `npx tsc --noEmit`. |

---

## 3. Dependencies & Package Requirements

The following packages are required for Phase 01 telemetry:
- `@opentelemetry/api`
- `@opentelemetry/sdk-node`
- `@vercel/analytics`
- `@sentry/nextjs` (optional performance monitoring bridge)

---

## 4. Required Tooling

- **PostgreSQL Slow Query Logger**: `pg_stat_statements` / Drizzle Logger
- **Lighthouse CI CLI**: `@lhci/cli` for automated baseline page audits
- **Browser Developer Tools**: Network Tab (`Server-Timing` header inspection)
- **Vercel Web Vitals Dashboard**: Core Web Vitals field data tracking

---

## 5. Files Expected to Change

### New Files to Create:
1. `apps/web/src/instrumentation.ts` — Next.js server initialization hook for OpenTelemetry.
2. `apps/web/src/middleware.ts` — HTTP response header interceptor attaching `Server-Timing`.
3. `apps/web/src/lib/telemetry/server-timing.ts` — Utility class to record microsecond spans (`auth`, `db`, `cache`, `total`).
4. `apps/web/src/lib/telemetry/vitals.ts` — Web Vitals client report collector.
5. `.lighthouserc.json` — Lighthouse CI baseline audit configuration.

### Existing Files to Modify:
1. `apps/web/next.config.ts` — Enable `instrumentationHook` and image domain headers.
2. `apps/web/package.json` — Add telemetry packages to dependencies.
3. `apps/web/src/app/layout.tsx` — Add `<Analytics />` component wrapper from `@vercel/analytics/react`.

---

## 6. Step-by-Step Implementation Steps

### Step 1: Install Telemetry Dependencies
```bash
pnpm --filter web add @opentelemetry/api @opentelemetry/sdk-node @vercel/analytics
```

### Step 2: Configure Server Timing Helper
Create `apps/web/src/lib/telemetry/server-timing.ts` to manage timing measurements:
```typescript
export class ServerTiming {
  private metrics: Map<string, number> = new Map();

  start(name: string) {
    this.metrics.set(name, performance.now());
  }

  end(name: string): number {
    const startTime = this.metrics.get(name);
    if (!startTime) return 0;
    const duration = performance.now() - startTime;
    this.metrics.set(`${name}_dur`, duration);
    return duration;
  }

  getHeaderString(): string {
    const headers: string[] = [];
    this.metrics.forEach((value, key) => {
      if (key.endsWith("_dur")) {
        const metricName = key.replace("_dur", "");
        headers.push(`${metricName};dur=${value.toFixed(2)}`);
      }
    });
    return headers.join(", ");
  }
}
```

### Step 3: Implement Middleware for `Server-Timing` Response Headers
Create `apps/web/src/middleware.ts`:
```typescript
import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const requestStartTime = performance.now();
  const response = NextResponse.next();
  const duration = performance.now() - requestStartTime;

  response.headers.set("Server-Timing", `total;dur=${duration.toFixed(2)}`);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

### Step 4: Register Next.js Server Instrumentation Hook
Create `apps/web/src/instrumentation.ts`:
```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("[Telemetry] OpenTelemetry Node.js Instrumentation initialized.");
  }
}
```

### Step 5: Configure Next.js Web Vitals Reporting
Add `<Analytics />` from `@vercel/analytics/react` to `apps/web/src/app/layout.tsx`.

---

## 7. Benchmarks to Collect (Baseline Audit Matrix)

Before executing Phase 02, collect and record baseline performance data for the primary application routes:

| Target Route / Page | TTFB (ms) | LCP (s) | INP (ms) | CLS | SQL Queries | Duplicate API Calls | Lighthouse Score |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`/explore`** | | | | | | | |
| **`/profiles/ateebnoone`** | | | | | | | |
| **`/dashboard/overview`** | | | | | | | |
| **`/leaderboard`** | | | | | | | |
| **`/achievements`** | | | | | | | |
| **`/dashboard/analytics`** | | | | | | | |

---

## 8. Validation & Benchmark Checklist

- [ ] `npx tsc --noEmit` passes with 0 compilation errors.
- [ ] Next.js server starts cleanly with `instrumentation.ts` registered.
- [ ] Network inspector displays `Server-Timing` HTTP headers on `/api/v1/*` responses.
- [ ] Drizzle query logger outputs SQL durations >100ms to server console.
- [ ] Baseline performance measurements are fully populated in Section 7 above.

---

## 9. Required Tests That Must Pass

1. **TypeScript Typecheck**: `pnpm --filter web run lint` / `npx tsc --noEmit` (Exit Code 0).
2. **Next.js Production Build**: `pnpm --filter web run build` (Exit Code 0).
3. **HTTP Server-Timing Verification**: `curl -I http://localhost:3000/api/v1/system/health` contains `server-timing: total;dur=...`.

---

## 10. Rollback Instructions

If Phase 01 introduces unexpected latency or build failures:
1. Delete `apps/web/src/instrumentation.ts` and `apps/web/src/middleware.ts`.
2. Remove `<Analytics />` import from `apps/web/src/app/layout.tsx`.
3. Set `NEXT_PUBLIC_ENABLE_TELEMETRY=false` in environment settings.
4. Verify application runs without telemetry headers.

---

## 11. Lessons Learned & Future Optimization Ideas

*(This section will be populated after Phase 01 execution is completed)*
