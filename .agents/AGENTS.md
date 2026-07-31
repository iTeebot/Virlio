# Virlio Styling & Icon Guidelines

## 1. No Gradients Rule
- **NEVER EVER use gradients** anywhere in the codebase (CSS, Tailwind, inline styles, or SVG fills).
- Do NOT use `bg-gradient-to-*`, `linear-gradient`, `radial-gradient`, `from-*`, `via-*`, `to-*`, or `bg-clip-text text-transparent`.
- Always use crisp **solid colors**, defined theme tokens, background images, and solid borders.

## 2. Icon Standard Rule
- **ALWAYS use `lucide-react` icons** for all UI icons across the application.
- Do NOT use raw inline SVG icons, custom icon fonts, or emoji characters for UI icons.
- Import icon components directly from `lucide-react` (e.g. `import { ArrowRight, Zap, ShieldCheck, Sparkles, Layers } from "lucide-react"`).
