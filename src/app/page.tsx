import React from "react";
import { AtelierStoreProvider } from "@/context/AtelierStoreContext";
import AtelierAppShell from "@/components/AtelierAppShell";

export default function AtelierDashboardPage() {
  return (
    <AtelierStoreProvider>
      <AtelierAppShell />
    </AtelierStoreProvider>
  );
}
