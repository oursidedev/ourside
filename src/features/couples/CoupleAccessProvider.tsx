"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { coupleService, type CoupleAppState } from "./couple.service";

type Value = { state: CoupleAppState | null; loading: boolean; refresh: () => Promise<void> };
const CoupleAccessContext = createContext<Value | null>(null);

export function CoupleAccessProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CoupleAppState | null>(null);
  const [loading, setLoading] = useState(true);
  async function refresh() { setLoading(true); setState(await coupleService.getAppState()); setLoading(false); }
  useEffect(() => { refresh(); }, []);
  const value = useMemo(() => ({ state, loading, refresh }), [state, loading]);
  return <CoupleAccessContext.Provider value={value}>{children}</CoupleAccessContext.Provider>;
}

export function useCoupleAccess() {
  const context = useContext(CoupleAccessContext);
  if (!context) throw new Error("useCoupleAccess must be used within CoupleAccessProvider");
  return context;
}
