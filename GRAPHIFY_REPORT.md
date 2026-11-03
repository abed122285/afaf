# ATELIER OS — Codebase Knowledge Graph Report (`GRAPHIFY_REPORT.md`)

- **Project**: Maison AFAF EL ASSLI (`ATELIER OS`)
- **Total Graph Nodes**: `109`
- **Total Graph Edges**: `131`
- **Drizzle PostgreSQL Tables**: `33`
- **Service Methods & Pure Calculators**: `15`
- **Contract-First API Actions (`POST /api/atelier`)**: `20`
- **React UI & Motion Components**: `9`

## 1. Component & State Hierarchy (`EXTRACTED`)
- `src/app/page.tsx` → `AtelierStoreProvider` (`src/context/AtelierStoreContext.tsx`) → `AtelierAppShell` (`src/components/AtelierAppShell.tsx`)
- `src/components/AtelierAppShell.tsx` → `LucideIcon` (`src/components/icons/LucideIcons.tsx`), `BlurText` (`src/components/react-bits/BlurText.tsx`), `SpotlightCard` (`src/components/react-bits/SpotlightCard.tsx`), `CountUp` (`src/components/react-bits/CountUp.tsx`), `AtelierSelectiveSmoothScroll` (`src/components/motion/AtelierMotionSystem.tsx`)

## 2. API Route & Transactional Service Map (`EXTRACTED`)
- `src/app/api/atelier/route.ts` validates payloads with `src/lib/validators.ts` and dispatches `20` actions to `AtelierPostgresRepository` in `src/services/atelierService.ts`.
- `src/app/api/upload/route.ts` validates binary magic bytes, sanitizes entity paths, saves via `src/lib/storage.ts`, and logs to `attachments` and `activity_logs`.
