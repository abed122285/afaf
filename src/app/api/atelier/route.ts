import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import {
  calculateInvoicePaymentStatus,
  calculateMovingWeightedAverageCost,
  getAlgiersCurrentDateIso,
  AtelierPostgresRepository,
  roundMoney,
  roundQty,
} from "@/services/atelierService";
import {
  MaterialCreateSchema,
  MaterialUpdateSchema,
  StockAdjustmentSchema,
  SupplierCreateSchema,
  PurchaseOrderSchema,
  SupplierPaymentSchema,
  ModelCreateSchema,
  ProductionOrderCreateSchema,
  ProductionCompletionSchema,
  FinishedProductCreateSchema,
  SaleCheckoutSchema,
  PaymentCreateSchema,
  RefundCreateSchema,
  CustomerCreateSchema,
  ExpenseCreateSchema,
} from "@/lib/validators";


const ACTION_REQUIRED_PERMISSION: Record<string, string> = {
  ADD_MATERIAL: "inventory.adjust",
  CREATE_MATERIAL: "inventory.adjust",
  UPDATE_MATERIAL: "inventory.adjust",
  ADJUST_MATERIAL_STOCK: "inventory.adjust",
  CREATE_SUPPLIER: "purchases.create",
  CREATE_AND_RECEIVE_PURCHASE: "purchases.create",
  RECORD_SUPPLIER_PAYMENT: "purchases.create",
  CREATE_MODEL: "models.create",
  CREATE_MODEL_WITH_BOM: "models.create",
  CREATE_PRODUCTION_ORDER: "production.create",
  COMPLETE_PRODUCTION_ORDER: "production.update",
  CREATE_FINISHED_PRODUCT: "production.update",
  COMPLETE_POS_SALE: "sales.create",
  CREATE_POS_SALE: "sales.create",
  RECORD_PAYMENT: "invoices.create",
  RECORD_REFUND: "sales.cancel",
  PROCESS_REFUND: "sales.cancel",
  CREATE_CUSTOMER: "customers.create",
  CREATE_EXPENSE: "finance.create_expense",
  RECORD_EXPENSE: "finance.create_expense",
};

