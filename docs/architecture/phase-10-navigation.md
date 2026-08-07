# Phase 10: Route Transition Prefetching & Persistent Layouts

> **Phase Status**: NOT STARTED  
> **Target Version**: Virlio v1.0  
> **Owner**: Lead Engineer  
> **Dependencies**: Phase 05 (Server Components), Phase 08 (Streaming)  
> **Expected Performance Gain**: Instant client layout transitions (<150ms) on hover and link click.  

---

## 1. Purpose & Scope

Ensure persistent layout shells remain mounted during navigation and configure link prefetching for key dashboard navigation targets.

---

## 2. Implementation Steps

1. Configure Next.js `<Link prefetch={true}>` for primary navigation in `AppHeader` and `DashboardSidebar`.
2. Ensure `(dashboard)/layout.tsx` preserves mounted sidebar/header DOM nodes across route changes.

---

## 3. Validation Checklist

- [ ] Route navigation between `/dashboard/overview` and `/dashboard/templates` executes in <150ms.
- [ ] Sidebar and Header do not re-render or flicker during sub-route navigation.
