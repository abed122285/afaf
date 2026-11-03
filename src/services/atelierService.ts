import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";

export type PaymentStatus =
  | "UNPAID"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED";

export interface PaymentStatusInput {
  totalAmount: number;
  paidAmount: number;
  refundedAmount: number;
  dueDateIso: string;
  nowIso?: string;
  documentStatus?: "DRAFT" | "ISSUED" | "CANCELLED";
}

export function roundMoney(value: number): number {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

export function roundQty(value: number): number {
  return Math.round((Number(value) + Number.EPSILON) * 1000) / 1000;
}

/**
 * Returns the current date in Africa/Algiers timezone formatted as YYYY-MM-DD.
 * Eliminates hardcoded date constants across reporting and overdue checks.
 */
export function getAlgiersCurrentDateIso(referenceDate?: Date): string {
  const d = referenceDate || new Date();
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Algiers",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(d);
    const y = parts.find((p) => p.type === "year")?.value;
    const m = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    if (y && m && day) return `${y}-${m}-${day}`;
  } catch {
    // Fallback to UTC ISO slice
  }
  return d.toISOString().slice(0, 10);
}

/**
 * Pure deterministic calculation of Invoice Payment Status.
 * Derived strictly from payment records, refund records, and due date.
 */
export function calculateInvoicePaymentStatus(input: PaymentStatusInput): {
  paymentStatus: PaymentStatus;
  netPaidAmount: number;
  remainingBalance: number;
} {
  const total = roundMoney(input.totalAmount);
  const paid = roundMoney(input.paidAmount);
  const refunded = roundMoney(input.refundedAmount);
  const netPaid = roundMoney(Math.max(0, paid - refunded));
  const remaining = roundMoney(Math.max(0, total - netPaid));
  const todayIso = input.nowIso ? input.nowIso.slice(0, 10) : getAlgiersCurrentDateIso();
  const dueIso = (input.dueDateIso || todayIso).slice(0, 10);

  if (refunded > 0 && netPaid === 0 && paid > 0) {
    return { paymentStatus: "REFUNDED", netPaidAmount: netPaid, remainingBalance: 0 };
  }
  if (refunded > 0 && netPaid > 0) {
    return { paymentStatus: "PARTIALLY_REFUNDED", netPaidAmount: netPaid, remainingBalance: remaining };
  }
  if (remaining === 0 && total > 0) {
    return { paymentStatus: "PAID", netPaidAmount: netPaid, remainingBalance: 0 };
  }
  if (remaining > 0 && todayIso > dueIso) {
    return { paymentStatus: "OVERDUE", netPaidAmount: netPaid, remainingBalance: remaining };
  }
  if (netPaid > 0 && remaining > 0) {
    return { paymentStatus: "PARTIALLY_PAID", netPaidAmount: netPaid, remainingBalance: remaining };
  }
  return { paymentStatus: "UNPAID", netPaidAmount: netPaid, remainingBalance: remaining };
}

/**
 * Moving Weighted-Average Cost (Coût Moyen Pondéré - CMP) calculation on purchase receipt.
 */
export function calculateMovingWeightedAverageCost(
  currentOnHandQty: number,
  currentAvgCost: number,
  receivedQty: number,
  receivedUnitCost: number
): number {
  if (receivedQty <= 0) return roundMoney(currentAvgCost);
  const safeCurrentQty = Math.max(0, currentOnHandQty);
  const totalValue = safeCurrentQty * currentAvgCost + receivedQty * receivedUnitCost;
  const newTotalQty = safeCurrentQty + receivedQty;
  if (newTotalQty <= 0) return roundMoney(receivedUnitCost);
  return roundMoney(totalValue / newTotalQty);
}

/**
 * PostgreSQL Transactional Mutations via Drizzle ORM
 */
