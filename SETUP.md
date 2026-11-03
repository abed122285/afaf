# ATELIER OS — Installation, Setup & Operations Guide

## 1. Prerequisites

- **Node.js**: v18.20+ or v20+
- **PostgreSQL**: v15+ (for production server deployment) or **SQLite 3** (for local verification suite)
- **Python**: v3.10+ (optional, for running the SQL verification suite)

## 2. Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Update `DATABASE_URL` with your PostgreSQL connection string.

## 3. Database Migration & Seeding

Run the DDL migration in `drizzle/0000_atelier_os_init.sql` or use Drizzle Kit:

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

## 4. Running in Development & Production

```bash
# Development server (opens directly on http://localhost:3000 -> Dashboard)
npm run dev

# Production build & start
npm run build
npm run start
```

## 5. Running the Automated Verification Suite

To verify all 33 database tables and all 5 end-to-end business workflows (Purchase, Production, POS Sale, Partial Payment, Refund/Return + Idempotency):

```bash
python3 tests/verify_all_workflows.py
```

## 6. Backup & Restore Recommendations

- Use **Settings → Backup & Data** inside ATELIER OS to export a full JSON snapshot of all workshop tables at any time.
- For PostgreSQL deployments, schedule daily `pg_dump -Fc atelier_os > backup_$(date +%F).dump` jobs to an encrypted off-site volume and test restoration monthly.
