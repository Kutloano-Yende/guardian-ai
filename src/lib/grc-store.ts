// Centralized GRC data store using React context
import { createContext, useContext } from "react";

export type Severity = "critical" | "high" | "medium" | "low";
export type Status = "open" | "in_progress" | "resolved" | "closed";

export interface Asset {
  id: string;
  name: string;
  type: "hardware" | "software" | "human" | "intellectual_property" | "financial";
  department: string;
  owner: string;
  status: "active" | "maintenance" | "retired";
  criticality: Severity;
  location: string;
  lastAuditDate?: string;
  createdAt: string;
}

export interface Risk {
  id: string;
  name: string;
  type: "operational" | "financial" | "compliance" | "strategic";
  assetId?: string;
  probability: number; // 1-5
  impact: number; // 1-5
  mitigationStrategy: string;
  owner: string;
  status: Status;
  regulatoryRef: string;
  createdAt: string;
}

export interface Incident {
  id: string;
  name: string;
  type: string;
  reportedBy: string;
  department: string;
  severity: Severity;
  assetId?: string;
  riskId?: string;
  assignedTo: string;
  status: Status;
  regulatoryImpact: string;
  deadline: string;
  description: string;
  createdAt: string;
}

export interface AuditRecord {
  id: string;
  name: string;
  scope: string;
  type: "internal" | "external" | "regulatory";
  auditor: string;
  startDate: string;
  endDate: string;
  findings: string;
  status: "planned" | "ongoing" | "completed";
  linkedIncidents: string[];
  linkedRisks: string[];
  createdAt: string;
}

export interface ComplianceRecord {
  id: string;
  name: string;
  type: "internal_policy" | "sa_law" | "international_standard";
  department: string;
  owner: string;
  enforcement: string;
  consequences: string;
  lastReviewed: string;
  status: "compliant" | "non_compliant" | "under_review";
  createdAt: string;
}

export interface ActionItem {
  id: string;
  name: string;
  relatedType: "risk" | "incident" | "audit";
  relatedId: string;
  assignedTo: string;
  priority: Severity;
  startDate: string;
  dueDate: string;
  status: Status;
  notes: string;
  estimatedImpactOfDelay: string;
  createdAt: string;
}

export interface PerformanceKPI {
  id: string;
  name: string;
  department: string;
  target: number;
  actual: number;
  unit: string;
  responsible: string;
  status: "on_track" | "at_risk" | "off_track";
  linkedRiskIds: string[];
  createdAt: string;
}

export interface GRCData {
  assets: Asset[];
  risks: Risk[];
  incidents: Incident[];
  audits: AuditRecord[];
  compliance: ComplianceRecord[];
  actions: ActionItem[];
  performance: PerformanceKPI[];
}

export interface GRCContextType {
  data: GRCData;
  addAsset: (a: Omit<Asset, "id" | "createdAt">) => void;
  addRisk: (r: Omit<Risk, "id" | "createdAt">) => void;
  addIncident: (i: Omit<Incident, "id" | "createdAt">) => void;
  addAudit: (a: Omit<AuditRecord, "id" | "createdAt">) => void;
  addCompliance: (c: Omit<ComplianceRecord, "id" | "createdAt">) => void;
  addAction: (a: Omit<ActionItem, "id" | "createdAt">) => void;
  addPerformance: (p: Omit<PerformanceKPI, "id" | "createdAt">) => void;
  updateItem: <T extends keyof GRCData>(collection: T, id: string, updates: Partial<GRCData[T][number]>) => void;
  deleteItem: <T extends keyof GRCData>(collection: T, id: string) => void;
  getLinkedItems: (type: string, id: string) => Record<string, any[]>;
}

export const GRCContext = createContext<GRCContextType | null>(null);

export function useGRC() {
  const ctx = useContext(GRCContext);
  if (!ctx) throw new Error("useGRC must be used within GRCProvider");
  return ctx;
}

export function generateId() {
  return crypto.randomUUID?.() || Math.random().toString(36).slice(2, 11);
}
