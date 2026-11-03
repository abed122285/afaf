import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// 1. workshop_settings
export const workshopSettings = pgTable("workshop_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  workshopNameAr: varchar("workshop_name_ar", { length: 160 }).notNull().default("دار عفاف الأصلي للأزياء الراقية"),
  workshopNameFr: varchar("workshop_name_fr", { length: 160 }).notNull().default("Maison AFAF EL ASSLI Haute Couture"),
  logoUrl: text("logo_url").notNull().default("/assets/afaf-el-assli-logo.png"),
  addressAr: text("address_ar").notNull().default("حي حيدرة، الجزائر العاصمة، الجزائر"),
  addressFr: text("address_fr").notNull().default("Hydra, Alger, Algérie"),
  wilaya: varchar("wilaya", { length: 80 }).notNull().default("16 - Alger"),
  phone: varchar("phone", { length: 40 }).notNull().default("+213 550 16 88 42"),
  email: varchar("email", { length: 160 }).notNull().default("atelier@afafelassli.dz"),
  rcNumber: varchar("rc_number", { length: 80 }).default("16/00-4829103B24"),
  nifNumber: varchar("nif_number", { length: 80 }).default("002416048291038"),
  defaultLanguage: varchar("default_language", { length: 8 }).notNull().default("ar"),
  currency: varchar("currency", { length: 8 }).notNull().default("DZD"),
  timezone: varchar("timezone", { length: 64 }).notNull().default("Africa/Algiers"),
  dateFormat: varchar("date_format", { length: 32 }).notNull().default("DD/MM/YYYY"),
  invoicePrefix: varchar("invoice_prefix", { length: 20 }).notNull().default("FAC-2026-"),
  nextInvoiceSequence: integer("next_invoice_sequence").notNull().default(1001),
  defaultInvoiceLang: varchar("default_invoice_lang", { length: 16 }).notNull().default("bilingual"),
  taxEnabled: boolean("tax_enabled").notNull().default(false),
  defaultTaxRate: numeric("default_tax_rate", { precision: 6, scale: 2 }).notNull().default("0.00"),
  preventNegativeStock: boolean("prevent_negative_stock").notNull().default(true),
  costingMethod: varchar("costing_method", { length: 32 }).notNull().default("MOVING_WEIGHTED_AVERAGE"),
  themeMode: varchar("theme_mode", { length: 16 }).notNull().default("light"),
  invoiceFooterAr: text("invoice_footer_ar").default("شكراً لثقتكم في دار عفاف الأصلي — البضاعة المفصلة حسب الطلب لا تُستبدل إلا في حال وجود عيب مصنعي خلال 48 ساعة."),
  invoiceFooterFr: text("invoice_footer_fr").default("Merci de votre confiance en Maison AFAF EL ASSLI — Les créations sur mesure ne sont reprises qu'en cas de défaut constaté sous 48h."),
  lastBackupAt: timestamp("last_backup_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 2. categories (material, product, expense)
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 48 }).notNull().unique(),
  domain: varchar("domain", { length: 24 }).notNull(), // 'MATERIAL' | 'PRODUCT' | 'EXPENSE'
  nameAr: varchar("name_ar", { length: 120 }).notNull(),
  nameFr: varchar("name_fr", { length: 120 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 3. suppliers
export const suppliers = pgTable("suppliers", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 48 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  contactPerson: varchar("contact_person", { length: 120 }),
  phone: varchar("phone", { length: 40 }).notNull(),
  email: varchar("email", { length: 160 }),
  city: varchar("city", { length: 80 }).notNull().default("Alger"),
  address: text("address"),
  notes: text("notes"),
  totalPurchases: numeric("total_purchases", { precision: 14, scale: 2 }).notNull().default("0.00"),
  totalPaid: numeric("total_paid", { precision: 14, scale: 2 }).notNull().default("0.00"),
  outstandingBalance: numeric("outstanding_balance", { precision: 14, scale: 2 }).notNull().default("0.00"),
  status: varchar("status", { length: 24 }).notNull().default("ACTIVE"), // 'ACTIVE' | 'ARCHIVED'
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 4. materials (Raw Material Inventory)
export const materials = pgTable("materials", {
  id: uuid("id").defaultRandom().primaryKey(),
  sku: varchar("sku", { length: 64 }).notNull().unique(),
  nameAr: varchar("name_ar", { length: 160 }).notNull(),
  nameFr: varchar("name_fr", { length: 160 }).notNull(),
  categoryId: uuid("category_id").references(() => categories.id).notNull(),
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  description: text("description"),
  color: varchar("color", { length: 64 }),
  unit: varchar("unit", { length: 24 }).notNull(), // 'm' | 'cm' | 'pcs' | 'kg' | 'g' | 'roll' | 'pkg'
  onHandQty: numeric("on_hand_qty", { precision: 14, scale: 3 }).notNull().default("0.000"),
  reservedQty: numeric("reserved_qty", { precision: 14, scale: 3 }).notNull().default("0.000"),
  availableQty: numeric("available_qty", { precision: 14, scale: 3 }).notNull().default("0.000"),
  minStockThreshold: numeric("min_stock_threshold", { precision: 14, scale: 3 }).notNull().default("5.000"),
  averageCost: numeric("average_cost", { precision: 14, scale: 2 }).notNull().default("0.00"),
  lastPurchaseCost: numeric("last_purchase_cost", { precision: 14, scale: 2 }).notNull().default("0.00"),
  storageLocation: varchar("storage_location", { length: 120 }).default("Rayon A1"),
  primaryImageUrl: text("primary_image_url"),
  status: varchar("status", { length: 24 }).notNull().default("ACTIVE"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  skuIdx: uniqueIndex("materials_sku_idx").on(t.sku),
  catIdx: index("materials_category_idx").on(t.categoryId),
}));

// 5. material_images
export const materialImages = pgTable("material_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  materialId: uuid("material_id").references(() => materials.id, { onDelete: "cascade" }).notNull(),
  url: text("url").notNull(),
  altText: varchar("alt_text", { length: 160 }),
  isPrimary: boolean("is_primary").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 6. material_stock_movements (Immutable Ledger)
export const materialStockMovements = pgTable("material_stock_movements", {
  id: uuid("id").defaultRandom().primaryKey(),
  idempotencyKey: varchar("idempotency_key", { length: 128 }).notNull().unique(),
  materialId: uuid("material_id").references(() => materials.id).notNull(),
  movementType: varchar("movement_type", { length: 36 }).notNull(),
  // 'OPENING_BALANCE' | 'PURCHASE_RECEIPT' | 'PRODUCTION_RESERVE' | 'PRODUCTION_RELEASE' | 'PRODUCTION_ISSUE' | 'PRODUCTION_RETURN' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT' | 'SUPPLIER_RETURN'
  direction: varchar("direction", { length: 12 }).notNull(), // 'IN' | 'OUT' | 'RESERVE' | 'RELEASE'
  quantity: numeric("quantity", { precision: 14, scale: 3 }).notNull(),
  unitCost: numeric("unit_cost", { precision: 14, scale: 2 }).notNull().default("0.00"),
  totalCost: numeric("total_cost", { precision: 14, scale: 2 }).notNull().default("0.00"),
  balanceAfterOnHand: numeric("balance_after_on_hand", { precision: 14, scale: 3 }).notNull(),
  balanceAfterAvailable: numeric("balance_after_available", { precision: 14, scale: 3 }).notNull(),
  referenceType: varchar("reference_type", { length: 36 }).notNull(), // 'PURCHASE' | 'PRODUCTION_ORDER' | 'MANUAL_ADJUSTMENT' | 'INITIAL_SEED'
  referenceId: varchar("reference_id", { length: 64 }).notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 7. purchases
export const purchases = pgTable("purchases", {
  id: uuid("id").defaultRandom().primaryKey(),
  idempotencyKey: varchar("idempotency_key", { length: 128 }).notNull().unique(),
  purchaseNumber: varchar("purchase_number", { length: 48 }).notNull().unique(),
  supplierId: uuid("supplier_id").references(() => suppliers.id).notNull(),
  purchaseDate: timestamp("purchase_date", { withTimezone: true }).notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }),
  receiptStatus: varchar("receipt_status", { length: 24 }).notNull().default("DRAFT"), // 'DRAFT' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED'
  paymentStatus: varchar("payment_status", { length: 24 }).notNull().default("UNPAID"), // 'UNPAID' | 'PARTIALLY_PAID' | 'PAID'
  subtotal: numeric("subtotal", { precision: 14, scale: 2 }).notNull().default("0.00"),
  shippingCost: numeric("shipping_cost", { precision: 14, scale: 2 }).notNull().default("0.00"),
  discountAmount: numeric("discount_amount", { precision: 14, scale: 2 }).notNull().default("0.00"),
  totalAmount: numeric("total_amount", { precision: 14, scale: 2 }).notNull().default("0.00"),
  paidAmount: numeric("paid_amount", { precision: 14, scale: 2 }).notNull().default("0.00"),
  remainingAmount: numeric("remaining_amount", { precision: 14, scale: 2 }).notNull().default("0.00"),
  notes: text("notes"),
  receivedAt: timestamp("received_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 8. purchase_items
export const purchaseItems = pgTable("purchase_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  purchaseId: uuid("purchase_id").references(() => purchases.id, { onDelete: "cascade" }).notNull(),
  materialId: uuid("material_id").references(() => materials.id).notNull(),
  orderedQty: numeric("ordered_qty", { precision: 14, scale: 3 }).notNull(),
  receivedQty: numeric("received_qty", { precision: 14, scale: 3 }).notNull().default("0.000"),
  unitPrice: numeric("unit_price", { precision: 14, scale: 2 }).notNull(),
  discountAmount: numeric("discount_amount", { precision: 14, scale: 2 }).notNull().default("0.00"),
  lineTotal: numeric("line_total", { precision: 14, scale: 2 }).notNull(),
});

// 9. supplier_payments
export const supplierPayments = pgTable("supplier_payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  idempotencyKey: varchar("idempotency_key", { length: 128 }).notNull().unique(),
  paymentReference: varchar("payment_reference", { length: 64 }).notNull().unique(),
  supplierId: uuid("supplier_id").references(() => suppliers.id).notNull(),
  purchaseId: uuid("purchase_id").references(() => purchases.id),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 36 }).notNull(),
  paymentDate: timestamp("payment_date", { withTimezone: true }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 10. models (Clothing Design Catalog)
export const models = pgTable("models", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 48 }).notNull().unique(),
  nameAr: varchar("name_ar", { length: 160 }).notNull(),
  nameFr: varchar("name_fr", { length: 160 }).notNull(),
  categoryId: uuid("category_id").references(() => categories.id).notNull(),
  description: text("description"),
  availableColors: jsonb("available_colors").$type<string[]>().notNull().default([]),
  availableSizes: jsonb("available_sizes").$type<string[]>().notNull().default([]),
  expectedProductionHours: numeric("expected_production_hours", { precision: 8, scale: 2 }).notNull().default("6.00"),
  estimatedLaborCost: numeric("estimated_labor_cost", { precision: 14, scale: 2 }).notNull().default("2500.00"),
  defaultSellingPrice: numeric("default_selling_price", { precision: 14, scale: 2 }).notNull().default("18500.00"),
  primaryImageUrl: text("primary_image_url"),
  productionNotes: text("production_notes"),
  status: varchar("status", { length: 24 }).notNull().default("ACTIVE"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 11. model_images
export const modelImages = pgTable("model_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  modelId: uuid("model_id").references(() => models.id, { onDelete: "cascade" }).notNull(),
  url: text("url").notNull(),
  altText: varchar("alt_text", { length: 160 }),
  isPrimary: boolean("is_primary").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 12. model_variants
export const modelVariants = pgTable("model_variants", {
  id: uuid("id").defaultRandom().primaryKey(),
  modelId: uuid("model_id").references(() => models.id, { onDelete: "cascade" }).notNull(),
  sku: varchar("sku", { length: 64 }).notNull().unique(),
  color: varchar("color", { length: 64 }).notNull(),
  size: varchar("size", { length: 24 }).notNull(),
  sellingPrice: numeric("selling_price", { precision: 14, scale: 2 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 13. bill_of_materials (BOM Header)
export const billOfMaterials = pgTable("bill_of_materials", {
  id: uuid("id").defaultRandom().primaryKey(),
  modelId: uuid("model_id").references(() => models.id, { onDelete: "cascade" }).notNull(),
  version: integer("version").notNull().default(1),
  batchSize: integer("batch_size").notNull().default(1),
  isCurrent: boolean("is_current").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 14. bill_of_material_items (BOM Lines)
export const billOfMaterialItems = pgTable("bill_of_material_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  bomId: uuid("bom_id").references(() => billOfMaterials.id, { onDelete: "cascade" }).notNull(),
  materialId: uuid("material_id").references(() => materials.id).notNull(),
  quantityPerUnit: numeric("quantity_per_unit", { precision: 14, scale: 3 }).notNull(),
  wastagePercent: numeric("wastage_percent", { precision: 6, scale: 2 }).notNull().default("0.00"),
  stageNote: varchar("stage_note", { length: 120 }),
});

// 15. production_stages (Configurable Workshop Stages)
export const productionStages = pgTable("production_stages", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 48 }).notNull().unique(),
  nameAr: varchar("name_ar", { length: 120 }).notNull(),
  nameFr: varchar("name_fr", { length: 120 }).notNull(),
  sortOrder: integer("sort_order").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

// 16. production_orders
export const productionOrders = pgTable("production_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  idempotencyKey: varchar("idempotency_key", { length: 128 }).notNull().unique(),
  orderNumber: varchar("order_number", { length: 48 }).notNull().unique(),
  modelId: uuid("model_id").references(() => models.id).notNull(),
  bomId: uuid("bom_id").references(() => billOfMaterials.id).notNull(),
  color: varchar("color", { length: 64 }).notNull(),
  size: varchar("size", { length: 24 }).notNull(),
  requestedQty: integer("requested_qty").notNull(),
  producedQty: integer("produced_qty").notNull().default(0),
  acceptedQty: integer("accepted_qty").notNull().default(0),
  rejectedQty: integer("rejected_qty").notNull().default(0),
  currentStageCode: varchar("current_stage_code", { length: 48 }).notNull().default("PLANNED"),
  status: varchar("status", { length: 32 }).notNull().default("PLANNED"),
  // 'PLANNED' | 'WAITING_MATERIALS' | 'CUTTING' | 'SEWING' | 'EMBROIDERY' | 'FINISHING' | 'QUALITY_CONTROL' | 'COMPLETED' | 'CANCELLED'
  materialsReserved: boolean("materials_reserved").notNull().default(false),
  materialsIssued: boolean("materials_issued").notNull().default(false),
  stockCompleted: boolean("stock_completed").notNull().default(false),
  plannedStartDate: timestamp("planned_start_date", { withTimezone: true }).notNull(),
  expectedCompletionDate: timestamp("expected_completion_date", { withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  estimatedMaterialCost: numeric("estimated_material_cost", { precision: 14, scale: 2 }).notNull().default("0.00"),
  actualMaterialCost: numeric("actual_material_cost", { precision: 14, scale: 2 }).notNull().default("0.00"),
  directLaborCost: numeric("direct_labor_cost", { precision: 14, scale: 2 }).notNull().default("0.00"),
  actualTotalCost: numeric("actual_total_cost", { precision: 14, scale: 2 }).notNull().default("0.00"),
  actualUnitCost: numeric("actual_unit_cost", { precision: 14, scale: 2 }).notNull().default("0.00"),
  assignedNotes: text("assigned_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 17. production_order_stages
export const productionOrderStages = pgTable("production_order_stages", {
  id: uuid("id").defaultRandom().primaryKey(),
  productionOrderId: uuid("production_order_id").references(() => productionOrders.id, { onDelete: "cascade" }).notNull(),
  stageCode: varchar("stage_code", { length: 48 }).notNull(),
  status: varchar("status", { length: 24 }).notNull().default("PENDING"), // 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD'
  qtyEntered: integer("qty_entered").notNull().default(0),
  qtyAccepted: integer("qty_accepted").notNull().default(0),
  qtyRejected: integer("qty_rejected").notNull().default(0),
  notes: text("notes"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

// 18. production_consumptions
export const productionConsumptions = pgTable("production_consumptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  productionOrderId: uuid("production_order_id").references(() => productionOrders.id, { onDelete: "cascade" }).notNull(),
  materialId: uuid("material_id").references(() => materials.id).notNull(),
  plannedQty: numeric("planned_qty", { precision: 14, scale: 3 }).notNull(),
  reservedQty: numeric("reserved_qty", { precision: 14, scale: 3 }).notNull().default("0.000"),
  actualConsumedQty: numeric("actual_consumed_qty", { precision: 14, scale: 3 }).notNull().default("0.000"),
  wasteQty: numeric("waste_qty", { precision: 14, scale: 3 }).notNull().default("0.000"),
  unitCostAtIssue: numeric("unit_cost_at_issue", { precision: 14, scale: 2 }).notNull().default("0.00"),
  totalActualCost: numeric("total_actual_cost", { precision: 14, scale: 2 }).notNull().default("0.00"),
  wasteReason: text("waste_reason"),
});

// 19. quality_checks
export const qualityChecks = pgTable("quality_checks", {
  id: uuid("id").defaultRandom().primaryKey(),
  productionOrderId: uuid("production_order_id").references(() => productionOrders.id, { onDelete: "cascade" }).notNull(),
  inspectedQty: integer("inspected_qty").notNull(),
  acceptedQty: integer("accepted_qty").notNull(),
  rejectedQty: integer("rejected_qty").notNull(),
  reworkQty: integer("rework_qty").notNull().default(0),
  measurementsPass: boolean("measurements_pass").notNull().default(true),
  stitchingPass: boolean("stitching_pass").notNull().default(true),
  embroideryPass: boolean("embroidery_pass").notNull().default(true),
  cleanlinessPass: boolean("cleanliness_pass").notNull().default(true),
  result: varchar("result", { length: 24 }).notNull(), // 'ACCEPTED' | 'REJECTED' | 'NEEDS_REWORK'
  notes: text("notes"),
  checkedAt: timestamp("checked_at", { withTimezone: true }).defaultNow().notNull(),
});

// 20. finished_products (Finished Goods Inventory - Strictly Separated from Raw Materials)
export const finishedProducts = pgTable("finished_products", {
  id: uuid("id").defaultRandom().primaryKey(),
  sku: varchar("sku", { length: 64 }).notNull().unique(),
  barcode: varchar("barcode", { length: 64 }).unique(),
  modelId: uuid("model_id").references(() => models.id).notNull(),
  categoryId: uuid("category_id").references(() => categories.id).notNull(),
  nameAr: varchar("name_ar", { length: 160 }).notNull(),
  nameFr: varchar("name_fr", { length: 160 }).notNull(),
  color: varchar("color", { length: 64 }).notNull(),
  size: varchar("size", { length: 24 }).notNull(),
  onHandQty: integer("on_hand_qty").notNull().default(0),
  reservedQty: integer("reserved_qty").notNull().default(0),
  availableQty: integer("available_qty").notNull().default(0),
  minStockThreshold: integer("min_stock_threshold").notNull().default(2),
  unitProductionCost: numeric("unit_production_cost", { precision: 14, scale: 2 }).notNull().default("0.00"),
  sellingPrice: numeric("selling_price", { precision: 14, scale: 2 }).notNull(),
  primaryImageUrl: text("primary_image_url"),
  description: text("description"),
  status: varchar("status", { length: 24 }).notNull().default("AVAILABLE"), // 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'INACTIVE'
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 21. finished_product_images
export const finishedProductImages = pgTable("finished_product_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  finishedProductId: uuid("finished_product_id").references(() => finishedProducts.id, { onDelete: "cascade" }).notNull(),
  url: text("url").notNull(),
  altText: varchar("alt_text", { length: 160 }),
  isPrimary: boolean("is_primary").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 22. finished_stock_movements (Immutable Finished Goods Ledger)
export const finishedStockMovements = pgTable("finished_stock_movements", {
  id: uuid("id").defaultRandom().primaryKey(),
  idempotencyKey: varchar("idempotency_key", { length: 128 }).notNull().unique(),
  finishedProductId: uuid("finished_product_id").references(() => finishedProducts.id).notNull(),
  movementType: varchar("movement_type", { length: 36 }).notNull(),
  // 'OPENING_STOCK' | 'PRODUCTION_COMPLETION' | 'SALE_DISPATCH' | 'CUSTOMER_RETURN_RESTOCK' | 'CUSTOMER_RETURN_QUARANTINE' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT'
  direction: varchar("direction", { length: 12 }).notNull(), // 'IN' | 'OUT'
  quantity: integer("quantity").notNull(),
  unitCost: numeric("unit_cost", { precision: 14, scale: 2 }).notNull(),
  balanceAfter: integer("balance_after").notNull(),
  referenceType: varchar("reference_type", { length: 36 }).notNull(), // 'PRODUCTION_ORDER' | 'SALE' | 'REFUND' | 'MANUAL_ADJUSTMENT'
  referenceId: varchar("reference_id", { length: 64 }).notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 23. customers
export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 48 }).notNull().unique(),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  secondaryPhone: varchar("secondary_phone", { length: 40 }),
  wilaya: varchar("wilaya", { length: 80 }).notNull().default("16 - Alger"),
  address: text("address"),
  measurementsJson: jsonb("measurements_json").$type<Record<string, string>>().default({}),
  notes: text("notes"),
  totalPurchases: numeric("total_purchases", { precision: 14, scale: 2 }).notNull().default("0.00"),
  totalPaid: numeric("total_paid", { precision: 14, scale: 2 }).notNull().default("0.00"),
  outstandingBalance: numeric("outstanding_balance", { precision: 14, scale: 2 }).notNull().default("0.00"),
  lastPurchaseAt: timestamp("last_purchase_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 24. sales
export const sales = pgTable("sales", {
  id: uuid("id").defaultRandom().primaryKey(),
  idempotencyKey: varchar("idempotency_key", { length: 128 }).notNull().unique(),
  saleNumber: varchar("sale_number", { length: 48 }).notNull().unique(),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  saleDate: timestamp("sale_date", { withTimezone: true }).notNull(),
  status: varchar("status", { length: 28 }).notNull().default("CONFIRMED"),
  // 'DRAFT' | 'CONFIRMED' | 'PARTIALLY_RETURNED' | 'RETURNED' | 'CANCELLED'
  subtotal: numeric("subtotal", { precision: 14, scale: 2 }).notNull(),
  lineDiscountTotal: numeric("line_discount_total", { precision: 14, scale: 2 }).notNull().default("0.00"),
  orderDiscountAmount: numeric("order_discount_amount", { precision: 14, scale: 2 }).notNull().default("0.00"),
  taxAmount: numeric("tax_amount", { precision: 14, scale: 2 }).notNull().default("0.00"),
  totalAmount: numeric("total_amount", { precision: 14, scale: 2 }).notNull(),
  totalCogs: numeric("total_cogs", { precision: 14, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 25. sale_items (Historical Product & Cost Snapshot)
export const saleItems = pgTable("sale_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  saleId: uuid("sale_id").references(() => sales.id, { onDelete: "cascade" }).notNull(),
  finishedProductId: uuid("finished_product_id").references(() => finishedProducts.id).notNull(),
  productSkuSnapshot: varchar("product_sku_snapshot", { length: 64 }).notNull(),
  productNameArSnapshot: varchar("product_name_ar_snapshot", { length: 160 }).notNull(),
  productNameFrSnapshot: varchar("product_name_fr_snapshot", { length: 160 }).notNull(),
  colorSnapshot: varchar("color_snapshot", { length: 64 }).notNull(),
  sizeSnapshot: varchar("size_snapshot", { length: 24 }).notNull(),
  quantity: integer("quantity").notNull(),
  returnedQty: integer("returned_qty").notNull().default(0),
  unitPrice: numeric("unit_price", { precision: 14, scale: 2 }).notNull(),
  unitCostSnapshot: numeric("unit_cost_snapshot", { precision: 14, scale: 2 }).notNull(),
  lineDiscount: numeric("line_discount", { precision: 14, scale: 2 }).notNull().default("0.00"),
  lineTotal: numeric("line_total", { precision: 14, scale: 2 }).notNull(),
});

// 26. invoices (Immutable Commercial Document)
export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 48 }).notNull().unique(),
  saleId: uuid("sale_id").references(() => sales.id).notNull(),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  documentStatus: varchar("document_status", { length: 24 }).notNull().default("ISSUED"), // 'DRAFT' | 'ISSUED' | 'CANCELLED'
  paymentStatus: varchar("payment_status", { length: 28 }).notNull().default("UNPAID"),
  // Automatically derived: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'PARTIALLY_REFUNDED' | 'REFUNDED'
  issueDate: timestamp("issue_date", { withTimezone: true }).notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
  workshopSnapshotJson: jsonb("workshop_snapshot_json").notNull(),
  customerSnapshotJson: jsonb("customer_snapshot_json").notNull(),
  subtotal: numeric("subtotal", { precision: 14, scale: 2 }).notNull(),
  discountTotal: numeric("discount_total", { precision: 14, scale: 2 }).notNull().default("0.00"),
  taxAmount: numeric("tax_amount", { precision: 14, scale: 2 }).notNull().default("0.00"),
  totalAmount: numeric("total_amount", { precision: 14, scale: 2 }).notNull(),
  paidAmount: numeric("paid_amount", { precision: 14, scale: 2 }).notNull().default("0.00"),
  refundedAmount: numeric("refunded_amount", { precision: 14, scale: 2 }).notNull().default("0.00"),
  netPaidAmount: numeric("net_paid_amount", { precision: 14, scale: 2 }).notNull().default("0.00"),
  remainingBalance: numeric("remaining_balance", { precision: 14, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 27. invoice_items (Immutable Line Snapshots)
export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "cascade" }).notNull(),
  lineNumber: integer("line_number").notNull(),
  skuSnapshot: varchar("sku_snapshot", { length: 64 }).notNull(),
  descriptionArSnapshot: varchar("description_ar_snapshot", { length: 200 }).notNull(),
  descriptionFrSnapshot: varchar("description_fr_snapshot", { length: 200 }).notNull(),
  colorSnapshot: varchar("color_snapshot", { length: 64 }).notNull(),
  sizeSnapshot: varchar("size_snapshot", { length: 24 }).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 14, scale: 2 }).notNull(),
  lineDiscount: numeric("line_discount", { precision: 14, scale: 2 }).notNull().default("0.00"),
  lineTotal: numeric("line_total", { precision: 14, scale: 2 }).notNull(),
});

// 28. payments (Customer Receipts Ledger)
export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  idempotencyKey: varchar("idempotency_key", { length: 128 }).notNull().unique(),
  paymentReference: varchar("payment_reference", { length: 64 }).notNull().unique(),
  invoiceId: uuid("invoice_id").references(() => invoices.id).notNull(),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 36 }).notNull(),
  // 'CASH' | 'BARIDIMOB' | 'CCP' | 'BANK_TRANSFER' | 'CIB' | 'EDAHABIA' | 'COD' | 'CUSTOM'
  paymentDate: timestamp("payment_date", { withTimezone: true }).notNull(),
  externalRef: varchar("external_ref", { length: 80 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 29. refunds (Customer Refunds & Product Returns Ledger)
export const refunds = pgTable("refunds", {
  id: uuid("id").defaultRandom().primaryKey(),
  idempotencyKey: varchar("idempotency_key", { length: 128 }).notNull().unique(),
  refundReference: varchar("refund_reference", { length: 64 }).notNull().unique(),
  saleId: uuid("sale_id").references(() => sales.id).notNull(),
  invoiceId: uuid("invoice_id").references(() => invoices.id).notNull(),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  finishedProductId: uuid("finished_product_id").references(() => finishedProducts.id),
  returnedQuantity: integer("returned_quantity").notNull().default(0),
  returnCondition: varchar("return_condition", { length: 32 }).notNull().default("RESTOCK"), // 'RESTOCK' | 'QUARANTINE_DAMAGED' | 'NO_PHYSICAL_RETURN'
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  refundMethod: varchar("refund_method", { length: 36 }).notNull(),
  reason: text("reason").notNull(),
  refundDate: timestamp("refund_date", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 30. expenses (Operating Expenses)
export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  idempotencyKey: varchar("idempotency_key", { length: 128 }).notNull().unique(),
  expenseNumber: varchar("expense_number", { length: 48 }).notNull().unique(),
  titleAr: varchar("title_ar", { length: 160 }).notNull(),
  titleFr: varchar("title_fr", { length: 160 }).notNull(),
  categoryId: uuid("category_id").references(() => categories.id).notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 36 }).notNull(),
  beneficiary: varchar("beneficiary", { length: 160 }),
  expenseDate: timestamp("expense_date", { withTimezone: true }).notNull(),
  description: text("description"),
  attachmentUrl: text("attachment_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 31. cash_movements (Caisse / Treasury Ledger)
export const cashMovements = pgTable("cash_movements", {
  id: uuid("id").defaultRandom().primaryKey(),
  idempotencyKey: varchar("idempotency_key", { length: 128 }).notNull().unique(),
  movementReference: varchar("movement_reference", { length: 64 }).notNull().unique(),
  direction: varchar("direction", { length: 12 }).notNull(), // 'IN' | 'OUT'
  category: varchar("category", { length: 36 }).notNull(),
  // 'OPENING_CAISSE' | 'CUSTOMER_PAYMENT' | 'CUSTOMER_REFUND' | 'SUPPLIER_PAYMENT' | 'OPERATING_EXPENSE' | 'CAISSE_ADJUSTMENT'
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 36 }).notNull(),
  balanceAfter: numeric("balance_after", { precision: 14, scale: 2 }).notNull(),
  referenceType: varchar("reference_type", { length: 36 }).notNull(),
  referenceId: varchar("reference_id", { length: 64 }).notNull(),
  description: text("description").notNull(),
  movementDate: timestamp("movement_date", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 32. attachments
export const attachments = pgTable("attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  entityType: varchar("entity_type", { length: 36 }).notNull(), // 'PURCHASE' | 'EXPENSE' | 'MODEL' | 'PRODUCTION_ORDER'
  entityId: varchar("entity_id", { length: 64 }).notNull(),
  fileName: varchar("file_name", { length: 200 }).notNull(),
  mimeType: varchar("mime_type", { length: 80 }).notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 33. activity_logs (Audit Trail for Sensitive Operations)
export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  actionType: varchar("action_type", { length: 64 }).notNull(),
  entityType: varchar("entity_type", { length: 48 }).notNull(),
  entityId: varchar("entity_id", { length: 64 }).notNull(),
  summaryAr: text("summary_ar").notNull(),
  summaryFr: text("summary_fr").notNull(),
  metadataJson: jsonb("metadata_json").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
