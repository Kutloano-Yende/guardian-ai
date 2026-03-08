import { useState, useCallback, useEffect, ReactNode } from "react";
import { GRCContext, GRCData, GRCContextType } from "./grc-store";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";

const EMPTY_DATA: GRCData = { assets: [], risks: [], incidents: [], audits: [], compliance: [], actions: [], performance: [] };

// Map DB snake_case rows to camelCase app types
function mapAsset(r: any) {
  return { id: r.id, name: r.name, type: r.type, department: r.department, owner: r.owner, status: r.status, criticality: r.criticality, location: r.location, lastAuditDate: r.last_audit_date, createdAt: r.created_at };
}
function mapRisk(r: any) {
  return { id: r.id, name: r.name, type: r.type, assetId: r.asset_id, probability: r.probability, impact: r.impact, mitigationStrategy: r.mitigation_strategy, owner: r.owner, status: r.status, regulatoryRef: r.regulatory_ref, createdAt: r.created_at };
}
function mapIncident(r: any) {
  return { id: r.id, name: r.name, type: r.type, reportedBy: r.reported_by, department: r.department, severity: r.severity, assetId: r.asset_id, riskId: r.risk_id, assignedTo: r.assigned_to, status: r.status, regulatoryImpact: r.regulatory_impact, deadline: r.deadline, description: r.description, createdAt: r.created_at };
}
function mapAudit(r: any) {
  return { id: r.id, name: r.name, scope: r.scope, type: r.type, auditor: r.auditor, startDate: r.start_date, endDate: r.end_date, findings: r.findings, status: r.status, linkedIncidents: r.linked_incidents || [], linkedRisks: r.linked_risks || [], createdAt: r.created_at };
}
function mapCompliance(r: any) {
  return { id: r.id, name: r.name, type: r.type, department: r.department, owner: r.owner, enforcement: r.enforcement, consequences: r.consequences, lastReviewed: r.last_reviewed, status: r.status, createdAt: r.created_at };
}
function mapAction(r: any) {
  return { id: r.id, name: r.name, relatedType: r.related_type, relatedId: r.related_id, assignedTo: r.assigned_to, priority: r.priority, startDate: r.start_date, dueDate: r.due_date, status: r.status, notes: r.notes, estimatedImpactOfDelay: r.estimated_impact_of_delay, createdAt: r.created_at };
}
function mapPerformance(r: any) {
  return { id: r.id, name: r.name, department: r.department, target: Number(r.target), actual: Number(r.actual), unit: r.unit, responsible: r.responsible, status: r.status, linkedRiskIds: r.linked_risk_ids || [], createdAt: r.created_at };
}

