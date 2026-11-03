# ATELIER OS — Maison AFAF EL ASSLI (دار عفاف الأصلي للأزياء الراقية)

**ATELIER OS** is a complete, bilingual (**Arabic RTL** & **French LTR**) enterprise workshop management system (ERP + POS + Production + Inventory + Invoicing + Treasury) engineered for **AFAF EL ASSLI — عفاف الأصلي**.

## Key Capabilities Implemented in v1.0

1. **Zero-Authentication Direct Launch (`/`)**: Opens immediately on the executive Dashboard for single-workshop operations in a controlled private environment, with zero login/signup overhead.
2. **Instant Bilingual UI (`AR` / `FR`) & Theme Engine (`Light` / `Dark`)**:
   - Full Arabic RTL (`dir="rtl"`, Cairo / IBM Plex Sans Arabic typography) and French LTR (`dir="ltr"`, Inter typography).
   - Preserves active state, cart items, filters, and untranslated customer/model/product proper names when switching languages.
3. **Dual Separated Stock Ledgers**:
   - **Raw Material Inventory**: Tracks fabrics, threads, buttons, zippers, Swarovski strass, embroidery supplies, and packaging with **Moving Weighted-Average Costing (CMP)** and **On-Hand vs Reserved vs Available** quantities.
   - **Finished Goods Inventory**: Tracks completed couture garments by SKU, barcode, model, color, and size variant.
4. **End-to-End Production Management & Versioned BOM**:
   - 9 configurable workshop stages (*Planned → Waiting for Materials → Cutting → Sewing → Embroidery/Strass → Finishing → Quality Control → Completed / Cancelled*).
   - Automatic BOM material calculation, stock reservation, actual material consumption + wastage recording, quality control inspection, and idempotent completion into finished goods with exact unit cost calculation.
5. **Fast 2-Column POS & Immutable Invoicing**:
   - Visual product grid with barcode/SKU search, variant picker, line & order discounts, quick customer creation, and atomic checkout.
   - Generates immutable invoice snapshots supporting **A4 Commercial Print**, **80mm Thermal Receipt**, **Arabic RTL**, **French LTR**, and **Bilingual (AR/FR)** layouts with print and PDF export.
6. **Automatic Payment Status & Traceable Refunds**:
   - Automatically computes `UNPAID`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`, `PARTIALLY_REFUNDED`, and `REFUNDED` from payment and refund ledgers.
   - Supports Algerian payment methods: **Cash (Espèces)**, **BaridiMob**, **CCP Transfer**, **Bank Transfer**, **CIB**, **EDAHABIA**, **Cash on Delivery (COD)**, and custom methods.
7. **Finance, Caisse & Reporting Center**:
   - Separates **Recognized Sales Revenue**, **COGS (Cost of Goods Sold)**, **Gross Profit**, **Operating Expenses**, **Net Profit**, **Cash Collected (Encaissements)**, **Customer Receivables**, and **Supplier Liabilities**.

## Project Structure

```text
atelier-os/
├── drizzle/
│   └── 0000_atelier_os_init.sql       # Complete 33-table DDL migration
├── public/
│   └── assets/
│       └── afaf-el-assli-logo.png     # Official AFAF EL ASSLI brand identity asset
├── src/
│   ├── db/
│   │   └── schema.ts                  # Drizzle ORM PostgreSQL schema (33 tables)
│   ├── lib/
│   │   ├── storage.ts                 # Image upload & storage abstraction
│   │   └── validators.ts              # Zod validation schemas
│   └── services/
│       └── atelierService.ts          # Costing, ledger & payment status engine
├── tests/
│   ├── verify_all_workflows.py        # End-to-end relational SQL test suite
│   └── verification_report.json       # Automated test execution results
├── ARCHITECTURE.md
├── DATABASE.md
├── SETUP.md
├── .env.example
└── package.json
```
