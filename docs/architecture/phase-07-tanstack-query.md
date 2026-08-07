# Phase 07: TanStack Query v5 Integration

> **Phase Status**: NOT STARTED  
> **Target Version**: Virlio v1.0  
> **Owner**: Frontend Lead  
> **Dependencies**: Phase 05 (Server Components), Phase 06 (Server Cache)  
> **Expected Performance Gain**: Eliminates duplicate client requests, provides instant optimistic UI updates.  

---

## 1. Purpose & Scope

Integrate **TanStack Query v5** for interactive client state management, background polling, and optimistic UI updates. Remove bloated custom React context providers (`UserStoreProvider`, `TemplateProvider`).

---

## 2. Files to Create / Modify

- `apps/web/src/providers/query-provider.tsx` (NEW)
- `apps/web/src/app/layout.tsx`
- `apps/web/src/providers/user-store-provider.tsx` (DELETE/REPLACE)
- `apps/web/src/providers/template-provider.tsx` (DELETE/REPLACE)

---

## 3. Implementation Pattern

```typescript
// Optimistic UI Mutation Pattern
const queryClient = useQueryClient();

const followMutation = useMutation({
  mutationFn: (targetUserId: string) => followUserApi(targetUserId),
  onMutate: async (targetUserId) => {
    await queryClient.cancelQueries({ queryKey: ["follow", targetUserId] });
    const previousState = queryClient.getQueryData(["follow", targetUserId]);
    queryClient.setQueryData(["follow", targetUserId], { isFollowing: true });
    return { previousState };
  },
  onError: (err, targetUserId, context) => {
    queryClient.setQueryData(["follow", targetUserId], context?.previousState);
  },
});
```

---

## 4. Validation Checklist

- [ ] Interactive user actions (like, follow, bookmark) update UI instantly with 0ms delay.
- [ ] On network failure, state automatically rolls back and displays toast message.
- [ ] Unused client context providers removed from `layout.tsx`.