export async function GET() {
  try {
    const [settings] = await db.select().from(schema.workshopSettings).limit(1);
    const categories = await db.select().from(schema.categories);
    const suppliers = await db.select().from(schema.suppliers);
    const materials = await db.select().from(schema.materials);
    const materialMovements = await db
      .select()
      .from(schema.materialStockMovements)
      .orderBy(desc(schema.materialStockMovements.createdAt));
    const purchases = await db.select().from(schema.purchases).orderBy(desc(schema.purchases.createdAt));
    const models = await db.select().from(schema.models);
    const productionOrders = await db
      .select()
      .from(schema.productionOrders)
      .orderBy(desc(schema.productionOrders.createdAt));
    const finishedProducts = await db.select().from(schema.finishedProducts);
    const finishedMovements = await db
      .select()
      .from(schema.finishedStockMovements)
      .orderBy(desc(schema.finishedStockMovements.createdAt));
    const customers = await db.select().from(schema.customers);
    const sales = await db.select().from(schema.sales).orderBy(desc(schema.sales.createdAt));
    const invoices = await db.select().from(schema.invoices).orderBy(desc(schema.invoices.createdAt));
    const payments = await db.select().from(schema.payments).orderBy(desc(schema.payments.createdAt));
    const refunds = await db.select().from(schema.refunds).orderBy(desc(schema.refunds.createdAt));
    const expenses = await db.select().from(schema.expenses).orderBy(desc(schema.expenses.createdAt));
    const cashMovements = await db
      .select()
      .from(schema.cashMovements)
      .orderBy(desc(schema.cashMovements.createdAt));

    return NextResponse.json({
      system: "ATELIER OS — Maison AFAF EL ASSLI",
      version: "1.1.0",
      currentAlgiersDate: getAlgiersCurrentDateIso(),
      data: {
        settings,
        categories,
        suppliers,
        materials,
        materialMovements,
        purchases,
        models,
        productionOrders,
        finishedProducts,
        finishedMovements,
        customers,
        sales,
        invoices,
        payments,
        refunds,
        expenses,
        cashMovements,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to load workshop state from PostgreSQL" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, payload, actorRole, actorPermissions } = body || {};
    const requiredPerm = ACTION_REQUIRED_PERMISSION[String(action)];
    if (requiredPerm && actorRole && actorRole !== "OWNER_ADMIN" && Array.isArray(actorPermissions)) {
      if (!actorPermissions.includes(requiredPerm)) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "RBAC_FORBIDDEN",
              message: `Permission denied: action ${action} requires '${requiredPerm}'`,
            },
          },
          { status: 403 }
        );
      }
    }

    switch (action) {
      case "CALCULATE_PAYMENT_STATUS": {
        return NextResponse.json(calculateInvoicePaymentStatus(payload));
      }
      case "CALCULATE_CMP": {
        const { currentOnHandQty, currentAvgCost, receivedQty, receivedUnitCost } = payload;
        return NextResponse.json({
          averageCost: calculateMovingWeightedAverageCost(
            Number(currentOnHandQty),
            Number(currentAvgCost),
            Number(receivedQty),
            Number(receivedUnitCost)
          ),
        });
      }
      case "ADD_MATERIAL": {
        const parsed = MaterialCreateSchema.parse(payload);
        const result = await db.transaction(async (tx) => {
          const [mat] = await tx
            .insert(schema.materials)
            .values({
              sku: parsed.sku,
              nameAr: parsed.nameAr,
              nameFr: parsed.nameFr,
              categoryId: parsed.categoryId,
              supplierId: parsed.supplierId || null,
              color: parsed.color,
              unit: parsed.unit,
              onHandQty: String(roundQty(parsed.openingQty)),
              reservedQty: "0.000",
              availableQty: String(roundQty(parsed.openingQty)),
              minStockThreshold: String(roundQty(parsed.minStockThreshold)),
              averageCost: String(roundMoney(parsed.unitCost)),
              lastPurchaseCost: String(roundMoney(parsed.unitCost)),
              storageLocation: parsed.storageLocation,
              primaryImageUrl: parsed.primaryImageUrl,
              description: parsed.description,
            })
            .returning();

          if (parsed.openingQty > 0) {
            await tx.insert(schema.materialStockMovements).values({
              idempotencyKey: `open-${mat.id}`,
              materialId: mat.id,
              movementType: "OPENING_BALANCE",
              direction: "IN",
              quantity: String(roundQty(parsed.openingQty)),
              unitCost: String(roundMoney(parsed.unitCost)),
              totalCost: String(roundMoney(parsed.openingQty * parsed.unitCost)),
              balanceAfterOnHand: String(roundQty(parsed.openingQty)),
              balanceAfterAvailable: String(roundQty(parsed.openingQty)),
              referenceType: "INITIAL_SEED",
              referenceId: mat.sku,
              reason: "Opening balance at material creation",
            });
          }
          return mat;
        });
        return NextResponse.json({ status: "CREATED", result }, { status: 201 });
      }
      case "UPDATE_MATERIAL": {
        const parsed = MaterialUpdateSchema.parse(payload);
        const result = await AtelierPostgresRepository.updateMaterialDetails(parsed);
        return NextResponse.json({ status: "UPDATED", result });
      }
      case "ADJUST_MATERIAL_STOCK": {
        const parsed = StockAdjustmentSchema.parse(payload);
        const result = await AtelierPostgresRepository.adjustMaterialStock(parsed);
        return NextResponse.json({ status: "COMMITTED", result });
      }
      case "CREATE_SUPPLIER": {
        const parsed = SupplierCreateSchema.parse(payload);
        const [supplier] = await db
          .insert(schema.suppliers)
          .values({
            code: `FOUR-${Date.now().toString().slice(-4)}`,
            name: parsed.name,
            contactPerson: parsed.contactPerson,
            phone: parsed.phone,
            email: parsed.email || null,
            city: parsed.city,
            address: parsed.address,
            notes: parsed.notes,
          })
          .returning();
        return NextResponse.json({ status: "CREATED", result: supplier }, { status: 201 });
      }
      case "CREATE_AND_RECEIVE_PURCHASE": {
        const parsed = PurchaseOrderSchema.parse(payload);
        const result = await AtelierPostgresRepository.receivePurchaseTransaction(parsed);
        return NextResponse.json({ status: "COMMITTED", result }, { status: 201 });
      }
      case "CREATE_CUSTOMER": {
        const parsed = CustomerCreateSchema.parse(payload);
        const [customer] = await db
          .insert(schema.customers)
          .values({
            code: `CLI-${Date.now().toString().slice(-4)}`,
            fullName: parsed.fullName,
            phone: parsed.phone,
            wilaya: parsed.wilaya,
            address: parsed.address,
            measurementsJson: parsed.measurements || {},
            notes: parsed.notes,
          })
          .returning();
        return NextResponse.json({ status: "CREATED", result: customer }, { status: 201 });
      }
      case "CREATE_EXPENSE": {
        const parsed = ExpenseCreateSchema.parse(payload);
        const [expense] = await db
          .insert(schema.expenses)
          .values({
            idempotencyKey: parsed.idempotencyKey,
            expenseNumber: `DEP-${Date.now().toString().slice(-5)}`,
            titleAr: parsed.titleAr,
            titleFr: parsed.titleFr,
            categoryId: parsed.categoryId,
            amount: String(roundMoney(parsed.amount)),
            paymentMethod: parsed.paymentMethod,
            beneficiary: parsed.beneficiary,
            expenseDate: parsed.expenseDate ? new Date(parsed.expenseDate) : new Date(),
            description: parsed.description,
            attachmentUrl: parsed.attachmentUrl,
          })
          .returning();
        return NextResponse.json({ status: "CREATED", result: expense }, { status: 201 });
      }
      case "RECORD_SUPPLIER_PAYMENT": {
        const parsed = SupplierPaymentSchema.parse(payload);
        const result = await AtelierPostgresRepository.recordSupplierPaymentTransaction(parsed);
        return NextResponse.json({ status: "COMMITTED", result }, { status: 201 });
      }
      case "CREATE_MODEL":
      case "CREATE_MODEL_WITH_BOM": {
        const parsed = ModelCreateSchema.parse(payload);
        const result = await AtelierPostgresRepository.createModelWithBomTransaction(parsed);
        return NextResponse.json({ status: "CREATED", result }, { status: 201 });
      }
      case "CREATE_PRODUCTION_ORDER": {
        const parsed = ProductionOrderCreateSchema.parse(payload);
        const result = await AtelierPostgresRepository.createProductionOrderTransaction(parsed);
        return NextResponse.json({ status: "CREATED", result }, { status: 201 });
      }
      case "COMPLETE_PRODUCTION_ORDER": {
        const parsed = ProductionCompletionSchema.parse(payload);
        const result = await AtelierPostgresRepository.completeProductionOrderTransaction(parsed);
        return NextResponse.json({ status: "COMMITTED", result });
      }
      case "CREATE_FINISHED_PRODUCT": {
        const parsed = FinishedProductCreateSchema.parse(payload);
        const [fp] = await db
          .insert(schema.finishedProducts)
          .values({
            sku: parsed.sku,
            modelId: parsed.modelId,
            nameAr: parsed.nameAr,
            nameFr: parsed.nameFr,
            sizeLabel: parsed.sizeLabel,
            colorLabel: parsed.colorLabel,
            onHandQty: parsed.openingQty,
            availableQty: parsed.openingQty,
            unitCost: String(roundMoney(parsed.unitCost)),
            sellingPrice: String(roundMoney(parsed.sellingPrice)),
            primaryImageUrl: parsed.primaryImageUrl,
          })
          .returning();
        return NextResponse.json({ status: "CREATED", result: fp }, { status: 201 });
      }
      case "COMPLETE_POS_SALE":
      case "CREATE_POS_SALE": {
        const parsed = SaleCheckoutSchema.parse(payload);
        const result = await AtelierPostgresRepository.completeSaleCheckoutTransaction(parsed);
        return NextResponse.json({ status: "COMMITTED", result }, { status: 201 });
      }
      case "RECORD_PAYMENT": {
        const parsed = PaymentCreateSchema.parse(payload);
        const result = await AtelierPostgresRepository.recordCustomerPaymentTransaction(parsed);
        return NextResponse.json({ status: "COMMITTED", result }, { status: 201 });
      }
      case "RECORD_REFUND":
      case "PROCESS_REFUND": {
        const parsed = RefundCreateSchema.parse(payload);
        const result = await AtelierPostgresRepository.processRefundTransaction(parsed);
        return NextResponse.json({ status: "COMMITTED", result }, { status: 201 });
      }
      default: {
        return NextResponse.json(
          { error: `Unsupported action: ${String(action)}`, code: "INVALID_ACTION" },
          { status: 400 }
        );
      }
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Database transaction failed", issues: err?.issues },
      { status: 422 }
    );
  }
}
