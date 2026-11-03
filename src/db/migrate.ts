import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./index";
import path from "path";

async function runMigrations() {
  console.log("[ATELIER OS] Starting PostgreSQL database migrations...");
  try {
    const migrationsFolder = path.resolve(process.cwd(), "drizzle");
    await migrate(db, { migrationsFolder });
    console.log("[ATELIER OS] Migrations applied successfully from:", migrationsFolder);
  } catch (error) {
    console.error("[ATELIER OS] Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runMigrations();
