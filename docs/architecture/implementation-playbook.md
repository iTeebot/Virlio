# Virlio Performance Architecture Implementation Playbook

> **Document Status**: Master Architecture Execution Playbook  
> **Target Version**: Virlio v1.0 Production Architecture  
> **Associated Record**: ADR-001 (Virlio Production Performance & Caching Architecture)  

---

## 1. Project Goals & Target Metrics

Virlio is undergoing a production-grade performance re-architecture to transform from a client-heavy, waterfall-prone application into a high-speed, server-first platform.

### Performance Targets (Hard SLA Criteria):
- **Initial Page Load (TTFB)**: `<150ms`
- **Client Navigation Speed**: `<150ms` (Instant layout transition)
- **Largest Contentful Paint (LCP)**: `<1.8s`
- **Interaction to Next Paint (INP)**: `<100ms`
- **Cumulative Layout Shift (CLS)**: `<0.01`
- **Lighthouse Performance Score**: `≥95 / 100`
- **Database Queries per Request**: `1 - 5 queries` (Strict Page Query Budget)
- **Duplicate Client API Calls**: `0`

---

## 2. Core Architectural Principles

1. **Server-First by Default**: Default to React Server Components (RSC). Use `"use client"` exclusively for dynamic interactivity, local UI state, or browser event handlers.
2. **Observability Before Optimization**: Measure baseline metrics before making architectural changes.
3. **Repository Pattern Isolation**: All database queries must originate from the Repository layer (`apps/web/src/server/repositories/`). Direct database calls from pages, layouts, or components are strictly forbidden.
4. **Three-Tier Caching Hierarchy**:
   - **Layer 1 (CDN/Edge)**: Cloudinary CDN, Vercel Edge CDN, Browser HTTP headers.
   - **Layer 2 (Server Cache)**: Next.js 16 `"use cache"`, `cacheTag()`, `React.cache()` request scope.
   - **Layer 3 (Client Cache)**: TanStack Query v5 for interactive state and optimistic UI.
5. **Strict Page Query Budgets**: No single request may exceed its declared maximum SQL query budget.
6. **Feature Flag Safety Net**: Roll out architectural changes behind environment feature flags (`FF_NEXT_SERVER_COMPONENTS`, `FF_TANSTACK_QUERY`).

---

## 3. Technology Stack Specification

- **Framework**: Next.js 16 (App Router, Server Components, Streaming, `"use cache"`)
- **Language**: TypeScript 5 (Strict Mode)
- **Database ORM**: Drizzle ORM + PostgreSQL
- **Server Cache**: Next.js 16 `"use cache"`, `cacheTag()`, `React.cache()`
- **Client State & Cache**: TanStack Query v5 + Zustand (UI state)
- **Styling & Assets**: Vanilla CSS / Tailwind CSS, `lucide-react` icons, Cloudinary native transformations

---

## 4. Execution Order & Phase Progress Tracker

| Phase | Phase Name | Status | Owner | Dependencies | Target Timeline |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 01** | [Observability & Benchmarking](phase-01-observability.md) | **COMPLETED** | Lead Engineer | Baseline Setup | Day 1 |
| **Phase 02** | [Auth Session Memoization](phase-02-auth-session.md) | **COMPLETED** | Lead Engineer | Phase 01 | Day 2 |
| **Phase 03** | [Database Indexes & Query Budgets](phase-03-database.md) | **COMPLETED** | DB Architect | Phase 01 | Day 3 |
| **Phase 04** | [SQL Query Optimization](phase-04-query-optimization.md) | **COMPLETED** | DB Architect | Phase 03 | Days 4–5 |
| **Phase 05** | [Server Components (RSC) Migration](phase-05-server-components.md) | **NOT STARTED** | Lead Engineer | Phase 02, 04 | Days 6–9 |
| **Phase 06** | [Next.js Server Cache (`"use cache"`)](phase-06-server-cache.md) | **NOT STARTED** | Lead Engineer | Phase 05 | Days 10–12 |
| **Phase 07** | [TanStack Query v5 Integration](phase-07-tanstack-query.md) | **NOT STARTED** | Frontend Lead | Phase 05, 06 | Days 13–15 |
| **Phase 08** | [Streaming & Suspense Boundaries](phase-08-streaming.md) | **NOT STARTED** | Frontend Lead | Phase 05, 07 | Days 16–17 |
| **Phase 09** | [Image & CDN Optimization](phase-09-images.md) | **NOT STARTED** | Frontend Lead | Phase 05 | Days 18–19 |
| **Phase 10** | [Route Transition Prefetching](phase-10-navigation.md) | **NOT STARTED** | Lead Engineer | Phase 05, 08 | Day 20 |
| **Phase 11** | [Production Verification & Certification](phase-11-production-verification.md) | **NOT STARTED** | QA / Lead | Phase 01–10 | Day 21 |

