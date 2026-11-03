# GEMINI.md — ATELIER OS Engineering & Design Constitution

**Project**: ATELIER OS (`Maison AFAF EL ASSLI — دار عفاف الأصلي للأزياء الراقية`)
**Architecture**: Next.js 14 App Router + TypeScript + Tailwind CSS + Drizzle ORM + PostgreSQL

---

## 1. Hallmark Anti-AI-Slop Design Rules (`Nutlope/hallmark` v2.0.0)

### The Floor (Mandatory & Non-Waivable)
1. **Token-Only Palette & Typography**: Every color and font family must reference `:root` CSS custom properties (`--bg-canvas`, `--bg-surface`, `--brand-gold`, `--sidebar-bg`).
2. **GPU-Composited Transitions Only**: Never use `transition: all`. Never animate `width`, `height`, `top`, or `left`. Animate `transform` and `opacity` only.
3. **No Horizontal Overflow**: `html, body { overflow-x: clip; }`. Every viewport from `320px` to `1920px` must pass `document.documentElement.scrollWidth <= window.innerWidth`.
4. **Immediate Keyboard Focus**: Every interactive control (`button`, `a`, `input`, `select`, `textarea`, `[role="button"]`) must display an immediate `:focus-visible` ring (`2px solid var(--brand-gold)`).
5. **Reduced Motion Compliance**: Wrap all animations and transitions in `@media (prefers-reduced-motion: reduce)` fallbacks.
6. **Unified Lucide Vector Iconography**: Never use emoji characters as icons. Use `LucideIcon` (`1.75px` stroke width) across all navigation and contextual actions.
7. **Brand Asset Integrity**: Display the official `AFAF EL ASSLI` metallic gold crest unmodified on a dark luxury surface (`#09090B` / `#101116`).

---

## 2. Addy Osmani Engineering Workflows (`addyosmani/agent-skills`)

1. **`frontend-ui-engineering`**:
   - Separate state orchestration (`src/context/AtelierStoreContext.tsx`) from presentation (`src/components/AtelierAppShell.tsx`).
   - Provide mobile-first responsive views: stacked cards (`md:hidden`) on phones and data tables (`hidden md:block`) on desktop.
   - Maintain WCAG 2.1 AA contrast (`>= 4.5:1` for body text) in both Light and Dark modes.
2. **`api-and-interface-design`**:
   - Contract-first API design: validate all incoming payloads at `/api/atelier` and `/api/upload` using Zod schemas (`src/lib/validators.ts`).
   - Return structured error objects with accurate HTTP status codes (`400`, `413`, `415`, `422`, `500`).
   - Enforce atomic idempotency via unique `idempotency_key` constraints inside `db.transaction()`.
3. **`test-driven-development` & `code-review-and-quality`**:
   - Run `python3 tests/verify_all_workflows.py` (33 tables, Workflows A–E) and `python3 tests/security_audit.py` (SQLi, XSS, Upload Magic Bytes, Zod Boundaries, Idempotency, Secret Scan) on every change.
