import { db } from "./index";
import * as schema from "./schema";

export async function seedAtelierDatabase() {
  console.log("Seeding ATELIER OS — Maison AFAF EL ASSLI (دار عفاف الأصلي)...");
  await db.insert(schema.workshopSettings).values({
    workshopNameAr: "دار عفاف الأصلي للأزياء الراقية",
    workshopNameFr: "Maison AFAF EL ASSLI Haute Couture",
    logoUrl: "/assets/afaf-el-assli-logo.png",
    addressAr: "حي حيدرة، الجزائر العاصمة، الجزائر",
    addressFr: "Hydra, Alger, Algérie",
    wilaya: "16 - Alger",
    phone: "+213 550 16 88 42",
    email: "atelier@afafelassli.dz",
    defaultLanguage: "ar",
    currency: "DZD",
    timezone: "Africa/Algiers",
  }).onConflictDoNothing();
  console.log("Seed complete.");
}

if (require.main === module) {
  seedAtelierDatabase().catch(console.error);
}