export function GRCProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = useState<GRCData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);

  // Fetch all data on mount / user change
  useEffect(() => {
    if (!user) { setData(EMPTY_DATA); setLoading(false); return; }
    let cancelled = false;
    async function fetchAll() {
      setLoading(true);
      const [assets, risks, incidents, audits, compliance, actions, performance] = await Promise.all([
        supabase.from("assets").select("*").order("created_at", { ascending: false }),
        supabase.from("risks").select("*").order("created_at", { ascending: false }),
        supabase.from("incidents").select("*").order("created_at", { ascending: false }),
        supabase.from("audits").select("*").order("created_at", { ascending: false }),
        supabase.from("compliance").select("*").order("created_at", { ascending: false }),
        supabase.from("actions").select("*").order("created_at", { ascending: false }),
        supabase.from("performance").select("*").order("created_at", { ascending: false }),
      ]);
      if (cancelled) return;
      setData({
        assets: (assets.data || []).map(mapAsset),
        risks: (risks.data || []).map(mapRisk),
        incidents: (incidents.data || []).map(mapIncident),
        audits: (audits.data || []).map(mapAudit),
        compliance: (compliance.data || []).map(mapCompliance),
        actions: (actions.data || []).map(mapAction),
        performance: (performance.data || []).map(mapPerformance),
      });
      setLoading(false);
    }
    fetchAll();
    return () => { cancelled = true; };
  }, [user]);

  const addAsset: GRCContextType["addAsset"] = useCallback(async (a) => {
    if (!user) return;
    const { data: row, error } = await supabase.from("assets").insert({ user_id: user.id, name: a.name, type: a.type, department: a.department, owner: a.owner, status: a.status, criticality: a.criticality, location: a.location, last_audit_date: a.lastAuditDate || null }).select().single();
    if (error) { toast.error("Failed to add asset"); return; }
    setData((prev) => ({ ...prev, assets: [mapAsset(row), ...prev.assets] }));
  }, [user]);

  const addRisk: GRCContextType["addRisk"] = useCallback(async (r) => {
    if (!user) return;
    const { data: row, error } = await supabase.from("risks").insert({ user_id: user.id, name: r.name, type: r.type, asset_id: r.assetId || null, probability: r.probability, impact: r.impact, mitigation_strategy: r.mitigationStrategy, owner: r.owner, status: r.status, regulatory_ref: r.regulatoryRef }).select().single();
    if (error) { toast.error("Failed to add risk"); return; }
    setData((prev) => ({ ...prev, risks: [mapRisk(row), ...prev.risks] }));
  }, [user]);

  const addIncident: GRCContextType["addIncident"] = useCallback(async (i) => {
    if (!user) return;
    const { data: row, error } = await supabase.from("incidents").insert({ user_id: user.id, name: i.name, type: i.type, reported_by: i.reportedBy, department: i.department, severity: i.severity, asset_id: i.assetId || null, risk_id: i.riskId || null, assigned_to: i.assignedTo, status: i.status, regulatory_impact: i.regulatoryImpact, deadline: i.deadline, description: i.description }).select().single();
    if (error) { toast.error("Failed to add incident"); return; }
    setData((prev) => ({ ...prev, incidents: [mapIncident(row), ...prev.incidents] }));
  }, [user]);

  const addAudit: GRCContextType["addAudit"] = useCallback(async (a) => {
    if (!user) return;
    const { data: row, error } = await supabase.from("audits").insert({ user_id: user.id, name: a.name, scope: a.scope, type: a.type, auditor: a.auditor, start_date: a.startDate, end_date: a.endDate, findings: a.findings, status: a.status, linked_incidents: a.linkedIncidents, linked_risks: a.linkedRisks }).select().single();
    if (error) { toast.error("Failed to add audit"); return; }
    setData((prev) => ({ ...prev, audits: [mapAudit(row), ...prev.audits] }));
  }, [user]);

  const addCompliance: GRCContextType["addCompliance"] = useCallback(async (c) => {
    if (!user) return;
    const { data: row, error } = await supabase.from("compliance").insert({ user_id: user.id, name: c.name, type: c.type, department: c.department, owner: c.owner, enforcement: c.enforcement, consequences: c.consequences, last_reviewed: c.lastReviewed, status: c.status }).select().single();
    if (error) { toast.error("Failed to add compliance record"); return; }
    setData((prev) => ({ ...prev, compliance: [mapCompliance(row), ...prev.compliance] }));
  }, [user]);

  const addAction: GRCContextType["addAction"] = useCallback(async (a) => {
    if (!user) return;
    const { data: row, error } = await supabase.from("actions").insert({ user_id: user.id, name: a.name, related_type: a.relatedType, related_id: a.relatedId, assigned_to: a.assignedTo, priority: a.priority, start_date: a.startDate, due_date: a.dueDate, status: a.status, notes: a.notes, estimated_impact_of_delay: a.estimatedImpactOfDelay }).select().single();
    if (error) { toast.error("Failed to add action"); return; }
    setData((prev) => ({ ...prev, actions: [mapAction(row), ...prev.actions] }));
  }, [user]);

  const addPerformance: GRCContextType["addPerformance"] = useCallback(async (p) => {
    if (!user) return;
    const { data: row, error } = await supabase.from("performance").insert({ user_id: user.id, name: p.name, department: p.department, target: p.target, actual: p.actual, unit: p.unit, responsible: p.responsible, status: p.status, linked_risk_ids: p.linkedRiskIds }).select().single();
    if (error) { toast.error("Failed to add KPI"); return; }
    setData((prev) => ({ ...prev, performance: [mapPerformance(row), ...prev.performance] }));
  }, [user]);

  const updateItem: GRCContextType["updateItem"] = useCallback(async (collection, id, updates) => {
    if (!user) return;
    // Convert camelCase updates to snake_case for DB
    const snakeUpdates: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates as any)) {
      const snakeKey = key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
      snakeUpdates[snakeKey] = value;
    }
    const { error } = await (supabase.from(collection as any) as any).update(snakeUpdates).eq("id", id);
    if (error) { toast.error("Failed to update"); return; }
    setData((prev) => ({
      ...prev,
      [collection]: (prev[collection] as any[]).map((item: any) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  }, [user]);

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
