# Phase 08: Streaming & Suspense Boundaries

> **Phase Status**: NOT STARTED  
> **Target Version**: Virlio v1.0  
> **Owner**: Frontend Lead  
> **Dependencies**: Phase 05 (Server Components)  
> **Expected Performance Gain**: Page shell renders in <50ms while heavy components stream in asynchronously.  

---

## 1. Purpose & Scope

Wrap slow/heavy widgets (charts, contribution grids, social feeds) in **React Suspense** streaming boundaries paired with an isolated **Error Boundary topology**.

---

## 2. Error Boundary Topology

```
[ Root Error Boundary ]
  ├──> [ Dashboard Error Boundary ]
  │     ├──> <Suspense fallback={<SocialsSkeleton />}> ---> [ Social Connections ]
  │     └──> <Suspense fallback={<StatsSkeleton />}> ---> [ Recent Analytics ]
```

---

## 3. Implementation Steps

1. Create skeleton loader components in `apps/web/src/components/ui/skeletons/`.
2. Wrap asynchronous widget components inside `<Suspense fallback={<WidgetSkeleton />}>`.
3. Add `error.tsx` boundary files to dashboard sub-routes.

---

## 4. Validation Checklist

- [ ] Initial HTML page shell streams to browser in <50ms.
- [ ] Widget failure isolated within local Error Boundary without crashing full page layout.
