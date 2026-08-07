# Phase 05: Server Components (RSC) Migration

> **Phase Status**: NOT STARTED  
> **Target Version**: Virlio v1.0  
> **Owner**: Lead Engineer  
> **Dependencies**: Phase 02 (Auth), Phase 04 (Query Optimization)  
> **Expected Performance Gain**: Eliminates client JS bundles and post-mount `useEffect` fetch waterfalls (~1.5s faster page load).  

---

## 1. Purpose & Scope

Migrate primary pages from `"use client"` components to **React Server Components (RSC)**. Push `"use client"` directives down to small leaf components (e.g. follow buttons, like buttons, tab switchers).

---

## 2. Target Routes to Migrate

1. `/profiles/[username]/page.tsx`
2. `/explore/page.tsx`
3. `/achievements/page.tsx`
4. `/dashboard/overview/page.tsx`
5. `/leaderboard/page.tsx`

---

## 3. Architecture Component Rules

- **Server Components**: Fetch data directly via Repositories / Services. Render static HTML.
- **Client Components**: Contain ONLY dynamic browser state (`useState`, `useSearchParams`, `onClick`).

---

## 4. Implementation Steps

1. Remove `"use client";` from top of `/profiles/[username]/page.tsx`.
2. Move client-side `useEffect` fetch logic into server repository queries inside the Server Component.
3. Extract interactive elements (e.g. `FollowButton`, `ReportProfileModal`, `ShareProfileModal`) into dedicated client leaf components.
4. Repeat for `/explore`, `/achievements`, and `/dashboard/overview`.

---

## 5. Validation Checklist

- [ ] Search crawlers receive full rendered HTML payload on initial curl request.
- [ ] No layout shifts or empty loading spinners on direct navigation.
- [ ] Page JS bundle size decreases significantly.
