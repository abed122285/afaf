# TOOLCHAIN.md — ATELIER OS Professional AI Engineering Toolchain Report

**Project**: ATELIER OS (`Maison AFAF EL ASSLI — دار عفاف الأصلي للأزياء الراقية`)
**Environment**: Gemini 4 Argon Autonomous Task Mode (`Linux 4.19.0-gvisor x86_64`, Node `v18.20.4`, npm `9.2.0`, Python `3.11.2`, Headless Chromium `155.0.8059.79`, Selenium `4.8.3`, Git `2.39.5`)
**Verification Date**: `2026-11-03` (`Africa/Algiers`)

---

## 1. Environment Capability Audit & Tools Inspected

Before installing or configuring any package, a full runtime capability audit was executed on the active execution environment:

| Tool / Runtime | Audited Command / Mechanism | Detected Status in Task Mode VM | Resolution & Integration Strategy |
|---|---|---|---|
| **Execution Harness** | `uname -a`, native tool declarations | **Gemini 4 Argon Task Mode** (Sandboxed Linux VM + Native Agent Skill/Browse APIs) | Used native `skills:save_skill`, `lookup_skills`, `google:search`, `google:browse`, and `execute_bash`. |
| **Node.js & npm** | `node -v` / `npm -v` / `npx -v` | Installed (`v18.20.4` / `9.2.0`) | Used for TypeScript/JS validation and `package.json` dependency management (`gsap`, `@gsap/react`, `lenis`). |
| **Python & pip** | `python3 --version` / `pip --version` | Installed (`Python 3.11.2` / `pip 24.2`) | Used for AST codebase graph generation (`scripts/generate_codebase_graph.py`), SQLite/Drizzle workflow tests (`tests/verify_all_workflows.py`), and security auditing (`tests/security_audit.py`). |
| **Browser Automation** | `/usr/bin/chromium --version` + `selenium` | Installed (`Chromium 155.0.8059.79` + `selenium 4.8.3`) | Used for automated 6-viewport responsive, RTL/LTR, dark/light, WCAG accessibility, and animation performance testing. |
| **Hallmark (`Nutlope/hallmark`)** | Official `SKILL.md` v2.0.0 inspection + `skills:save_skill` | Inspected & Installed in Agent Skill Registry (`user:hallmark`) + `GEMINI.md` + `.hallmark/preflight.json` | Applied **The Floor** (12 non-waivable rules, CSS line-1 stamp, GPU-only `transform`/`opacity` transitions, `:focus-visible`, `overflow-x: clip`, `prefers-reduced-motion`). |
| **Addy Osmani Agent Skills (`addyosmani/agent-skills`)** | Official `SKILL.md` inspection + `skills:save_skill` | Inspected & Installed (`user:frontend-ui-engineering`, `user:api-and-interface-design`) + `GEMINI.md` | Applied contract-first API design, Zod boundary validation, atomic idempotency keys, and component state separation. |
| **Context7 (`context7.com`)** | Official documentation lookup (`google:search` / `google:browse`) | Gemini CLI (`gemini mcp add`) not present in Task Mode VM; used live documentation retrieval | Verified current APIs for Next.js 14 App Router, Drizzle ORM transactions, GSAP `useGSAP`, Lenis, and React Bits. |
| **Graphify (`Graphify-Labs/graphify`)** | Inspected `graphifyy` (`uv` not installed, VM outbound network disabled) | Implemented Graphify-compatible deterministic local AST parser (`scripts/generate_codebase_graph.py`) | Generated `graphify-out/architecture_graph.json` (`102` nodes, `119` edges) and `GRAPHIFY_REPORT.md` locally without external network calls. |
| **GSAP (`gsap.com`)** | Declared in `package.json` (`gsap ^3.12.5`, `@gsap/react ^2.1.1`) + `AtelierMotionSystem.tsx` | Configured in Next.js + Standalone HTML | Coordinated entrance timelines, modal transitions, and SVG crest reveals using `transform` and `opacity` only. |
| **Lenis (`lenis.dev`)** | Declared in `package.json` (`lenis ^1.1.18`) + `AtelierSelectiveSmoothScroll` | Configured selectively for desktop showcase views | Enabled only on desktop catalog views (`models`, `finished`), preserving native scrolling on tables, forms, modals, drawers, POS cart, and mobile. |
| **React Bits (`DavidHDev/react-bits`)** | Inspected TS-TW variants (`BlurText`, `SpotlightCard`, `CountUp`) | Implemented in `src/components/react-bits/` & standalone HTML | Adopted `BlurText`, `SpotlightCard`, and `CountUp` adapted to `AFAF EL ASSLI` metallic gold tokens (`#C99A3D`) and `prefers-reduced-motion`. |
| **21st.dev (`@21st-dev/cli`)** | Inspected `@21st-dev/cli` & MCP docs | CLI requires outbound npm + interactive `21st login` | Adapted responsive POS mobile bar, dual table/card inventory view, and luxury KPI cards directly to `AFAF EL ASSLI` tokens. |
| **Strix (`usestrix/strix`)** | Inspected `usestrix/strix` prerequisites (`Docker` + LLM API key) | `docker` not installed in gVisor sandbox VM; built local `tests/security_audit.py` suite | Executed 6 automated security test suites (`SEC-01` through `SEC-06`) against local ATELIER OS routes, uploads, and DB queries (`SECURITY_AUDIT.md`). |

