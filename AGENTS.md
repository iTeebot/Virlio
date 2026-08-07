# Virlio AI Agent Onboarding & Architecture Guidelines

Welcome! This document serves as the **permanent onboarding guide and strict architectural rulebook** for AI coding agents working on the Virlio codebase.

---

## 1. Project Overview & Current Status

Virlio is an AI-powered branded meme & social content automation platform built with **Next.js 16 (App Router)**, **TypeScript**, **Drizzle ORM + PostgreSQL**, and **Tailwind CSS**.

### Current Performance Architecture Status:
- **Architectural Specification**: ADR-001 Approved & Archived ([`docs/architecture/implementation-playbook.md`](docs/architecture/implementation-playbook.md)).
- **Current Active Phase**: Phase 01 (Observability & Benchmarking) — NOT STARTED.
- **Master Playbook**: All 11 architectural phase execution documents live under [`docs/architecture/`](docs/architecture/).

---

## 2. Core Architectural & Coding Principles

### A. Repository Pattern Rules (MANDATORY)
- **NEVER bypass repositories**: All database queries must originate from the Repository layer (`apps/web/src/server/repositories/`).
- **NEVER execute raw ORM queries (`db.query` / `db.select`)** directly inside Next.js Pages, Layouts, Component files, or Route Handlers.
- Direct hierarchy must be strictly maintained:  
  `Page (RSC) / Route Handler` $\rightarrow$ `Service Layer` $\rightarrow$ `Repository Layer` $\rightarrow$ `Drizzle ORM`.

### B. Server Component vs Client Component Rules
- **Default to Server Components (RSC)**: All page shells and layout components must be Server Components unless interactivity is required.
- **NEVER add `"use client"` to top-level page files** unless interactive browser state (`useSearchParams`, `useState`, `onClick`) is strictly necessary.
- Push `"use client"` directives down to tiny, isolated leaf components (e.g. `FollowButton`, `LikeButton`, `TabSwitcher`).

### C. Performance & Caching Rules
- **NEVER fetch data inside `useEffect`** if the data belongs in a Server Component or can be prefetched server-side.
- **NEVER introduce duplicate API requests** for the same resource. Consume `React.cache()` request memoization or TanStack Query.
- **NEVER break query budgets**: Respect the Maximum SQL Query Budget declared per page (e.g. Profiles $\le$ 3 queries, Dashboard $\le$ 5 queries, Explore $\le$ 2 queries).
- **ALWAYS benchmark before and after** performance-related work using baseline telemetry.

### D. Media & Styling Rules
- **No Gradients Rule**: NEVER EVER use CSS gradients anywhere in the codebase (`bg-gradient-to-*`, `linear-gradient`, `radial-gradient`, `from-*`, `via-*`, `to-*`, `bg-clip-text text-transparent`). Use crisp **solid colors**, defined theme tokens, background images, and solid borders.
- **Icon Standard Rule**: ALWAYS use `lucide-react` icons for all UI icons. Do NOT use raw inline SVG icons, custom icon fonts, or emoji characters for UI icons.
- **No Raw `<img>` Tags**: Always use Next.js `<Image />` or Cloudinary native transformation helpers (`getOptimizedImageUrl`).
- **No Mock Data Rule**: Production code must execute against real services and database repositories. Never leave dummy fallback arrays or mock JSON in production APIs.

---

## 3. Strict "Things Agents Must NEVER Do" Checklist

> [!CAUTION]
> Violating any of these rules will result in immediate PR rejection:

1. **NEVER** bypass the repository layer to execute raw `db.query` statements inside page components.
2. **NEVER** add `"use client"` to a top-level page file to fix a server/client import boundary issue—refactor the child component instead.
3. **NEVER** write database mutations (`INSERT`, `UPDATE`, `DELETE`) inside read/query methods.
4. **NEVER** use CSS gradients or raw inline SVGs for UI icons.
5. **NEVER** use mock/dummy fallbacks in production endpoints.
6. **NEVER** modify or delete existing unit/integration tests to mask a failure.
7. **NEVER** start implementing performance refactors without consulting [`docs/architecture/implementation-playbook.md`](docs/architecture/implementation-playbook.md).

---

## 4. How to Execute Work on Virlio

1. **Check Current Status**: Inspect [`docs/architecture/implementation-playbook.md`](docs/architecture/implementation-playbook.md) to see which phase is active.
2. **Read Phase Documentation**: Open the specific phase document under `docs/architecture/phase-XX-*.md` before making changes.
3. **Follow the Validation Checklist**: Complete all items in the phase checklist before marking a phase **COMPLETED**.
4. **Update the Playbook**: Update `implementation-playbook.md` status, owner, and benchmark data upon completion.
