-- ============================================================================
-- ATELIER OS — Complete PostgreSQL / SQLite Compatible DDL Schema Migration
-- Brand Reference: AFAF EL ASSLI (عفاف الأصلي)
-- Total Tables: 33 Core Operational, Inventory, Production & Financial Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS workshop_settings (
  id TEXT PRIMARY KEY,
  workshop_name_ar TEXT NOT NULL DEFAULT 'دار عفاف الأصلي للأزياء الراقية',
  workshop_name_fr TEXT NOT NULL DEFAULT 'Maison AFAF EL ASSLI Haute Couture',
  logo_url TEXT NOT NULL DEFAULT '/assets/afaf-el-assli-logo.png',
  address_ar TEXT NOT NULL DEFAULT 'حي حيدرة، الجزائر العاصمة، الجزائر',
  address_fr TEXT NOT NULL DEFAULT 'Hydra, Alger, Algérie',
  wilaya TEXT NOT NULL DEFAULT '16 - Alger',
  phone TEXT NOT NULL DEFAULT '+213 550 16 88 42',
  email TEXT NOT NULL DEFAULT 'atelier@afafelassli.dz',
  rc_number TEXT DEFAULT '16/00-4829103B24',
  nif_number TEXT DEFAULT '002416048291038',
  default_language TEXT NOT NULL DEFAULT 'ar',
  currency TEXT NOT NULL DEFAULT 'DZD',
  timezone TEXT NOT NULL DEFAULT 'Africa/Algiers',
  date_format TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
  invoice_prefix TEXT NOT NULL DEFAULT 'FAC-2026-',
  next_invoice_sequence INTEGER NOT NULL DEFAULT 1001,
  default_invoice_lang TEXT NOT NULL DEFAULT 'bilingual',
  tax_enabled INTEGER NOT NULL DEFAULT 0,
  default_tax_rate NUMERIC(6,2) NOT NULL DEFAULT 0.00,
  prevent_negative_stock INTEGER NOT NULL DEFAULT 1,
  costing_method TEXT NOT NULL DEFAULT 'MOVING_WEIGHTED_AVERAGE',
  theme_mode TEXT NOT NULL DEFAULT 'light',
  invoice_footer_ar TEXT,
  invoice_footer_fr TEXT,
  last_backup_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  domain TEXT NOT NULL CHECK (domain IN ('MATERIAL', 'PRODUCT', 'EXPENSE')),
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  city TEXT NOT NULL DEFAULT 'Alger',
  address TEXT,
  notes TEXT,
  total_purchases NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  total_paid NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  outstanding_balance NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS materials (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id),
  supplier_id TEXT REFERENCES suppliers(id),
  description TEXT,
  color TEXT,
  unit TEXT NOT NULL,
  on_hand_qty NUMERIC(14,3) NOT NULL DEFAULT 0.000 CHECK (on_hand_qty >= 0),
  reserved_qty NUMERIC(14,3) NOT NULL DEFAULT 0.000 CHECK (reserved_qty >= 0),
  available_qty NUMERIC(14,3) NOT NULL DEFAULT 0.000,
  min_stock_threshold NUMERIC(14,3) NOT NULL DEFAULT 5.000,
  average_cost NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  last_purchase_cost NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  storage_location TEXT DEFAULT 'Rayon A1',
  primary_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS material_images (
  id TEXT PRIMARY KEY,
  material_id TEXT NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  is_primary INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS material_stock_movements (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  material_id TEXT NOT NULL REFERENCES materials(id),
  movement_type TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('IN', 'OUT', 'RESERVE', 'RELEASE')),
  quantity NUMERIC(14,3) NOT NULL CHECK (quantity > 0),
  unit_cost NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  total_cost NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  balance_after_on_hand NUMERIC(14,3) NOT NULL,
  balance_after_available NUMERIC(14,3) NOT NULL,
  reference_type TEXT NOT NULL,
  reference_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  purchase_number TEXT NOT NULL UNIQUE,
  supplier_id TEXT NOT NULL REFERENCES suppliers(id),
  purchase_date TEXT NOT NULL,
  due_date TEXT,
  receipt_status TEXT NOT NULL DEFAULT 'DRAFT',
  payment_status TEXT NOT NULL DEFAULT 'UNPAID',
  subtotal NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  shipping_cost NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  discount_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  paid_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  remaining_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  received_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_items (
  id TEXT PRIMARY KEY,
  purchase_id TEXT NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  material_id TEXT NOT NULL REFERENCES materials(id),
  ordered_qty NUMERIC(14,3) NOT NULL CHECK (ordered_qty > 0),
  received_qty NUMERIC(14,3) NOT NULL DEFAULT 0.000 CHECK (received_qty >= 0),
  unit_price NUMERIC(14,2) NOT NULL CHECK (unit_price >= 0),
  discount_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  line_total NUMERIC(14,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS supplier_payments (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  payment_reference TEXT NOT NULL UNIQUE,
  supplier_id TEXT NOT NULL REFERENCES suppliers(id),
  purchase_id TEXT REFERENCES purchases(id),
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL,
  payment_date TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS models (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id),
  description TEXT,
  available_colors TEXT NOT NULL DEFAULT '[]',
  available_sizes TEXT NOT NULL DEFAULT '[]',
  expected_production_hours NUMERIC(8,2) NOT NULL DEFAULT 6.00,
  estimated_labor_cost NUMERIC(14,2) NOT NULL DEFAULT 2500.00,
  default_selling_price NUMERIC(14,2) NOT NULL DEFAULT 18500.00,
  primary_image_url TEXT,
  production_notes TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS model_images (
  id TEXT PRIMARY KEY,
  model_id TEXT NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  is_primary INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS model_variants (
  id TEXT PRIMARY KEY,
  model_id TEXT NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  sku TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  size TEXT NOT NULL,
  selling_price NUMERIC(14,2) NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bill_of_materials (
  id TEXT PRIMARY KEY,
  model_id TEXT NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  batch_size INTEGER NOT NULL DEFAULT 1,
  is_current INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bill_of_material_items (
  id TEXT PRIMARY KEY,
  bom_id TEXT NOT NULL REFERENCES bill_of_materials(id) ON DELETE CASCADE,
  material_id TEXT NOT NULL REFERENCES materials(id),
  quantity_per_unit NUMERIC(14,3) NOT NULL CHECK (quantity_per_unit > 0),
  wastage_percent NUMERIC(6,2) NOT NULL DEFAULT 0.00,
  stage_note TEXT
);

CREATE TABLE IF NOT EXISTS production_stages (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS production_orders (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  order_number TEXT NOT NULL UNIQUE,
  model_id TEXT NOT NULL REFERENCES models(id),
  bom_id TEXT NOT NULL REFERENCES bill_of_materials(id),
  color TEXT NOT NULL,
  size TEXT NOT NULL,
  requested_qty INTEGER NOT NULL CHECK (requested_qty > 0),
  produced_qty INTEGER NOT NULL DEFAULT 0,
  accepted_qty INTEGER NOT NULL DEFAULT 0,
  rejected_qty INTEGER NOT NULL DEFAULT 0,
  current_stage_code TEXT NOT NULL DEFAULT 'PLANNED',
  status TEXT NOT NULL DEFAULT 'PLANNED',
  materials_reserved INTEGER NOT NULL DEFAULT 0,
  materials_issued INTEGER NOT NULL DEFAULT 0,
  stock_completed INTEGER NOT NULL DEFAULT 0,
  planned_start_date TEXT NOT NULL,
  expected_completion_date TEXT NOT NULL,
  completed_at TEXT,
  estimated_material_cost NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  actual_material_cost NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  direct_labor_cost NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  actual_total_cost NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  actual_unit_cost NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  assigned_notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_order_stages (
  id TEXT PRIMARY KEY,
  production_order_id TEXT NOT NULL REFERENCES production_orders(id) ON DELETE CASCADE,
  stage_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  qty_entered INTEGER NOT NULL DEFAULT 0,
  qty_accepted INTEGER NOT NULL DEFAULT 0,
  qty_rejected INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  started_at TEXT,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS production_consumptions (
  id TEXT PRIMARY KEY,
  production_order_id TEXT NOT NULL REFERENCES production_orders(id) ON DELETE CASCADE,
  material_id TEXT NOT NULL REFERENCES materials(id),
  planned_qty NUMERIC(14,3) NOT NULL,
  reserved_qty NUMERIC(14,3) NOT NULL DEFAULT 0.000,
  actual_consumed_qty NUMERIC(14,3) NOT NULL DEFAULT 0.000,
  waste_qty NUMERIC(14,3) NOT NULL DEFAULT 0.000,
  unit_cost_at_issue NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  total_actual_cost NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  waste_reason TEXT
);

CREATE TABLE IF NOT EXISTS quality_checks (
  id TEXT PRIMARY KEY,
  production_order_id TEXT NOT NULL REFERENCES production_orders(id) ON DELETE CASCADE,
  inspected_qty INTEGER NOT NULL,
  accepted_qty INTEGER NOT NULL,
  rejected_qty INTEGER NOT NULL,
  rework_qty INTEGER NOT NULL DEFAULT 0,
  measurements_pass INTEGER NOT NULL DEFAULT 1,
  stitching_pass INTEGER NOT NULL DEFAULT 1,
  embroidery_pass INTEGER NOT NULL DEFAULT 1,
  cleanliness_pass INTEGER NOT NULL DEFAULT 1,
  result TEXT NOT NULL,
  notes TEXT,
  checked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS finished_products (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  barcode TEXT UNIQUE,
  model_id TEXT NOT NULL REFERENCES models(id),
  category_id TEXT NOT NULL REFERENCES categories(id),
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  color TEXT NOT NULL,
  size TEXT NOT NULL,
  on_hand_qty INTEGER NOT NULL DEFAULT 0 CHECK (on_hand_qty >= 0),
  reserved_qty INTEGER NOT NULL DEFAULT 0 CHECK (reserved_qty >= 0),
  available_qty INTEGER NOT NULL DEFAULT 0,
  min_stock_threshold INTEGER NOT NULL DEFAULT 2,
  unit_production_cost NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  selling_price NUMERIC(14,2) NOT NULL,
  primary_image_url TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'AVAILABLE',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS finished_product_images (
  id TEXT PRIMARY KEY,
  finished_product_id TEXT NOT NULL REFERENCES finished_products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  is_primary INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS finished_stock_movements (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  finished_product_id TEXT NOT NULL REFERENCES finished_products(id),
  movement_type TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('IN', 'OUT')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_cost NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  balance_after INTEGER NOT NULL,
  reference_type TEXT NOT NULL,
  reference_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  secondary_phone TEXT,
  wilaya TEXT NOT NULL DEFAULT '16 - Alger',
  address TEXT,
  measurements_json TEXT DEFAULT '{}',
  notes TEXT,
  total_purchases NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  total_paid NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  outstanding_balance NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  last_purchase_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  sale_number TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  sale_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'CONFIRMED',
  subtotal NUMERIC(14,2) NOT NULL,
  line_discount_total NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  order_discount_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(14,2) NOT NULL,
  total_cogs NUMERIC(14,2) NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sale_items (
  id TEXT PRIMARY KEY,
  sale_id TEXT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  finished_product_id TEXT NOT NULL REFERENCES finished_products(id),
  product_sku_snapshot TEXT NOT NULL,
  product_name_ar_snapshot TEXT NOT NULL,
  product_name_fr_snapshot TEXT NOT NULL,
  color_snapshot TEXT NOT NULL,
  size_snapshot TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  returned_qty INTEGER NOT NULL DEFAULT 0,
  unit_price NUMERIC(14,2) NOT NULL,
  unit_cost_snapshot NUMERIC(14,2) NOT NULL,
  line_discount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  line_total NUMERIC(14,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  sale_id TEXT NOT NULL REFERENCES sales(id),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  document_status TEXT NOT NULL DEFAULT 'ISSUED',
  payment_status TEXT NOT NULL DEFAULT 'UNPAID',
  issue_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  workshop_snapshot_json TEXT NOT NULL,
  customer_snapshot_json TEXT NOT NULL,
  subtotal NUMERIC(14,2) NOT NULL,
  discount_total NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(14,2) NOT NULL,
  paid_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  refunded_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  net_paid_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  remaining_balance NUMERIC(14,2) NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  sku_snapshot TEXT NOT NULL,
  description_ar_snapshot TEXT NOT NULL,
  description_fr_snapshot TEXT NOT NULL,
  color_snapshot TEXT NOT NULL,
  size_snapshot TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(14,2) NOT NULL,
  line_discount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  line_total NUMERIC(14,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  payment_reference TEXT NOT NULL UNIQUE,
  invoice_id TEXT NOT NULL REFERENCES invoices(id),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL,
  payment_date TEXT NOT NULL,
  external_ref TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refunds (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  refund_reference TEXT NOT NULL UNIQUE,
  sale_id TEXT NOT NULL REFERENCES sales(id),
  invoice_id TEXT NOT NULL REFERENCES invoices(id),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  finished_product_id TEXT REFERENCES finished_products(id),
  returned_quantity INTEGER NOT NULL DEFAULT 0,
  return_condition TEXT NOT NULL DEFAULT 'RESTOCK',
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  refund_method TEXT NOT NULL,
  reason TEXT NOT NULL,
  refund_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  expense_number TEXT NOT NULL UNIQUE,
  title_ar TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id),
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL,
  beneficiary TEXT,
  expense_date TEXT NOT NULL,
  description TEXT,
  attachment_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cash_movements (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  movement_reference TEXT NOT NULL UNIQUE,
  direction TEXT NOT NULL CHECK (direction IN ('IN', 'OUT')),
  category TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL,
  balance_after NUMERIC(14,2) NOT NULL,
  reference_type TEXT NOT NULL,
  reference_id TEXT NOT NULL,
  description TEXT NOT NULL,
  movement_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  url TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  summary_ar TEXT NOT NULL,
  summary_fr TEXT NOT NULL,
  metadata_json TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
