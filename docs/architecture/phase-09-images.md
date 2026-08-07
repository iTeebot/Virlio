# Phase 09: Image & CDN Optimization

> **Phase Status**: NOT STARTED  
> **Target Version**: Virlio v1.0  
> **Owner**: Frontend Lead  
> **Dependencies**: Phase 05 (Server Components)  
> **Expected Performance Gain**: CLS <0.01, WebP/AVIF automatic formats, 60% reduction in image payload size.  

---

## 1. Purpose & Scope

Replace all 32+ raw `<img>` HTML tags with Next.js `<Image />`, configure Cloudinary `f_auto,q_auto` transformations, and add inline low-resolution blur placeholders.

---

## 2. Rules & Transformation Matrix

- **Avatars (100x100)**: `f_auto,q_auto,w_100,c_fill`
- **Meme Cards (600x600)**: `f_auto,q_auto,w_600,c_fit`
- **Banners (1200x400)**: `f_auto,q_auto,w_1200,c_fill`

---

## 3. Implementation Steps

1. Import `getOptimizedImageUrl` from `apps/web/src/lib/cloudinary/transform.ts`.
2. Replace raw `<img>` tags across `brand-switcher.tsx`, `dashboard-sidebar.tsx`, `memes/page.tsx`, and `generate/page.tsx`.
3. Enable Next.js optimization in `UserAvatar` by removing `unoptimized={true}`.
4. Add SVG blur data URLs for meme template cards.

---

## 4. Validation Checklist

- [ ] Zero raw `<img>` tags remaining in codebase.
- [ ] Network tab verifies images delivered in WebP or AVIF format.
- [ ] Cumulative Layout Shift (CLS) score remains <0.01.
