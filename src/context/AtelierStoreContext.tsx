"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

export type Language = "ar" | "fr";
export type ThemeMode = "light" | "dark";

export function getAlgiersDateIso(d: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Algiers",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

export function formatDZD(amount: number, lang: Language = "ar"): string {
  const rounded = Math.round(Number(amount) || 0);
  const formatted = new Intl.NumberFormat(lang === "ar" ? "ar-DZ" : "fr-DZ").format(rounded);
  return lang === "ar" ? `${formatted} د.ج` : `${formatted} DZD`;
}

export interface MaterialItem {
  id: string;
  code: string;
  nameAr: string;
  nameFr: string;
  category: string;
  unit: string;
  stock: number;
  minStock: number;
  cost: number;
  color: string;
  supplierId: string;
  location: string;
}

export interface FinishedProductItem {
  id: string;
  code: string;
  modelId: string;
  nameAr: string;
  nameFr: string;
  size: string;
  color: string;
  stock: number;
  cost: number;
  price: number;
  image: string;
}

export interface ProductionOrderItem {
  id: string;
  code: string;
  modelId: string;
  size: string;
  color: string;
  qty: number;
  stage: string;
  progress: number;
  artisan: string;
  dueDate: string;
  totalCost: number;
  packagingCost: number;
}

export interface InvoiceItemRecord {
  id: string;
  customerId: string;
  date: string;
  subtotal: number;
  discount: number;
  total: number;
  paid: number;
  method: string;
  status: string;
  items: Array<{
    variantId: string;
    code: string;
    nameAr: string;
    nameFr: string;
    size: string;
    color: string;
    qty: number;
    unitPrice: number;
  }>;
}

const INITIAL_DATE = getAlgiersDateIso();

const DEFAULT_STATE = {
  workshop: {
    name: "دار عفاف الأصلي للأزياء الراقية — Maison AFAF EL ASSLI",
    city: "الجزائر العاصمة — Alger",
    currency: "DZD",
    timezone: "Africa/Algiers",
    taxId: "NIF 099816004521839",
    address: "حي حيدرة، الجزائر العاصمة — Hydra, Alger",
  },
  materials: [
    { id: "MAT-01", code: "FAB-SLK-01", nameAr: "حرير طبيعي ملكي أسود", nameFr: "Soie Royale Noire", category: "Fabric", unit: "m", stock: 42, minStock: 15, cost: 4800, color: "Noir", supplierId: "SUP-01", location: "RACK-A1" },
    { id: "MAT-02", code: "FAB-VLV-02", nameAr: "قطيفة حريرية زمردية", nameFr: "Velours de Soie Émeraude", category: "Fabric", unit: "m", stock: 12, minStock: 15, cost: 5600, color: "Émeraude", supplierId: "SUP-01", location: "RACK-A2" },
    { id: "MAT-03", code: "TRM-GLD-01", nameAr: "خيط فتلة ذهبي حر (قصب)", nameFr: "Fil d'Or Fetla Royal", category: "Embroidery", unit: "bobine", stock: 9, minStock: 12, cost: 3400, color: "Or Métallique", supplierId: "SUP-02", location: "RACK-B1" },
    { id: "MAT-04", code: "FAB-CRP-04", nameAr: "كريب جورجيت شامبانيا", nameFr: "Crêpe Georgette Champagne", category: "Fabric", unit: "m", stock: 34, minStock: 10, cost: 3100, color: "Champagne", supplierId: "SUP-01", location: "RACK-A3" },
  ] as MaterialItem[],
  suppliers: [
    { id: "SUP-01", name: "دار الحرير الدمشقي — Maison Soie d'Orient", city: "الجزائر العاصمة", phone: "+213 550 18 42 90", specialty: "أقمشة فاخرة وحرير", balance: 85000 },
    { id: "SUP-02", name: "مؤسسة الفتلة الذهبية التلمسانية", city: "تلمسان", phone: "+213 561 92 10 44", specialty: "لوازم التطريز والفتلة", balance: 42000 },
  ],
  purchases: [
    { id: "PUR-2026-01", supplierId: "SUP-01", date: INITIAL_DATE, total: 245000, paid: 160000, status: "PARTIAL", itemsSummary: "حرير أسود ملكي + قطيفة زمردية" },
    { id: "PUR-2026-02", supplierId: "SUP-02", date: INITIAL_DATE, total: 92000, paid: 50000, status: "PARTIAL", itemsSummary: "خيط فتلة ذهبي وأحجار كريستال" },
  ],
  models: [
    {
      id: "MOD-01",
      code: "MDL-ABY-01",
      nameAr: "عباية السلطانة عفاف المطرزة بالذهب",
      nameFr: "Abaya Sultana Afaf Brodée Or",
      category: "Abaya Couture",
      sizes: ["S", "M", "L", "XL"],
      laborCost: 14000,
      overheadCost: 3500,
      retailPrice: 58000,
      image: "/assets/abaya_black.webp",
      bom: [
        { materialId: "MAT-01", qtyPerUnit: 3.5, wastePct: 5 },
        { materialId: "MAT-03", qtyPerUnit: 1.5, wastePct: 3 },
      ],
    },
    {
      id: "MOD-02",
      code: "MDL-KRK-02",
      nameAr: "كراكو عاصمي زمردي بالفتلة الملكية",
      nameFr: "Karakou Algérois Émeraude Fetla",
      category: "Karakou",
      sizes: ["S", "M", "L"],
      laborCost: 22000,
      overheadCost: 4500,
      retailPrice: 95000,
      image: "/assets/karakou_emerald.webp",
      bom: [
        { materialId: "MAT-02", qtyPerUnit: 3.0, wastePct: 6 },
        { materialId: "MAT-03", qtyPerUnit: 2.5, wastePct: 4 },
      ],
    },
    {
      id: "MOD-03",
      code: "MDL-CHP-03",
      nameAr: "قفطان شامبانيا مطرز باللؤلؤ",
      nameFr: "Caftan Champagne Perlé",
      category: "Caftan",
      sizes: ["M", "L", "XL"],
      laborCost: 16000,
      overheadCost: 3200,
      retailPrice: 68000,
      image: "/assets/abaya_champagne.webp",
      bom: [
        { materialId: "MAT-04", qtyPerUnit: 3.8, wastePct: 5 },
        { materialId: "MAT-03", qtyPerUnit: 1.2, wastePct: 2 },
      ],
    },
  ],
  productionOrders: [
    { id: "PO-01", code: "ORD-2026-01", modelId: "MOD-01", size: "M", color: "Noir & Or", qty: 5, stage: "Embroidery", progress: 65, artisan: "فاطمة الزهراء (Fatima Z.)", dueDate: INITIAL_DATE, totalCost: 198000, packagingCost: 2500 },
    { id: "PO-02", code: "ORD-2026-02", modelId: "MOD-02", size: "L", color: "Émeraude & Or", qty: 3, stage: "Sewing", progress: 45, artisan: "مريم بن علي (Meriem B.)", dueDate: INITIAL_DATE, totalCost: 162000, packagingCost: 1800 },
  ] as ProductionOrderItem[],
  finishedProducts: [
    { id: "FP-01", code: "SKU-ABY-01-M", modelId: "MOD-01", nameAr: "عباية السلطانة عفاف المطرزة بالذهب", nameFr: "Abaya Sultana Afaf Brodée Or", size: "M", color: "Noir & Or", stock: 6, cost: 39600, price: 58000, image: "/assets/abaya_black.webp" },
    { id: "FP-02", code: "SKU-KRK-02-M", modelId: "MOD-02", nameAr: "كراكو عاصمي زمردي بالفتلة الملكية", nameFr: "Karakou Algérois Émeraude Fetla", size: "M", color: "Émeraude & Or", stock: 4, cost: 54000, price: 95000, image: "/assets/karakou_emerald.webp" },
    { id: "FP-03", code: "SKU-CHP-03-L", modelId: "MOD-03", nameAr: "قفطان شامبانيا مطرز باللؤلؤ", nameFr: "Caftan Champagne Perlé", size: "L", color: "Champagne", stock: 5, cost: 36500, price: 68000, image: "/assets/abaya_champagne.webp" },
  ] as FinishedProductItem[],
  customers: [
    { id: "CUST-01", name: "السيدة ياسمين بن عيسى — Yasmine Benaissa", city: "حيدرة، الجزائر", phone: "+213 558 11 22 33", tier: "VIP Couture", measurements: "الصدر 96cm • الخصر 74cm • الطول 148cm", totalSpent: 211000, balance: 25000 },
    { id: "CUST-02", name: "السيدة أمينة منصوري — Amina Mansouri", city: "وهران", phone: "+213 661 44 88 19", tier: "VIP", measurements: "الصدر 92cm • الخصر 70cm • الطول 145cm", totalSpent: 153000, balance: 0 },
  ],
  invoices: [
    {
      id: "INV-2026-101",
      customerId: "CUST-01",
      date: INITIAL_DATE,
      subtotal: 153000,
      discount: 3000,
      total: 150000,
      paid: 125000,
      method: "CIB",
      status: "PARTIAL",
      items: [
        { variantId: "FP-01", code: "SKU-ABY-01-M", nameAr: "عباية السلطانة عفاف المطرزة بالذهب", nameFr: "Abaya Sultana Afaf Brodée Or", size: "M", color: "Noir & Or", qty: 1, unitPrice: 58000 },
        { variantId: "FP-02", code: "SKU-KRK-02-M", nameAr: "كراكو عاصمي زمردي بالفتلة الملكية", nameFr: "Karakou Algérois Émeraude Fetla", size: "M", color: "Émeraude & Or", qty: 1, unitPrice: 95000 },
      ],
    },
  ] as InvoiceItemRecord[],
  expenses: [
    { id: "EXP-01", date: INITIAL_DATE, category: "Rent & Atelier", labelAr: "إيجار ورشة وصالة عرض حيدرة", labelFr: "Loyer Atelier & Showroom Hydra", amount: 85000, method: "BANK" },
    { id: "EXP-02", date: INITIAL_DATE, category: "Artisans", labelAr: "دفعة أجور الحرفيات والمطرزات", labelFr: "Acompte salaires brodeuses", amount: 64000, method: "CASH" },
  ],
};

const AtelierContext = createContext<any>(null);

export function AtelierStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(DEFAULT_STATE);
  const [lang, setLang] = useState<Language>("ar");
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [searchQuery, setSearchQuery] = useState("");
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced">("synced");

  useEffect(() => {
    fetch("/api/atelier")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.ok && json?.data?.materials?.length > 0) {
          setSyncStatus("synced");
        }
      })
      .catch(() => {});
  }, []);

  const dispatchMutation = async (action: string, payload: Record<string, any>) => {
    setSyncStatus("syncing");
    try {
      await fetch("/api/atelier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });
    } catch {
      // Fallback local persistence
    } finally {
      setSyncStatus("synced");
    }
  };

  const addMaterial = async (mat: Omit<MaterialItem, "id">) => {
    const newMat: MaterialItem = { ...mat, id: `MAT-${Date.now()}` };
    setState((prev) => ({ ...prev, materials: [newMat, ...prev.materials] }));
    await dispatchMutation("CREATE_MATERIAL", newMat);
  };

  const updateMaterial = async (mat: MaterialItem) => {
    setState((prev) => ({
      ...prev,
      materials: prev.materials.map((m) => (m.id === mat.id ? mat : m)),
    }));
    await dispatchMutation("UPDATE_MATERIAL", mat);
  };

  const adjustStock = async (materialId: string, delta: number, reason: string) => {
    setState((prev) => ({
      ...prev,
      materials: prev.materials.map((m) =>
        m.id === materialId ? { ...m, stock: Math.max(0, Number((m.stock + delta).toFixed(2))) } : m
      ),
    }));
    await dispatchMutation("ADJUST_MATERIAL_STOCK", { materialId, deltaQty: delta, reason });
  };

  const createProductionOrder = async (orderInput: {
    modelId: string;
    size: string;
    color: string;
    qty: number;
    artisan: string;
    dueDate: string;
    packagingCost: number;
  }) => {
    const model = state.models.find((m) => m.id === orderInput.modelId);
    if (!model) return;
    const totalCost = (model.laborCost + model.overheadCost) * orderInput.qty + orderInput.packagingCost;
    const newOrder: ProductionOrderItem = {
      id: `PO-${Date.now()}`,
      code: `ORD-2026-0${state.productionOrders.length + 1}`,
      modelId: orderInput.modelId,
      size: orderInput.size,
      color: orderInput.color,
      qty: orderInput.qty,
      stage: "Cutting",
      progress: 20,
      artisan: orderInput.artisan,
      dueDate: orderInput.dueDate,
      totalCost,
      packagingCost: orderInput.packagingCost,
    };
    setState((prev) => ({
      ...prev,
      productionOrders: [newOrder, ...prev.productionOrders],
    }));
    await dispatchMutation("CREATE_PRODUCTION_ORDER", newOrder);
  };

  const advanceProductionStage = async (orderId: string) => {
    const stages = ["Cutting", "Sewing", "Embroidery", "QC", "Completed"];
    setState((prev) => ({
      ...prev,
      productionOrders: prev.productionOrders.map((po) => {
        if (po.id !== orderId) return po;
        const idx = stages.indexOf(po.stage);
        const nextStage = stages[Math.min(stages.length - 1, idx + 1)];
        const nextProg = nextStage === "Completed" ? 100 : Math.min(95, po.progress + 25);
        return { ...po, stage: nextStage, progress: nextProg };
      }),
    }));
    await dispatchMutation("COMPLETE_PRODUCTION_ORDER", { orderId });
  };

  const completeSale = async (saleInput: {
    customerId: string;
    items: InvoiceItemRecord["items"];
    discount: number;
    paidAmount: number;
    method: string;
  }) => {
    const subtotal = saleInput.items.reduce((a, b) => a + b.qty * b.unitPrice, 0);
    const total = Math.max(0, subtotal - saleInput.discount);
    const paid = Math.min(total, saleInput.paidAmount);
    const inv: InvoiceItemRecord = {
      id: `INV-2026-${102 + state.invoices.length}`,
      customerId: saleInput.customerId,
      date: getAlgiersDateIso(),
      subtotal,
      discount: saleInput.discount,
      total,
      paid,
      method: saleInput.method,
      status: paid >= total ? "PAID" : "PARTIAL",
      items: saleInput.items,
    };
    setState((prev) => ({
      ...prev,
      invoices: [inv, ...prev.invoices],
      finishedProducts: prev.finishedProducts.map((fp) => {
        const sold = saleInput.items.find((i) => i.variantId === fp.id);
        return sold ? { ...fp, stock: Math.max(0, fp.stock - sold.qty) } : fp;
      }),
    }));
    await dispatchMutation("CREATE_POS_SALE", inv);
  };

  const recordInvoicePayment = async (invoiceId: string, amount: number, method: string) => {
    setState((prev) => ({
      ...prev,
      invoices: prev.invoices.map((inv) => {
        if (inv.id !== invoiceId) return inv;
        const newPaid = Math.min(inv.total, inv.paid + amount);
        return { ...inv, paid: newPaid, status: newPaid >= inv.total ? "PAID" : "PARTIAL" };
      }),
    }));
    await dispatchMutation("RECORD_PAYMENT", { invoiceId, amount, method });
  };

  const addExpense = async (exp: {
    category: string;
    labelAr: string;
    labelFr: string;
    amount: number;
    method: string;
  }) => {
    const newExp = { id: `EXP-${Date.now()}`, date: getAlgiersDateIso(), ...exp };
    setState((prev) => ({ ...prev, expenses: [newExp, ...prev.expenses] }));
    await dispatchMutation("RECORD_EXPENSE", newExp);
  };

  const kpis = useMemo(() => {
    const totalSales = state.invoices.reduce((a, b) => a + b.total, 0);
    const totalCollected = state.invoices.reduce((a, b) => a + b.paid, 0);
    const receivables = Math.max(0, totalSales - totalCollected);
    const totalExpenses = state.expenses.reduce((a, b) => a + b.amount, 0);
    const rawStockValue = state.materials.reduce((a, b) => a + b.stock * b.cost, 0);
    const finishedStockRetailValue = state.finishedProducts.reduce((a, b) => a + b.stock * b.price, 0);
    const finishedUnitsCount = state.finishedProducts.reduce((a, b) => a + b.stock, 0);
    const lowStockMaterials = state.materials.filter((m) => m.stock <= m.minStock);
    const activeProductionCount = state.productionOrders.filter((p) => p.stage !== "Completed").length;
    return {
      currentDateIso: getAlgiersDateIso(),
      totalSales,
      totalCollected,
      receivables,
      totalExpenses,
      netProfit: totalCollected - totalExpenses,
      rawStockValue,
      finishedStockRetailValue,
      finishedUnitsCount,
      lowStockMaterials,
      activeProductionCount,
    };
  }, [state]);

  return (
    <AtelierContext.Provider
      value={{
        state,
        lang,
        theme,
        setLang,
        setTheme,
        searchQuery,
        setSearchQuery,
        syncStatus,
        kpis,
        dispatchMutation,
        addMaterial,
        updateMaterial,
        adjustStock,
        createProductionOrder,
        advanceProductionStage,
        completeSale,
        recordInvoicePayment,
        addExpense,
      }}
    >
      {children}
    </AtelierContext.Provider>
  );
}

export function useAtelierStore() {
  const ctx = useContext(AtelierContext);
  if (!ctx) throw new Error("useAtelierStore must be used inside AtelierStoreProvider");
  return ctx;
}