---

## 2. Tools Installed & Configured Successfully

1. **Agent Skill Registry Installations (Verified via `skills:save_skill`)**:
   - `user:hallmark` — Anti-AI-Slop Design System (`Nutlope/hallmark` v2.0.0 Floor & Sweep rules).
   - `user:frontend-ui-engineering` — Production-grade React/Next.js UI architecture & WCAG 2.1 AA accessibility (`addyosmani/agent-skills`).
   - `user:api-and-interface-design` — Contract-first REST API design, Zod boundary validation & atomic idempotency (`addyosmani/agent-skills`).
2. **Pre-Installed Active Skills Applied**:
   - `user:ui-ux-pro-max` — UI/UX design intelligence, RTL rules, touch target sizing (`44×44px`), and GSAP motion guidelines.
   - `user:frontend-design` — Studio-grade typographic hierarchy and anti-template visual direction.
   - `user:web-design-guidelines` — Web interface accessibility and focus-state compliance.
   - `user:video-motion-graphics` — Easing (`cubic-bezier(0.22, 1, 0.36, 1)`), staging, and overlapping motion timing.
   - `user:premium-product-ui-ux` & `user:application-qa-engineer` — Enterprise SaaS layout & end-to-end journey verification.
3. **Project-Local Toolchain Artifacts Added to Repository**:
   - `GEMINI.md` — Project-level engineering & design constitution.
   - `.hallmark/preflight.json` — Locked brand-truth token specification for `Maison AFAF EL ASSLI`.
   - `scripts/generate_codebase_graph.py` + `graphify-out/architecture_graph.json` + `GRAPHIFY_REPORT.md` — Local AST codebase knowledge graph (`102` nodes, `119` edges).
   - `tests/security_audit.py` + `SECURITY_AUDIT.md` — Local security test runner & remediation report.

---

## 3. Skills Activated & Applied

