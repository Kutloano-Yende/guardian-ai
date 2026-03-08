import { useGRC } from "@/lib/grc-store";
import { StatCard } from "@/components/ui/stat-card";
import { SeverityBadge, StatusBadge } from "@/components/ui/severity-badge";
import {
  Box, AlertTriangle, FileWarning, ClipboardCheck, Shield, ListTodo, BarChart3, TrendingUp, Clock
} from "lucide-react";

export default function Dashboard() {
  const { data } = useGRC();

  const openIncidents = data.incidents.filter((i) => i.status === "open" || i.status === "in_progress");
  const criticalRisks = data.risks.filter((r) => r.probability * r.impact >= 15);
  const overdueActions = data.actions.filter(
    (a) => a.status !== "resolved" && a.status !== "closed" && new Date(a.dueDate) < new Date()
  );
  const nonCompliant = data.compliance.filter((c) => c.status === "non_compliant");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Welcome back</h1>
        <p className="text-muted-foreground mt-1">Here's your GRC overview for today</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Assets" value={data.assets.length} icon={Box} color="primary" subtitle="Tracked & managed" />
        <StatCard title="Open Risks" value={data.risks.filter((r) => r.status === "open").length} icon={AlertTriangle} color="severity-high" subtitle={`${criticalRisks.length} critical`} />
        <StatCard title="Active Incidents" value={openIncidents.length} icon={FileWarning} color="destructive" subtitle="Requires attention" />
        <StatCard title="Compliance Score" value={data.compliance.length ? `${Math.round(((data.compliance.length - nonCompliant.length) / data.compliance.length) * 100)}%` : "N/A"} icon={Shield} color="secondary" subtitle={`${nonCompliant.length} non-compliant`} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pending Audits" value={data.audits.filter((a) => a.status === "planned").length} icon={ClipboardCheck} color="primary" />
        <StatCard title="Overdue Actions" value={overdueActions.length} icon={ListTodo} color="severity-high" />
        <StatCard title="KPIs Tracked" value={data.performance.length} icon={BarChart3} color="secondary" />
        <StatCard title="At-Risk KPIs" value={data.performance.filter((p) => p.status === "at_risk" || p.status === "off_track").length} icon={TrendingUp} color="severity-medium" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileWarning className="w-4 h-4 text-destructive" /> Recent Incidents
          </h3>
          {data.incidents.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No incidents recorded yet. Add incidents in the Incidents module.</p>
          ) : (
            <div className="space-y-3">
              {data.incidents.slice(-5).reverse().map((inc) => (
                <div key={inc.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.2)" }}>
                  <div>
                    <p className="text-sm font-medium text-foreground">{inc.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {new Date(inc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={inc.severity} />
                    <StatusBadge status={inc.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-5">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-severity-high" /> Top Risks
          </h3>
          {data.risks.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No risks registered yet. Add risks in the Risk Management module.</p>
          ) : (
            <div className="space-y-3">
              {data.risks.sort((a, b) => b.probability * b.impact - a.probability * a.impact).slice(0, 5).map((risk) => (
                <div key={risk.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.2)" }}>
                  <div>
                    <p className="text-sm font-medium text-foreground">{risk.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Score: {risk.probability * risk.impact} ({risk.type})</p>
                  </div>
                  <StatusBadge status={risk.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
