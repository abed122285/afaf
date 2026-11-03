# ATELIER OS — System Architecture & Security Specification

## 1. Architectural Overview

ATELIER OS follows a layered, domain-driven architecture separating presentation, validation, transactional domain services, and relational persistence:

1. **Presentation Layer (Next.js App Router + Tailwind CSS + Bilingual RTL/LTR Shell)**:
   - Responsive Desktop/Tablet/Mobile layout opening directly on `/` (Dashboard).
   - Uses logical CSS alignment (`ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `text-end`) so switching between Arabic (`dir="rtl"`) and French (`dir="ltr"`) mirrors the sidebar, tables, drawers, and printable invoices cleanly.
2. **Validation Layer (`src/lib/validators.ts`)**:
   - Enforces strict Zod validation on all inputs (quantities, positive monetary amounts, mandatory adjustment reasons, QC equation `accepted + rejected == produced`, and allowed image MIME types).
3. **Transactional Domain Layer (`src/services/atelierService.ts`)**:
   - All stock and financial mutations execute inside atomic database transactions guarded by unique `idempotency_key` constraints.
   - The frontend never acts as the sole authority for stock balances, moving average costs, or invoice payment statuses.
4. **Persistence & Storage Layer (`src/db/schema.ts`, `src/lib/storage.ts`)**:
   - 33 normalized tables modeled in Drizzle ORM for PostgreSQL (with SQLite-compatible DDL for local zero-config testing).
   - Media storage abstraction supporting local disk (`./public/uploads`), S3-compatible object storage, or Supabase Storage.

## 2. Security Implications of Zero-Authentication Mode (Mandatory Notice)

Per **Section 2.1 of the Master Execution Prompt and PRD v1.0**, ATELIER OS v1.0 intentionally omits login, signup, user accounts, and role-based access control so the workshop owner can operate rapidly inside a single trusted atelier.

- **Deployment Constraint**: Do **NOT** deploy this application on the public internet without external access control.
- **Recommended Deployment Topology**:
  1. Run on a local workshop server or workstation accessible only on the private atelier LAN, **or**
  2. Place behind a WireGuard / Tailscale VPN or Cloudflare Zero Trust / Nginx Basic-Auth / mTLS reverse proxy before any internet-facing deployment.
- **Server-Side Protections Included**:
  - Database and object-storage credentials remain strictly server-side in `.env`.
  - File uploads validate MIME type (`image/jpeg`, `image/png`, `image/webp`) and file size (`<= 10 MB`).
  - Financial and inventory records are immutable and append-only; destructive deletion of confirmed invoices, sales, payments, and stock movements is prohibited.