- **`hallmark`**: Enforced line-1 CSS stamp (`/* @hallmark v2.0.0 | theme: maison-afaf-couture | genre: luxury-erp | floor: 0 FAIL */`), replaced all `transition: all` rules with explicit GPU-composited properties, added `overflow-x: clip` on `html, body`, and enforced instant `:focus-visible` outlines (`2px solid var(--brand-gold)`).
- **`frontend-ui-engineering`**: Separated state provider (`src/context/AtelierStoreContext.tsx`) from view presentation (`src/components/AtelierAppShell.tsx`), implemented dual desktop table (`hidden md:block`) and mobile card (`md:hidden`) views, and verified WCAG 2.1 AA contrast.
- **`api-and-interface-design`**: Audited `src/app/api/atelier/route.ts` via the codebase graph, discovering 8 imported Zod schemas whose `case` branches were missing in `POST /api/atelier`. Wired all 17 action branches to real Drizzle transactions in `src/services/atelierService.ts` and hardened `src/app/api/upload/route.ts` with binary magic-byte header verification (`verifyImageMagicBytes`).

---

## 4. MCP Servers & Documentation Intelligence Status

- **Context7 (`https://mcp.context7.com/mcp`)**: Because the runtime is **Gemini 4 Argon Task Mode** rather than the standalone `gemini` CLI binary (`gemini: command not found`), `gemini mcp add` is not supported inside the sandbox container. Instead, official documentation for Next.js 14, Drizzle ORM, GSAP `@gsap/react`, Lenis, and React Bits was queried directly via `google:search` and `google:browse`. For developers running Gemini CLI locally on their workstation, the exact registration command is documented in Section 10 below.
- **21st.dev MCP (`@21st-dev/cli`)**: Requires interactive account authentication (`21st login`) and an API key. Per Section F & Section I rules, no secrets or third-party demo branding were hardcoded; component patterns were adapted natively to `AFAF EL ASSLI` tokens.

---

## 5. Dependencies Added (`package.json`)

| Package | Version | Purpose | License |
|---|---|---|---|
| `gsap` | `^3.12.5` | Coordinated entrance timelines, modal transitions, and SVG crest motion | Standard "No Charge" GreenSock License (Free for commercial/all users in current releases) |
| `@gsap/react` | `^2.1.1` | Official `useGSAP()` React hook with automatic context cleanup | MIT |
| `lenis` | `^1.1.18` | Selective smooth scrolling for desktop product showcase views (`models`, `finished`) | MIT |

---

## 6. Components Adopted vs. Components Rejected

### Adopted Components (Adapted to `AFAF EL ASSLI` Tokens)
1. **`BlurText` (`src/components/react-bits/BlurText.tsx`)**: Word-by-word blur-to-focus reveal (`420ms cubic-bezier(0.22, 1, 0.36, 1)`) used selectively on top-bar module headings; automatically disabled under `prefers-reduced-motion: reduce`.
2. **`SpotlightCard` (`src/components/react-bits/SpotlightCard.tsx` & `.rb-spotlight-card`)**: Subtle metallic gold radial cursor glow (`rgba(201, 154, 61, 0.13)`) applied to Dashboard KPI cards and Haute Couture Model cards.
3. **`CountUp` (`src/components/react-bits/CountUp.tsx`)**: Restrained `450ms` `easeOutCubic` tabular-numeral counter for primary KPI summary totals (`tabular-nums`).
4. **`AtelierSelectiveSmoothScroll` (`src/components/motion/AtelierMotionSystem.tsx`)**: Scopes smooth scrolling strictly to desktop catalog views while preserving native scrolling (`data-lenis-prevent`) on data tables, forms, modals, drawers, POS cart panels, and mobile devices.

### Rejected Components & Why
1. **React Bits WebGL / Shader Backgrounds (`Galaxy`, `Aurora`, `Hyperspeed`, `LiquidChrome`)**: **Rejected** — heavy continuous GPU shaders behind operational ERP tables degrade mobile battery life, reduce legibility of financial figures, and violate Hallmark's restraint rules.
2. **React Bits `SplitText` / `DecryptText` on Financial Tables & Forms**: **Rejected** — character-splitting animations break Arabic cursive ligatures (`RTL` shaping) and slow down rapid scanning of DZD invoices and inventory quantities.
3. **Global Lenis hijack on `<body>` across all ERP screens**: **Rejected** — hijacking native scroll inside dense data tables, modal dialogs, and mobile POS drawers introduces scroll trapping and hurts operational speed.