---

## 5. Rollback & Feature Flag Strategy

All major architectural refactors are guarded by environment variables:

```bash
# Production Feature Flag Configuration
NEXT_PUBLIC_FF_SERVER_COMPONENTS=true
NEXT_PUBLIC_FF_TANSTACK_QUERY=true
NEXT_PUBLIC_FF_SERVER_CACHE=true
```

### Rollback Protocol:
If a phase introduces a production regression or unexpected error spike:
1. Revert the corresponding environment feature flag to `false` in Vercel settings.
2. The application will immediately fall back to the pre-phase execution path without requiring a git revert or full redeployment.
3. Investigate OpenTelemetry logs and PgHero slow query metrics before re-enabling.

---

## 6. Coding Standards & Architectural Boundaries

- **Repository Rule**: Never call `db.query` or `db.select` inside Next.js pages, layouts, or API route handlers. Always route through `apps/web/src/server/repositories/`.
- **Client Component Rule**: Never add `"use client"` to a top-level page unless interactive browser state (`useSearchParams`, `useState`, `onClick`) is strictly required. Push `"use client"` down to tiny leaf components.
- **Icon Rule**: ALWAYS use `lucide-react` icons. Never use inline SVG icons or emojis.
- **Gradient Rule**: NEVER use CSS gradients (`bg-gradient-to-*`, `linear-gradient`). Use crisp solid colors and solid borders.
- **No Mock Data Rule**: Production code must execute against real services and database repositories.

---

## 7. Phase Overview Cards

### Phase 01: Observability & Benchmarking
- **Status**: NOT STARTED
- **Expected Gain**: Establishes baseline measurement for TTFB, LCP, INP, and query counts.
- **Files**: `apps/web/src/instrumentation.ts`, `apps/web/src/lib/telemetry/`

### Phase 02: Auth Session Memoization
- **Status**: NOT STARTED
- **Expected Gain**: Reduces redundant session lookups to 1 per request (~80ms saving per request).
- **Files**: `apps/web/src/server/services/auth.service.ts`, `apps/web/src/lib/auth-server.ts`

### Phase 03: Database Indexes & Query Budgets
- **Status**: NOT STARTED
- **Expected Gain**: Prevents full table scans, enforces max SQL query counts per route.
- **Files**: `packages/database/src/schema/*.ts`, `packages/database/drizzle/`

### Phase 04: SQL Query Optimization
- **Status**: NOT STARTED
- **Expected Gain**: Replaces 500-item memory array loads with single SQL aggregations (~200ms saving).
- **Files**: `apps/web/src/server/services/user-stats-engine.service.ts`, `activity-engine.service.ts`

### Phase 05: Server Components (RSC) Migration
- **Status**: NOT STARTED
- **Expected Gain**: Eliminates client JS bundles and post-mount `useEffect` fetch waterfalls (~1.5s faster load).
- **Files**: `apps/web/src/app/(public)/profiles/[username]/page.tsx`, `explore/page.tsx`, `achievements/page.tsx`

### Phase 06: Next.js Server Cache (`"use cache"`)
- **Status**: NOT STARTED
- **Expected Gain**: Reuses cached data across requests with tag-based invalidation (~300ms saving).
- **Files**: `apps/web/src/server/services/`, `apps/web/src/server/repositories/`

### Phase 07: TanStack Query v5 Integration
- **Status**: NOT STARTED
- **Expected Gain**: Instant client-side optimistic UI updates and zero duplicate client API requests.
- **Files**: `apps/web/src/providers/query-provider.tsx`, `apps/web/src/hooks/`

### Phase 08: Streaming & Suspense Boundaries
- **Status**: NOT STARTED
- **Expected Gain**: Progressive UI rendering; shell renders in <50ms while heavy components stream.
- **Files**: `apps/web/src/app/(dashboard)/layout.tsx`, `apps/web/src/components/ui/skeletons/`

### Phase 09: Image & CDN Optimization
- **Status**: NOT STARTED
- **Expected Gain**: CLS <0.01, WebP/AVIF automatic formats, 60% reduction in image payload size.
- **Files**: `apps/web/src/components/`, `apps/web/src/lib/cloudinary/transform.ts`

### Phase 10: Route Transition Prefetching
- **Status**: NOT STARTED
- **Expected Gain**: Instant layout transitions (<150ms) on hover and link click.
- **Files**: `apps/web/src/components/layout/app-header.tsx`, `dashboard-sidebar.tsx`

### Phase 11: Production Verification & Certification
- **Status**: NOT STARTED
- **Expected Gain**: Automated CI validation certifying Lighthouse ≥95 and Core Web Vitals SLA.
- **Files**: `.github/workflows/performance-ci.yml`, `lighthouserc.json`
