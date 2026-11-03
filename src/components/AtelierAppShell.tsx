"use client";

import React, { useState, useMemo } from "react";
import { useAtelierStore, formatDZD } from "@/context/AtelierStoreContext";
import { LucideIcon, LucideIconName } from "@/components/icons/LucideIcons";
import { BlurText } from "@/components/react-bits/BlurText";
import { SpotlightCard } from "@/components/react-bits/SpotlightCard";
import { CountUp } from "@/components/react-bits/CountUp";
import { AtelierSelectiveSmoothScroll } from "@/components/motion/AtelierMotionSystem";

type ModuleKey =
  | "dashboard"
  | "inventory"
  | "purchases"
  | "suppliers"
  | "models"
  | "production"
  | "finished"
  | "pos"
  | "invoices"
  | "payments"
  | "customers"
  | "finance"
  | "reports"
  | "settings";

interface NavItem {
  key: ModuleKey;
  icon: LucideIconName;
  ar: string;
  fr: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", icon: "LayoutDashboard", ar: "لوحة القيادة", fr: "Tableau de bord" },
  { key: "inventory", icon: "Boxes", ar: "المخزون والمواد", fr: "Stock & Matières" },
  { key: "purchases", icon: "ShoppingBasket", ar: "المشتريات", fr: "Achats Matières" },
  { key: "suppliers", icon: "Truck", ar: "الموردون", fr: "Fournisseurs" },
  { key: "models", icon: "Shirt", ar: "الموديلات و BOM", fr: "Modèles & BOM" },
  { key: "production", icon: "Factory", ar: "أوامر الإنتاج", fr: "Ordres Production" },
  { key: "finished", icon: "PackageCheck", ar: "المنتجات الجاهزة", fr: "Produits Finis" },
  { key: "pos", icon: "ShoppingCart", ar: "نقطة البيع POS", fr: "Point de Vente" },
  { key: "invoices", icon: "FileText", ar: "الفواتير", fr: "Factures" },
  { key: "payments", icon: "Wallet", ar: "المدفوعات والمرتجعات", fr: "Paiements & Retours" },
  { key: "customers", icon: "Users", ar: "الزبائن ودفتر القياسات", fr: "Clients & Mesures" },
  { key: "finance", icon: "ChartNoAxesCombined", ar: "المالية والمصاريف", fr: "Finance & Charges" },
  { key: "reports", icon: "ChartPie", ar: "التقارير والتحليلات", fr: "Rapports & Analyses" },
  { key: "settings", icon: "Settings2", ar: "الإعدادات والنظام", fr: "Paramètres" },
];

