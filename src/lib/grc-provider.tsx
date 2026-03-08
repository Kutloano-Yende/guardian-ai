import { useState, useCallback, ReactNode } from "react";
import { GRCContext, GRCData, GRCContextType, generateId } from "./grc-store";

const STORAGE_KEY = "grc-data";

function loadData(): GRCData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { assets: [], risks: [], incidents: [], audits: [], compliance: [], actions: [], performance: [] };
}

function saveData(data: GRCData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function GRCProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<GRCData>(loadData);

  const update = useCallback((fn: (d: GRCData) => GRCData) => {
    setData((prev) => {
      const next = fn(prev);
      saveData(next);
      return next;
    });
  }, []);

  const addAsset: GRCContextType["addAsset"] = useCallback((a) => {
    update((d) => ({ ...d, assets: [...d.assets, { ...a, id: generateId(), createdAt: new Date().toISOString() }] }));
  }, [update]);

  const addRisk: GRCContextType["addRisk"] = useCallback((r) => {
    update((d) => ({ ...d, risks: [...d.risks, { ...r, id: generateId(), createdAt: new Date().toISOString() }] }));
  }, [update]);

  const addIncident: GRCContextType["addIncident"] = useCallback((i) => {
    update((d) => ({ ...d, incidents: [...d.incidents, { ...i, id: generateId(), createdAt: new Date().toISOString() }] }));
  }, [update]);

  const addAudit: GRCContextType["addAudit"] = useCallback((a) => {
    update((d) => ({ ...d, audits: [...d.audits, { ...a, id: generateId(), createdAt: new Date().toISOString() }] }));
  }, [update]);

  const addCompliance: GRCContextType["addCompliance"] = useCallback((c) => {
    update((d) => ({ ...d, compliance: [...d.compliance, { ...c, id: generateId(), createdAt: new Date().toISOString() }] }));
  }, [update]);

  const addAction: GRCContextType["addAction"] = useCallback((a) => {
    update((d) => ({ ...d, actions: [...d.actions, { ...a, id: generateId(), createdAt: new Date().toISOString() }] }));
  }, [update]);

  const addPerformance: GRCContextType["addPerformance"] = useCallback((p) => {
    update((d) => ({ ...d, performance: [...d.performance, { ...p, id: generateId(), createdAt: new Date().toISOString() }] }));
  }, [update]);

  const updateItem: GRCContextType["updateItem"] = useCallback((collection, id, updates) => {
    update((d) => ({
      ...d,
      [collection]: (d[collection] as any[]).map((item: any) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  }, [update]);

  const getLinkedItems: GRCContextType["getLinkedItems"] = useCallback((type, id) => {
    const linked: Record<string, any[]> = {};
    if (type === "asset") {
      linked.risks = data.risks.filter((r) => r.assetId === id);
      linked.incidents = data.incidents.filter((i) => i.assetId === id);
    } else if (type === "risk") {
      linked.incidents = data.incidents.filter((i) => i.riskId === id);
      linked.actions = data.actions.filter((a) => a.relatedType === "risk" && a.relatedId === id);
    } else if (type === "incident") {
      linked.actions = data.actions.filter((a) => a.relatedType === "incident" && a.relatedId === id);
    }
    return linked;
  }, [data]);

  return (
    <GRCContext.Provider value={{ data, addAsset, addRisk, addIncident, addAudit, addCompliance, addAction, addPerformance, updateItem, getLinkedItems }}>
      {children}
    </GRCContext.Provider>
  );
}
