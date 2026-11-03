# ATELIER OS — Database Design, Ledgers & Accounting Assumptions

## 1. Entity Inventory (33 Normalized Tables)

1. `workshop_settings` — Workshop identity, logo, DZD currency, `Africa/Algiers` timezone, invoice numbering, and stock policy flags.
2. `categories` — Unified taxonomy across `MATERIAL`, `PRODUCT`, and `EXPENSE` domains.
3. `suppliers` — Supplier directory and payable balances.
4. `materials` — Raw materials with `on_hand_qty`, `reserved_qty`, `available_qty`, `average_cost`, and `min_stock_threshold`.
5. `material_images` — Multi-image gallery for raw materials.
6. `material_stock_movements` — Immutable ledger for every raw material stock event (`OPENING_BALANCE`, `PURCHASE_RECEIPT`, `PRODUCTION_RESERVE`, `PRODUCTION_RELEASE`, `PRODUCTION_ISSUE`, `PRODUCTION_RETURN`, `ADJUSTMENT_IN`, `ADJUSTMENT_OUT`).
7. `purchases` — Purchase orders with receipt status and supplier payment status.
8. `purchase_items` — Line items linking purchases to raw materials.
9. `supplier_payments` — Traceable payments issued to suppliers.
10. `models` — Couture design catalog (`Abaya`, `Karakou`, `Caftan`, `Kimono`, `Hijab`).
11. `model_images` — Multi-image gallery for models.
12. `model_variants` — Color and size combinations per model.
13. `bill_of_materials` — Versioned BOM header per model.
14. `bill_of_material_items` — Raw material quantities and wastage percentages per unit.
15. `production_stages` — Configurable workshop stages (9 default stages).
16. `production_orders` — Production order header with status, stage, and cost fields.
17. `production_order_stages` — Stage progression history per production order.
18. `production_consumptions` — Planned vs reserved vs actual consumed + waste quantities per material.
19. `quality_checks` — QC inspection results (`inspected_qty`, `accepted_qty`, `rejected_qty`, checklist flags).
20. `finished_products` — Separated finished goods inventory by variant (`color`, `size`, `sku`, `barcode`, `unit_production_cost`, `selling_price`).
21. `finished_product_images` — Multi-image gallery for finished products.
22. `finished_stock_movements` — Immutable finished goods ledger (`PRODUCTION_COMPLETION`, `SALE_DISPATCH`, `CUSTOMER_RETURN_RESTOCK`, `CUSTOMER_RETURN_QUARANTINE`, `ADJUSTMENT_IN`, `ADJUSTMENT_OUT`).
23. `customers` — Customer directory, custom measurements JSON, and receivable balances.
24. `sales` — Confirmed POS and workshop sales headers with recognized revenue and COGS.
25. `sale_items` — Historical product, price, and unit cost snapshots at time of sale.
26. `invoices` — Immutable commercial invoices with `workshop_snapshot_json` and `customer_snapshot_json`.
27. `invoice_items` — Immutable line-item snapshots for confirmed invoices.
28. `payments` — Customer payment receipts (`CASH`, `BARIDIMOB`, `CCP`, `BANK_TRANSFER`, `CIB`, `EDAHABIA`, `COD`).
29. `refunds` — Customer refund and return records linked to sales and invoices.
30. `expenses` — Workshop operating expenses (rent, electricity, transport, maintenance, packaging).
31. `cash_movements` — Unified treasury (`Caisse`) ledger preventing double-counting between sales and receipts.
32. `attachments` — Supporting documents and receipts.
33. `activity_logs` — Audit trail of sensitive operations.

## 2. Cost Accounting & Financial Rules

- **Raw Material Valuation**: Moving Weighted-Average Cost (*Coût Moyen Pondéré — CMP*). When a purchase is received, `new_avg_cost = ((old_on_hand * old_avg_cost) + (received_qty * purchase_unit_price)) / (old_on_hand + received_qty)`.
- **Production Unit Cost**: Upon production order completion, `actual_total_cost = sum(actual_consumed_qty * material_unit_cost_at_issue) + direct_labor_cost`. The accepted finished units enter `finished_products` at `actual_unit_cost = actual_total_cost / accepted_qty` (blended with existing variant stock via moving weighted average).
- **Profit & Loss Recognition**:
  - **Net Recognized Sales Revenue** = Confirmed Sales Total − Customer Refunds.
  - **Cost of Goods Sold (COGS)** = Sum of `(quantity_sold - quantity_restocked) * unit_cost_snapshot`.
  - **Gross Profit (Marge Brute)** = Net Recognized Sales Revenue − COGS.
  - **Net Operating Profit (Résultat Net Opérationnel)** = Gross Profit − Operating Expenses (`expenses` table).
  - **Cash Collected (Encaissements)** = Sum of customer `payments` minus `refunds` (tracked separately from invoiced revenue so credit sales are never double-counted as cash).
  - *Disclaimer*: This financial module provides operational management accounting for the workshop and is not a substitute for statutory Algerian SCF/tax filing by a certified accountant.