export const AtelierPostgresRepository = {
  async adjustMaterialStock(input: {
    idempotencyKey: string;
    materialId: string;
    direction: "IN" | "OUT";
    quantity: number;
    reason: string;
  }) {
    return await db.transaction(async (tx) => {
      const [mat] = await tx
        .select()
        .from(schema.materials)
        .where(eq(schema.materials.id, input.materialId));
      if (!mat) throw new Error("Material not found");

      const onHand = Number(mat.onHandQty);
      const reserved = Number(mat.reservedQty);
      const available = roundQty(onHand - reserved);
      const qty = roundQty(input.quantity);

      if (input.direction === "OUT" && qty > available) {
        throw new Error(`Insufficient available stock (${available} ${mat.unit})`);
      }

      const nextOnHand = input.direction === "IN" ? roundQty(onHand + qty) : roundQty(onHand - qty);
      const nextAvailable = roundQty(Math.max(0, nextOnHand - reserved));
      const unitCost = Number(mat.averageCost);

      await tx
        .update(schema.materials)
        .set({
          onHandQty: String(nextOnHand),
          availableQty: String(nextAvailable),
          updatedAt: new Date(),
        })
        .where(eq(schema.materials.id, mat.id));

      const [movement] = await tx
        .insert(schema.materialStockMovements)
        .values({
          idempotencyKey: input.idempotencyKey,
          materialId: mat.id,
          movementType: input.direction === "IN" ? "ADJUSTMENT_IN" : "ADJUSTMENT_OUT",
          direction: input.direction,
          quantity: String(qty),
          unitCost: String(unitCost),
          totalCost: String(roundMoney(qty * unitCost)),
          balanceAfterOnHand: String(nextOnHand),
          balanceAfterAvailable: String(nextAvailable),
          referenceType: "MANUAL_ADJUSTMENT",
          referenceId: `ADJ-${Date.now()}`,
          reason: input.reason,
        })
        .returning();

      return { materialId: mat.id, onHandQty: nextOnHand, availableQty: nextAvailable, movement };
    });
  },

  async updateMaterialDetails(input: {
    id: string;
    sku: string;
    nameAr: string;
    nameFr: string;
    categoryId: string;
    supplierId?: string | null;
    unit: string;
    minStockThreshold: number;
    storageLocation?: string;
    primaryImageUrl?: string;
    description?: string;
  }) {
    return await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(schema.materials)
        .set({
          sku: input.sku,
          nameAr: input.nameAr,
          nameFr: input.nameFr,
          categoryId: input.categoryId,
          supplierId: input.supplierId || null,
          unit: input.unit,
          minStockThreshold: String(roundQty(input.minStockThreshold)),
          storageLocation: input.storageLocation || "Rayon A1",
          primaryImageUrl: input.primaryImageUrl,
          description: input.description,
          updatedAt: new Date(),
        })
        .where(eq(schema.materials.id, input.id))
        .returning();
      if (!updated) throw new Error("Material not found for update");
      return updated;
    });
  },

  async receivePurchaseTransaction(input: {
    idempotencyKey: string;
    supplierId: string;
    paidAmount: number;
    paymentMethod: string;
    notes?: string;
    items: Array<{
      materialId: string;
      orderedQty: number;
      receivedQty: number;
      unitPrice: number;
      discountAmount?: number;
    }>;
  }) {
    return await db.transaction(async (tx) => {
      let subtotal = 0;
      for (const item of input.items) {
        subtotal += roundMoney(item.receivedQty * item.unitPrice - (item.discountAmount || 0));
      }
      const totalAmount = roundMoney(subtotal);
      const paid = roundMoney(Math.min(totalAmount, input.paidAmount));
      const remaining = roundMoney(totalAmount - paid);
      const purchaseNumber = `ACH-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

      const [purchase] = await tx
        .insert(schema.purchases)
        .values({
          idempotencyKey: input.idempotencyKey,
          purchaseNumber,
          supplierId: input.supplierId,
          purchaseDate: new Date(),
          receiptStatus: "RECEIVED",
          paymentStatus: remaining === 0 ? "PAID" : paid > 0 ? "PARTIALLY_PAID" : "UNPAID",
          subtotal: String(subtotal),
          totalAmount: String(totalAmount),
          paidAmount: String(paid),
          remainingAmount: String(remaining),
          notes: input.notes || "",
          receivedAt: new Date(),
        })
        .returning();

      for (const item of input.items) {
        const [mat] = await tx
          .select()
          .from(schema.materials)
          .where(eq(schema.materials.id, item.materialId));
        if (!mat) throw new Error(`Material ${item.materialId} not found`);

        const oldOnHand = Number(mat.onHandQty);
        const oldReserved = Number(mat.reservedQty);
        const oldAvg = Number(mat.averageCost);
        const recQty = roundQty(item.receivedQty);
        const newAvg = calculateMovingWeightedAverageCost(oldOnHand, oldAvg, recQty, item.unitPrice);
        const nextOnHand = roundQty(oldOnHand + recQty);
        const nextAvail = roundQty(Math.max(0, nextOnHand - oldReserved));

        await tx.insert(schema.purchaseItems).values({
          purchaseId: purchase.id,
          materialId: mat.id,
          orderedQty: String(item.orderedQty),
          receivedQty: String(recQty),
          unitPrice: String(item.unitPrice),
          discountAmount: String(item.discountAmount || 0),
          lineTotal: String(roundMoney(recQty * item.unitPrice - (item.discountAmount || 0))),
        });

        await tx
          .update(schema.materials)
          .set({
            onHandQty: String(nextOnHand),
            availableQty: String(nextAvail),
            averageCost: String(newAvg),
            lastPurchaseCost: String(item.unitPrice),
            updatedAt: new Date(),
          })
          .where(eq(schema.materials.id, mat.id));

        await tx.insert(schema.materialStockMovements).values({
          idempotencyKey: `${input.idempotencyKey}-mat-${mat.id}`,
          materialId: mat.id,
          movementType: "PURCHASE_RECEIPT",
          direction: "IN",
          quantity: String(recQty),
          unitCost: String(item.unitPrice),
          totalCost: String(roundMoney(recQty * item.unitPrice)),
          balanceAfterOnHand: String(nextOnHand),
          balanceAfterAvailable: String(nextAvail),
          referenceType: "PURCHASE",
          referenceId: purchaseNumber,
          reason: `Purchase receipt ${purchaseNumber} (New CMP: ${newAvg} DZD)`,
        });
      }

      await tx
        .update(schema.suppliers)
        .set({
          totalPurchases: sql`${schema.suppliers.totalPurchases} + ${totalAmount}`,
          totalPaid: sql`${schema.suppliers.totalPaid} + ${paid}`,
          outstandingBalance: sql`${schema.suppliers.outstandingBalance} + ${remaining}`,
          updatedAt: new Date(),
        })
        .where(eq(schema.suppliers.id, input.supplierId));

      return purchase;
    });
  },
,
  async recordSupplierPaymentTransaction(input: {
    idempotencyKey: string;
    supplierId: string;
    purchaseId?: string | null;
    amount: number;
    paymentMethod: string;
    referenceNumber?: string;
    notes?: string;
  }) {
    return await db.transaction(async (tx) => {
      const amt = roundMoney(input.amount);
      const [payment] = await tx
        .insert(schema.supplierPayments)
        .values({
          idempotencyKey: input.idempotencyKey,
          paymentNumber: `PAIE-FOUR-${Date.now().toString().slice(-5)}`,
          supplierId: input.supplierId,
          purchaseId: input.purchaseId || null,
          amount: String(amt),
          paymentMethod: input.paymentMethod,
          referenceNumber: input.referenceNumber || "",
          notes: input.notes || "",
        })
        .returning();

      await tx
        .update(schema.suppliers)
        .set({
          totalPaid: sql`${schema.suppliers.totalPaid} + ${amt}`,
          outstandingBalance: sql`GREATEST(0, ${schema.suppliers.outstandingBalance} - ${amt})`,
          updatedAt: new Date(),
        })
        .where(eq(schema.suppliers.id, input.supplierId));

      await tx.insert(schema.cashMovements).values({
        idempotencyKey: `cash-${input.idempotencyKey}`,
        movementNumber: `TRES-${Date.now().toString().slice(-5)}`,
        direction: "OUT",
        category: "SUPPLIER_PAYMENT",
        amount: String(amt),
        paymentMethod: input.paymentMethod,
        referenceType: "SUPPLIER_PAYMENT",
        referenceId: payment.id,
        description: input.notes || "Règlement fournisseur / دفعة لمورد",
      });

      return payment;
    });
  },

  async createModelWithBomTransaction(input: {
    code: string;
    nameAr: string;
    nameFr: string;
    categoryId: string;
    laborCost: number;
    overheadCost: number;
    TargetPrice: number;
    sizes: string[];
    colors: string[];
    bomItems: Array<{ materialId: string; quantityPerUnit: number; wastagePercent?: number }>;
  }) {
    return await db.transaction(async (tx) => {
      const [model] = await tx
        .insert(schema.models)
        .values({
          code: input.code,
          nameAr: input.nameAr,
          nameFr: input.nameFr,
          categoryId: input.categoryId,
          defaultLaborCost: String(roundMoney(input.laborCost)),
          defaultOverheadCost: String(roundMoney(input.overheadCost)),
          suggestedSellingPrice: String(roundMoney(input.TargetPrice)),
        })
        .returning();

      const [bom] = await tx
        .insert(schema.billOfMaterials)
        .values({
          modelId: model.id,
          version: "1.0",
          isActive: true,
        })
        .returning();

      for (const item of input.bomItems) {
        await tx.insert(schema.billOfMaterialItems).values({
          bomId: bom.id,
          materialId: item.materialId,
          quantityPerUnit: String(roundQty(item.quantityPerUnit)),
          wastagePercent: String(roundQty(item.wastagePercent || 0)),
        });
      }

      return { model, bomId: bom.id };
    });
  },

  async createProductionOrderTransaction(input: {
    idempotencyKey: string;
    modelId: string;
    targetQty: number;
    sizeLabel: string;
    colorLabel: string;
    laborCostTotal: number;
    overheadCostTotal: number;
    packagingCostTotal?: number;
    assignedArtisan?: string;
    dueDateIso?: string;
  }) {
    return await db.transaction(async (tx) => {
      const orderNumber = `OF-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
      const [order] = await tx
        .insert(schema.productionOrders)
        .values({
          idempotencyKey: input.idempotencyKey,
          orderNumber,
          modelId: input.modelId,
          targetQty: input.targetQty,
          sizeLabel: input.sizeLabel,
          colorLabel: input.colorLabel,
          status: "IN_PROGRESS",
          currentStageCode: "CUTTING",
          laborCostTotal: String(roundMoney(input.laborCostTotal)),
          overheadCostTotal: String(roundMoney(input.overheadCostTotal)),
          packagingCostTotal: String(roundMoney(input.packagingCostTotal || 0)),
          assignedArtisan: input.assignedArtisan || "",
          dueDate: input.dueDateIso ? new Date(input.dueDateIso) : new Date(),
        })
        .returning();
      return order;
    });
  },

  async completeProductionOrderTransaction(input: {
    idempotencyKey: string;
    productionOrderId: string;
    completedQty: number;
    acceptedQty: number;
    rejectedQty: number;
    sellingPriceUnit: number;
    qcInspector?: string;
    qcNotes?: string;
  }) {
    return await db.transaction(async (tx) => {
      const [order] = await tx
        .select()
        .from(schema.productionOrders)
        .where(eq(schema.productionOrders.id, input.productionOrderId));
      if (!order) throw new Error("Production order not found");
      if (input.acceptedQty + input.rejectedQty !== input.completedQty) {
        throw new Error("Accepted + Rejected units must equal Completed units");
      }

      const totalOrderCost = roundMoney(
        Number(order.materialCostTotal || 0) +
          Number(order.laborCostTotal || 0) +
          Number(order.overheadCostTotal || 0) +
          Number(order.packagingCostTotal || 0)
      );
      const unitProductionCost =
        input.acceptedQty > 0 ? roundMoney(totalOrderCost / input.acceptedQty) : 0;

      await tx
        .update(schema.productionOrders)
        .set({
          completedQty: input.completedQty,
          acceptedQty: input.acceptedQty,
          rejectedQty: input.rejectedQty,
          status: "COMPLETED",
          currentStageCode: "COMPLETED",
          totalOrderCost: String(totalOrderCost),
          unitProductionCost: String(unitProductionCost),
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schema.productionOrders.id, order.id));

      await tx.insert(schema.qualityChecks).values({
        productionOrderId: order.id,
        inspectedQty: input.completedQty,
        acceptedQty: input.acceptedQty,
        rejectedQty: input.rejectedQty,
        inspectorName: input.qcInspector || "Atelier QC",
        notes: input.qcNotes || "",
      });

      const [fp] = await tx
        .insert(schema.finishedProducts)
        .values({
          sku: `PF-${order.orderNumber}-${order.sizeLabel}`,
          modelId: order.modelId,
          productionOrderId: order.id,
          nameAr: `منتج جاهز ${order.orderNumber}`,
          nameFr: `Produit Fini ${order.orderNumber}`,
          sizeLabel: order.sizeLabel,
          colorLabel: order.colorLabel,
          onHandQty: input.acceptedQty,
          availableQty: input.acceptedQty,
          unitCost: String(unitProductionCost),
          sellingPrice: String(roundMoney(input.sellingPriceUnit)),
        })
        .returning();

      return { orderId: order.id, finishedProduct: fp, unitProductionCost };
    });
  },

  async completeSaleCheckoutTransaction(input: {
    idempotencyKey: string;
    customerId?: string | null;
    discountAmount?: number;
    taxPercent?: number;
    initialPaymentAmount?: number;
    paymentMethod?: string;
    dueDateIso?: string;
    notes?: string;
    items: Array<{
      finishedProductId: string;
      quantity: number;
      unitPrice: number;
      lineDiscount?: number;
    }>;
  }) {
    return await db.transaction(async (tx) => {
      let subtotal = 0;
      const lineSnapshots: Array<{
        fp: typeof schema.finishedProducts.$inferSelect;
        qty: number;
        unitPrice: number;
        lineDiscount: number;
        lineTotal: number;
      }> = [];

      for (const item of input.items) {
        const [fp] = await tx
          .select()
          .from(schema.finishedProducts)
          .where(eq(schema.finishedProducts.id, item.finishedProductId));
        if (!fp) throw new Error(`Finished product ${item.finishedProductId} not found`);
        if (fp.availableQty < item.quantity) {
          throw new Error(`Insufficient finished stock for ${fp.sku} (available: ${fp.availableQty})`);
        }
        const lineTotal = roundMoney(item.quantity * item.unitPrice - (item.lineDiscount || 0));
        subtotal += lineTotal;
        lineSnapshots.push({
          fp,
          qty: item.quantity,
          unitPrice: roundMoney(item.unitPrice),
          lineDiscount: roundMoney(item.lineDiscount || 0),
          lineTotal,
        });
      }

      const discount = roundMoney(input.discountAmount || 0);
      const taxable = Math.max(0, subtotal - discount);
      const taxAmount = roundMoney(taxable * ((input.taxPercent || 0) / 100));
      const totalAmount = roundMoney(taxable + taxAmount);
      const paidAmount = roundMoney(Math.min(totalAmount, input.initialPaymentAmount || 0));
      const statusCalc = calculateInvoicePaymentStatus({
        totalAmount,
        paidAmount,
        refundedAmount: 0,
        dueDateIso: input.dueDateIso || getAlgiersCurrentDateIso(),
      });

      const saleNumber = `VTE-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
      const invoiceNumber = `FAC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

      const [sale] = await tx
        .insert(schema.sales)
        .values({
          idempotencyKey: input.idempotencyKey,
          saleNumber,
          customerId: input.customerId || null,
          status: "COMPLETED",
          subtotal: String(subtotal),
          discountAmount: String(discount),
          taxAmount: String(taxAmount),
          totalAmount: String(totalAmount),
          notes: input.notes || "",
        })
        .returning();

      const [invoice] = await tx
        .insert(schema.invoices)
        .values({
          idempotencyKey: `inv-${input.idempotencyKey}`,
          invoiceNumber,
          saleId: sale.id,
          customerId: input.customerId || null,
          documentStatus: "ISSUED",
          paymentStatus: statusCalc.paymentStatus,
          issueDate: new Date(),
          dueDate: input.dueDateIso ? new Date(input.dueDateIso) : new Date(),
          subtotal: String(subtotal),
          discountAmount: String(discount),
          taxPercent: String(input.taxPercent || 0),
          taxAmount: String(taxAmount),
          totalAmount: String(totalAmount),
          paidAmount: String(paidAmount),
          refundedAmount: "0.00",
          remainingBalance: String(statusCalc.remainingBalance),
          notes: input.notes || "",
        })
        .returning();

      for (const snap of lineSnapshots) {
        const nextQty = snap.fp.onHandQty - snap.qty;
        await tx
          .update(schema.finishedProducts)
          .set({
            onHandQty: nextQty,
            availableQty: Math.max(0, snap.fp.availableQty - snap.qty),
            updatedAt: new Date(),
          })
          .where(eq(schema.finishedProducts.id, snap.fp.id));

        await tx.insert(schema.invoiceItems).values({
          invoiceId: invoice.id,
          finishedProductId: snap.fp.id,
          snapshotSku: snap.fp.sku,
          snapshotNameAr: snap.fp.nameAr,
          snapshotNameFr: snap.fp.nameFr,
          snapshotSize: snap.fp.sizeLabel,
          snapshotColor: snap.fp.colorLabel,
          quantity: snap.qty,
          unitPrice: String(snap.unitPrice),
          unitCostSnapshot: String(snap.fp.unitCost),
          discountAmount: String(snap.lineDiscount),
          lineTotal: String(snap.lineTotal),
        });
      }

      if (paidAmount > 0) {
        await tx.insert(schema.payments).values({
          idempotencyKey: `pay-${input.idempotencyKey}`,
          paymentNumber: `REG-${Date.now().toString().slice(-5)}`,
          invoiceId: invoice.id,
          customerId: input.customerId || null,
          amount: String(paidAmount),
          paymentMethod: input.paymentMethod || "CASH",
        });
      }

      return { sale, invoice };
    });
  },

  async recordCustomerPaymentTransaction(input: {
    idempotencyKey: string;
    invoiceId: string;
    amount: number;
    paymentMethod: string;
    referenceNumber?: string;
    notes?: string;
  }) {
    return await db.transaction(async (tx) => {
      const [inv] = await tx
        .select()
        .from(schema.invoices)
        .where(eq(schema.invoices.id, input.invoiceId));
      if (!inv) throw new Error("Invoice not found");

      const nextPaid = roundMoney(Number(inv.paidAmount) + input.amount);
      const statusCalc = calculateInvoicePaymentStatus({
        totalAmount: Number(inv.totalAmount),
        paidAmount: nextPaid,
        refundedAmount: Number(inv.refundedAmount),
        dueDateIso: inv.dueDate ? inv.dueDate.toISOString().slice(0, 10) : getAlgiersCurrentDateIso(),
      });

      const [payment] = await tx
        .insert(schema.payments)
        .values({
          idempotencyKey: input.idempotencyKey,
          paymentNumber: `REG-${Date.now().toString().slice(-5)}`,
          invoiceId: inv.id,
          customerId: inv.customerId,
          amount: String(roundMoney(input.amount)),
          paymentMethod: input.paymentMethod,
          referenceNumber: input.referenceNumber || "",
          notes: input.notes || "",
        })
        .returning();

      const [updatedInvoice] = await tx
        .update(schema.invoices)
        .set({
          paidAmount: String(nextPaid),
          remainingBalance: String(statusCalc.remainingBalance),
          paymentStatus: statusCalc.paymentStatus,
          updatedAt: new Date(),
        })
        .where(eq(schema.invoices.id, inv.id))
        .returning();

      return { payment, invoice: updatedInvoice };
    });
  },

  async processRefundTransaction(input: {
    idempotencyKey: string;
    invoiceId: string;
    amount: number;
    paymentMethod: string;
    reason: string;
    restockItems?: Array<{ finishedProductId: string; quantity: number }>;
  }) {
    return await db.transaction(async (tx) => {
      const [inv] = await tx
        .select()
        .from(schema.invoices)
        .where(eq(schema.invoices.id, input.invoiceId));
      if (!inv) throw new Error("Invoice not found");

      const nextRefunded = roundMoney(Number(inv.refundedAmount) + input.amount);
      if (nextRefunded > Number(inv.paidAmount)) {
        throw new Error("Refund amount cannot exceed total paid amount");
      }

      const statusCalc = calculateInvoicePaymentStatus({
        totalAmount: Number(inv.totalAmount),
        paidAmount: Number(inv.paidAmount),
        refundedAmount: nextRefunded,
        dueDateIso: inv.dueDate ? inv.dueDate.toISOString().slice(0, 10) : getAlgiersCurrentDateIso(),
      });

      const [refund] = await tx
        .insert(schema.refunds)
        .values({
          idempotencyKey: input.idempotencyKey,
          refundNumber: `AVO-${Date.now().toString().slice(-5)}`,
          invoiceId: inv.id,
          customerId: inv.customerId,
          amount: String(roundMoney(input.amount)),
          refundMethod: input.paymentMethod,
          reason: input.reason,
          restockedToInventory: Boolean(input.restockItems && input.restockItems.length > 0),
        })
        .returning();

      const [updatedInvoice] = await tx
        .update(schema.invoices)
        .set({
          refundedAmount: String(nextRefunded),
          remainingBalance: String(statusCalc.remainingBalance),
          paymentStatus: statusCalc.paymentStatus,
          updatedAt: new Date(),
        })
        .where(eq(schema.invoices.id, inv.id))
        .returning();

      return { refund, invoice: updatedInvoice };
    });
  },
};