export default function AtelierAppShell() {
  const {
    state,
    lang,
    theme,
    setLang,
    setTheme,
    searchQuery,
    setSearchQuery,
    syncStatus,
    kpis,
    addMaterial,
    updateMaterial,
    adjustStock,
    createProductionOrder,
    advanceProductionStage,
    completeSale,
    recordInvoicePayment,
    addExpense,
  } = useAtelierStore();

  const [activeTab, setActiveTab] = useState<ModuleKey>("dashboard");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [posCart, setPosCart] = useState<
    Array<{ variantId: string; code: string; nameAr: string; nameFr: string; size: string; color: string; qty: number; unitPrice: number }>
  >([]);
  const [posCustomerId, setPosCustomerId] = useState<string>("CUST-01");
  const [posDiscount, setPosDiscount] = useState<number>(0);
  const [posMethod, setPosMethod] = useState<string>("CASH");

  const [editMaterialModal, setEditMaterialModal] = useState<any>(null);
  const [previewInvoiceId, setPreviewInvoiceId] = useState<string | null>(null);
  const [printFormat, setPrintFormat] = useState<"a4" | "thermal">("a4");

  const isAr = lang === "ar";
  const t = (ar: string, fr: string) => (isAr ? ar : fr);

  const filteredMaterials = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return state.materials;
    return state.materials.filter(
      (m: any) =>
        m.code.toLowerCase().includes(q) ||
        m.nameAr.toLowerCase().includes(q) ||
        m.nameFr.toLowerCase().includes(q)
    );
  }, [state.materials, searchQuery]);

  const filteredFinished = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return state.finishedProducts;
    return state.finishedProducts.filter(
      (f: any) =>
        f.code.toLowerCase().includes(q) ||
        f.nameAr.toLowerCase().includes(q) ||
        f.nameFr.toLowerCase().includes(q)
    );
  }, [state.finishedProducts, searchQuery]);

  const addToPosCart = (fp: any) => {
    if (fp.stock <= 0) return;
    setPosCart((prev) => {
      const existing = prev.find((i) => i.variantId === fp.id);
      if (existing) {
        if (existing.qty >= fp.stock) return prev;
        return prev.map((i) => (i.variantId === fp.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [
        ...prev,
        {
          variantId: fp.id,
          code: fp.code,
          nameAr: fp.nameAr,
          nameFr: fp.nameFr,
          size: fp.size,
          color: fp.color,
          qty: 1,
          unitPrice: fp.price,
        },
      ];
    });
  };

  const posSubtotal = posCart.reduce((acc, item) => acc + item.qty * item.unitPrice, 0);
  const posNetTotal = Math.max(0, posSubtotal - posDiscount);

  const handleCheckoutPos = async () => {
    if (posCart.length === 0) return;
    await completeSale({
      customerId: posCustomerId,
      items: posCart,
      discount: posDiscount,
      paidAmount: posNetTotal,
      method: posMethod,
    });
    setPosCart([]);
    setPosDiscount(0);
    setActiveTab("invoices");
  };

  const activeNav = NAV_ITEMS.find((n) => n.key === activeTab) || NAV_ITEMS[0];

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className={`min-h-screen flex flex-col md:flex-row ${
        theme === "dark" ? "bg-[#0B0B0D] text-[#F5F2EB]" : "bg-[#FAF7F2] text-[#141416]"
      }`}
    >
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 md:hidden"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 z-50 h-screen flex flex-col bg-[#0F0F12] text-[#F5F2EB] border-e border-[#C8A45D]/20 transition-all shrink-0 ${
          sidebarCollapsed ? "md:w-20" : "md:w-64 lg:w-72"
        } ${
          mobileDrawerOpen
            ? "translate-x-0 w-72"
            : isAr
            ? "translate-x-full md:translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 border-b border-[#C8A45D]/20 flex items-center justify-between bg-[#09090B]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-11 h-11 rounded-lg bg-[#09090B] border border-[#C8A45D]/45 flex items-center justify-center shrink-0 overflow-hidden">
              <img src="/assets/logo_afaf.webp" alt="AFAF EL ASSLI" className="w-9 h-9 object-contain" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="text-sm font-bold tracking-wider text-[#C8A45D] truncate">AFAF EL ASSLI</div>
                <div className="text-[11px] text-[#9E988E] truncate">
                  {t("دار الأزياء الراقية • ATELIER OS", "Haute Couture • ATELIER OS")}
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSidebarCollapsed((c) => !c)}
            className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg text-[#9E988E] hover:text-[#C8A45D]"
          >
            <LucideIcon name="Menu" size={17} />
          </button>
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(false)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[#9E988E]"
          >
            <LucideIcon name="X" size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setActiveTab(item.key);
                  setMobileDrawerOpen(false);
                }}
                className={`w-full min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#C8A45D]/15 text-[#E5C882] border border-[#C8A45D]/40"
                    : "text-[#C4BEB4] hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                <LucideIcon name={item.icon} size={18} className={isActive ? "text-[#C8A45D]" : "text-[#8E887E]"} />
                {!sidebarCollapsed && <span className="truncate">{isAr ? item.ar : item.fr}</span>}
              </button>
            );
          })}
        </nav>

        {!sidebarCollapsed && (
          <div className="p-3.5 border-t border-[#C8A45D]/15 bg-[#09090B]/90 text-[11px] text-[#9E988E] flex items-center justify-between">
            <span>{syncStatus === "syncing" ? t("جاري الحفظ...", "Sync...") : "PostgreSQL / Active"}</span>
            <span className="font-mono text-[#C8A45D]">{kpis.currentDateIso}</span>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        <header
          className={`sticky top-0 z-30 border-b px-4 lg:px-6 py-3 flex flex-wrap items-center justify-between gap-3 ${
            theme === "dark" ? "bg-[#121216]/90 border-white/10" : "bg-white/90 border-[#E6DFD3]"
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-[#C8A45D]/30 text-[#C8A45D]"
            >
              <LucideIcon name="Menu" size={20} />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <LucideIcon name={activeNav.icon} size={20} className="text-[#9E772F]" />
                <BlurText text={isAr ? activeNav.ar : activeNav.fr} />
              </h1>
              <p className="text-xs opacity-70 hidden sm:block">
                {state.workshop.name} — {state.workshop.city}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("بحث بالكود أو الاسم...", "Rechercher code, nom...")}
              className="hidden sm:block px-3 py-2 rounded-xl text-xs border border-[#C8A45D]/30 bg-transparent"
            />
            <button
              type="button"
              onClick={() => setLang(isAr ? "fr" : "ar")}
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold border border-[#C8A45D]/40 text-[#9E772F] flex items-center gap-1.5"
            >
              <LucideIcon name="Languages" size={16} />
              <span>{isAr ? "FR" : "عربي"}</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="min-w-[44px] min-h-[44px] px-2.5 py-2 rounded-xl text-xs border border-[#C8A45D]/30 flex items-center justify-center"
            >
              <LucideIcon name={theme === "dark" ? "Sun" : "Moon"} size={17} />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pos")}
              className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#9E772F] text-white flex items-center gap-1.5"
            >
              <LucideIcon name="ShoppingCart" size={15} />
              <span className="hidden lg:inline">{t("نقطة البيع POS", "Vente POS")}</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 space-y-6 max-w-[1600px] w-full mx-auto">
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <SpotlightCard className="p-4 rounded-2xl border border-[#C8A45D]/25">
                <div className="text-xs opacity-75 mb-1">{t("إجمالي المبيعات", "Chiffre d'Affaires")}</div>
                <div className="text-xl font-bold font-mono"><CountUp value={kpis.totalSales} formatter={(v) => formatDZD(v, lang)} /></div>
              </SpotlightCard>
              <SpotlightCard className="p-4 rounded-2xl border border-[#C8A45D]/25">
                <div className="text-xs opacity-75 mb-1">{t("صافي التدفق النقدي", "Trésorerie Nette")}</div>
                <div className="text-xl font-bold font-mono"><CountUp value={kpis.netProfit} formatter={(v) => formatDZD(v, lang)} /></div>
              </SpotlightCard>
              <SpotlightCard className="p-4 rounded-2xl border border-[#C8A45D]/25">
                <div className="text-xs opacity-75 mb-1">{t("قيمة المخزون", "Valeur du Stock")}</div>
                <div className="text-xl font-bold font-mono"><CountUp value={kpis.rawStockValue + kpis.finishedStockRetailValue} formatter={(v) => formatDZD(v, lang)} /></div>
              </SpotlightCard>
              <SpotlightCard className="p-4 rounded-2xl border border-[#C8A45D]/25">
                <div className="text-xs opacity-75 mb-1">{t("أوامر الإنتاج النشطة", "Ordres Actifs")}</div>
                <div className="text-xl font-bold"><CountUp value={kpis.activeProductionCount} /></div>
              </SpotlightCard>
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="space-y-4">
              <div className="hidden md:block rounded-2xl border border-[#C8A45D]/25 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b border-[#C8A45D]/20">
                    <tr>
                      <th className="p-3 text-start">{t("الكود", "Code")}</th>
                      <th className="p-3 text-start">{t("المادة", "Désignation")}</th>
                      <th className="p-3 text-start">{t("الكمية", "Stock")}</th>
                      <th className="p-3 text-start">{t("التكلفة", "Coût")}</th>
                      <th className="p-3 text-end">{t("الإجراءات", "Actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMaterials.map((m: any) => (
                      <tr key={m.id} className="border-t border-[#C8A45D]/10">
                        <td className="p-3 font-mono text-[#9E772F]">{m.code}</td>
                        <td className="p-3 font-semibold">{isAr ? m.nameAr : m.nameFr}</td>
                        <td className="p-3 font-mono">{m.stock} {m.unit}</td>
                        <td className="p-3 font-mono">{formatDZD(m.cost, lang)}</td>
                        <td className="p-3 text-end space-x-1">
                          <button type="button" onClick={() => setEditMaterialModal(m)} className="p-2 rounded-lg border border-[#C8A45D]/30">
                            <LucideIcon name="Pencil" size={14} />
                          </button>
                          <button type="button" onClick={() => adjustStock(m.id, 5, "Entrée stock")} className="p-2 rounded-lg border border-emerald-500/30 text-emerald-600">
                            <LucideIcon name="ArrowDownToLine" size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {filteredMaterials.map((m: any) => (
                  <div key={m.id} className="p-4 rounded-2xl border border-[#C8A45D]/25 flex justify-between items-center">
                    <div>
                      <div className="text-xs font-mono text-[#9E772F]">{m.code}</div>
                      <div className="text-sm font-bold">{isAr ? m.nameAr : m.nameFr}</div>
                      <div className="text-xs font-mono">{m.stock} {m.unit} • {formatDZD(m.cost, lang)}</div>
                    </div>
                    <button type="button" onClick={() => setEditMaterialModal(m)} className="min-h-[44px] px-3 rounded-xl border border-[#C8A45D]/40 text-xs">
                      {t("تعديل", "Éditer")}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "pos" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredFinished.map((fp: any) => (
                  <div key={fp.id} className="p-4 rounded-2xl border border-[#C8A45D]/25 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-mono text-[#9E772F]">{fp.code}</div>
                      <div className="text-sm font-bold">{isAr ? fp.nameAr : fp.nameFr}</div>
                      <div className="text-xs font-mono">{formatDZD(fp.price, lang)}</div>
                    </div>
                    <button type="button" onClick={() => addToPosCart(fp)} className="min-w-[44px] min-h-[44px] rounded-xl bg-[#9E772F] text-white flex items-center justify-center">
                      <LucideIcon name="Plus" size={18} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="p-5 rounded-2xl border border-[#C8A45D]/25 space-y-4">
                <h2 className="text-sm font-bold">{t("سلة المبيعات POS", "Panier POS")}</h2>
                <div className="text-sm font-mono font-bold">{formatDZD(posNetTotal, lang)}</div>
                <button type="button" onClick={handleCheckoutPos} disabled={posCart.length === 0} className="w-full min-h-[44px] rounded-xl bg-[#9E772F] text-white text-xs font-bold disabled:opacity-40">
                  {t("تأكيد البيع وإصدار الفاتورة", "Valider la Vente")}
                </button>
              </div>
            </div>
          )}

          {activeTab !== "dashboard" && activeTab !== "inventory" && activeTab !== "pos" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.invoices.map((inv: any) => (
                <div key={inv.id} className="p-4 rounded-2xl border border-[#C8A45D]/25 space-y-2">
                  <div className="flex justify-between font-mono text-xs">
                    <span className="font-bold text-[#9E772F]">{inv.id}</span>
                    <span>{inv.date}</span>
                  </div>
                  <div className="text-sm font-bold">{formatDZD(inv.total, lang)}</div>
                  <button type="button" onClick={() => setPreviewInvoiceId(inv.id)} className="min-h-[40px] px-3 py-1.5 rounded-xl border border-[#C8A45D]/40 text-xs flex items-center gap-1.5">
                    <LucideIcon name="Printer" size={14} />
                    <span>{t("معاينة / PDF", "Aperçu / PDF")}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#0F0F12] text-[#F5F2EB] border-t border-[#C8A45D]/30 grid grid-cols-5 h-16 px-1">
        {(["dashboard", "inventory", "production", "pos", "invoices"] as ModuleKey[]).map((key) => {
          const item = NAV_ITEMS.find((n) => n.key === key)!;
          return (
            <button key={key} type="button" onClick={() => setActiveTab(key)} className="flex flex-col items-center justify-center gap-1 text-[10px]">
              <LucideIcon name={item.icon} size={18} />
              <span className="truncate">{isAr ? item.ar : item.fr}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
