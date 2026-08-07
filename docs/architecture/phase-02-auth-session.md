# Phase 02: Auth Session Memoization (`React.cache`)

> **Phase Status**: NOT STARTED  
> **Target Version**: Virlio v1.0  
> **Owner**: Lead Engineer  
> **Dependencies**: Phase 01 (Observability)  
> **Expected Performance Gain**: Eliminates duplicate session/user queries, saving ~80ms per request across layouts and route handlers.  

---

## 1. Purpose & Scope

Currently, over 50 API route handlers and server layouts call `authService.getCurrentSession()` independently per request, triggering redundant database queries for session and user records.

### Scope:
- Implement request-scoped memoization wrapper around session lookups using React `cache()`.
- Refactor `authService.getCurrentSession()` to consume memoized helper `getMemoizedSession()`.
- Deduplicate client-side profile fetch loops (`UserStoreProvider` and `HeaderUserDropdown`).

---

## 2. Files to Modify & Files to Avoid

### Files to Modify:
- `apps/web/src/lib/auth-server.ts` (NEW)
- `apps/web/src/server/services/auth.service.ts`
- `apps/web/src/providers/user-store-provider.tsx`
- `apps/web/src/components/layout/header-user-dropdown.tsx`

### Files to Avoid:
- NextAuth configuration core in `apps/web/src/lib/auth/config.ts`

---

## 3. Architecture Decisions

```typescript
// Proposed Server-Scoped Session Memoization (lib/auth-server.ts)
import { cache } from "react";
import { authService } from "@/server/services";
import { userRepository } from "@/server/repositories";

export const getMemoizedSession = cache(async () => {
  return authService.getCurrentSession();
});

export const getMemoizedCurrentUser = cache(async () => {
  const session = await getMemoizedSession();
  if (!session?.user?.id) return null;
  return userRepository.findById(session.user.id);
});
```

---

## 4. Implementation Steps

1. Create `apps/web/src/lib/auth-server.ts` implementing `React.cache()` wrappers for session and current user.
2. Update `authService.getCurrentSession()` to call `getMemoizedSession()`.
3. Update `UserStoreProvider` to consume server-passed user session data instead of making a duplicate `/api/v1/users/settings/all` fetch on mount.
4. Remove redundant `/api/v1/users/check-username` fetch inside `HeaderUserDropdown`.

---

## 5. Validation Checklist

- [ ] Single HTTP request executing multiple auth checks executes `getCurrentSession()` exactly once.
- [ ] NextAuth authentication flows (login, logout, OAuth callback) remain 100% functional.
- [ ] Header avatar renders immediately from session image without secondary API fetch.

---

## 6. Rollback Instructions

If memoization issues occur, set `NEXT_PUBLIC_FF_AUTH_MEMOIZATION=false` to revert to direct `authService.getCurrentSession()` execution.

---

## 7. Lessons Learned & Future Optimization Ideas

*(To be populated upon completion of Phase 02)*