---

## 7. Compatibility Limitations & Security Testing Notes

- **Sandbox Outbound Network Policy**: Outbound network calls (`curl`, `npm install`, `uv tool install`) are disabled inside the gVisor build sandbox. All runtime dependencies are declared in `package.json` for standard `npm install` on the host machine, and the standalone Canvas application (`atelier-os.html`) includes a complete offline fallback utility layer so it renders with zero layout shift even without CDN access.
- **Strix Docker Prerequisite**: Full `usestrix/strix` container execution requires a local Docker daemon and an external LLM API key. In accordance with Section G ("Do not install or execute Strix unless its prerequisites and configuration are available"), we implemented `tests/security_audit.py` to test all 6 local application security domains (`SEC-01` SQLi, `SEC-02` XSS, `SEC-03` File Upload Magic Bytes & Path Traversal, `SEC-04` API Boundary Validation, `SEC-05` Financial/Stock Integrity, `SEC-06` Secret Scanning) and documented the findings in `SECURITY_AUDIT.md`.

---

## 8. Licensing Notes

- **Next.js, React, Tailwind CSS, Lucide Icons, Drizzle ORM, Zod, Lenis, React Bits, Hallmark, Addy Osmani Agent Skills**: **MIT License** (permissive commercial and private use).
- **GSAP (`gsap`, `@gsap/react`)**: Free for all users under current Webflow/GSAP licensing.
- **`AFAF EL ASSLI` Logo & Brand Identity**: Proprietary brand asset of **Maison AFAF EL ASSLI (`دار عفاف الأصلي للأزياء الراقية`)**, preserved unmodified.

---

## 9. Verification Summary (Workflows, Security, Accessibility & 6 Viewports)

1. **Database & Financial Workflows (`python3 tests/verify_all_workflows.py`)**: **PASSED** (`33` tables verified; Workflows A–E passed including Moving Average Cost `CMP = 2,000 DZD`, BOM reservation, QC completion `10,000 DZD/unit`, POS checkout, immutable invoice snapshots, partial/full payment transitions, and partial return restocking).
2. **Local Security Audit (`python3 tests/security_audit.py`)**: **PASSED** (`6/6` security checks passed: `SEC-01` through `SEC-06`).
3. **Web App Validator (`check_web_app.py`)**: **PASSED** (`OK: no issues found — 0 errors, 0 warnings`).
4. **Headless Chromium 6-Viewport, Accessibility & Animation Review**: **PASSED** across `320×640`, `375×812`, `430×932`, `768×1024`, `1366×768`, and `1920×1080` in both Arabic (`RTL`) and French (`LTR`), Light and Dark modes (`scrollWidth <= innerWidth` on all 14 modules, instant `:focus-visible` rings, `prefers-reduced-motion` compliance, and zero JS runtime errors).

---

## 10. Commands Required to Reproduce the Setup on Your Workstation

```bash
# 1. Extract the GitHub-ready repository and install dependencies
unzip atelier-os-github-ready.zip
cd atelier-os
npm install

# 2. (Optional) Configure Gemini CLI / Claude Code / Cursor Skills & MCP on your host machine
npx skills add nutlope/hallmark
npx skills add addyosmani/agent-skills
gemini mcp add --transport http context7 https://mcp.context7.com/mcp
uv tool install graphifyy && graphify install

# 3. Apply PostgreSQL migrations & seed initial Maison AFAF EL ASSLI data
cp .env.example .env.local
npm run db:migrate
npm run db:seed

# 4. Run the local AST Codebase Knowledge Graph, Workflow Tests & Security Audit
npm run graph:build
npm run test:workflows
npm run test:security

# 5. Start the Next.js development server or build for production
npm run dev
# or: npm run build && npm run start

# 6. Push to GitHub (remote origin already configured to https://github.com/abed122285/afaf.git)
git push -u origin main
```
