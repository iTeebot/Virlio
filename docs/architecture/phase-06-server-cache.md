# Phase 06: Next.js Server Cache (`"use cache"` & Tagging)

> **Phase Status**: NOT STARTED  
> **Target Version**: Virlio v1.0  
> **Owner**: Lead Engineer  
> **Dependencies**: Phase 05 (Server Components)  
> **Expected Performance Gain**: Serves repeated database requests from cross-request server cache (~300ms saving).  

---

## 1. Purpose & Scope

Implement modern Next.js 16 `"use cache"` directive and `cacheTag()` API to cache expensive server data lookups across requests with explicit tag invalidation.

---

## 2. Implementation Pattern

```typescript
// Modern Next.js 16 Server Data Caching Pattern
import { cacheTag, cacheLife } from "next/cache";

export async function getExploreFeedCached(page: number, limit: number) {
  "use cache";
  cacheTag("explore-feed");
  cacheLife("minutes");

  return memeRepository.findPublicMemes({ limit, offset: (page - 1) * limit });
}
```

---

## 3. Tag Invalidation Handlers

| Data Domain | Cache Tag | Invalidation Action |
| :--- | :--- | :--- |
| **Explore Feed** | `explore-feed` | `revalidateTag('explore-feed')` on meme publish / approval |
| **User Profile** | `user-[userId]` | `revalidateTag('user-[userId]')` on profile edit / email verify |
| **Brand Details** | `brand-[brandId]` | `revalidateTag('brand-[brandId]')` on brand settings update |
| **User Badges** | `badges-[userId]` | `revalidateTag('badges-[userId]')` on badge award |

---

## 4. Validation Checklist

- [ ] Subsequent page requests execute in <50ms due to Server Cache hits.
- [ ] Mutating a resource calls `revalidateTag()` and immediately updates fresh data.
