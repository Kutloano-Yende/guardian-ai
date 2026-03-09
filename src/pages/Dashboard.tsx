import { useGRC } from "@/lib/grc-store";
import { StatCard } from "@/components/ui/stat-card";
import { SeverityBadge, StatusBadge } from "@/components/ui/severity-badge";
import { RiskHeatMap } from "@/components/charts/RiskHeatMap";
import { ComplianceDonut } from "@/components/charts/ComplianceDonut";
import { RiskTrendChart } from "@/components/charts/RiskTrendChart";
import { IncidentBarChart } from "@/components/charts/IncidentBarChart";
import { ProactiveAlertsWidget } from "@/components/ProactiveAlertsWidget";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Box, AlertTriangle, FileWarning, ClipboardCheck, Shield, ListTodo, BarChart3, TrendingUp,
  Clock, CheckCircle2, Users, GraduationCap, FileText, Target
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs font-medium text-white shadow-lg"
      style={{ background: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(8px)" }}>
      {label || payload[0].name}: {payload[0].value}
    </div>
  );
};

export default function Dashboard() {
  const { data } = useGRC();

  const openIncidents = data.incidents.filter((i) => i.status === "open" || i.status === "in_progress");
  const criticalRisks = data.risks.filter((r) => r.probability * r.impact >= 15);
  const overdueActions = data.actions.filter(
    (a) => a.status !== "resolved" && a.status !== "closed" && new Date(a.dueDate) < new Date()
  );
  const nonCompliant = data.compliance.filter((c) => c.status === "non_compliant");
  const completedAudits = data.audits.filter((a) => a.status === "completed");
  const onTrackKPIs = data.performance.filter((p) => p.status === "on_track");
  const resolvedActions = data.actions.filter((a) => a.status === "resolved" || a.status === "closed");

  // Asset type distribution
  const assetTypeData = Object.entries(
    data.assets.reduce((acc, a) => { acc[a.type] = (acc[a.type] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({
    name: name.replace("_", " "),
    value,
    color: { hardware: "hsl(211, 65%, 45%)", software: "hsl(165, 45%, 45%)", human: "hsl(25, 90%, 55%)", intellectual_property: "hsl(270, 50%, 55%)", financial: "hsl(40, 95%, 50%)" }[name] || "hsl(211, 65%, 45%)",
  }));

  // Action priority data
  const actionPriorityData = [
    { name: "Critical", value: data.actions.filter((a) => a.priority === "critical").length, color: "hsl(0, 75%, 55%)" },
    { name: "High", value: data.actions.filter((a) => a.priority === "high").length, color: "hsl(25, 90%, 55%)" },
    { name: "Medium", value: data.actions.filter((a) => a.priority === "medium").length, color: "hsl(40, 95%, 50%)" },
    { name: "Low", value: data.actions.filter((a) => a.priority === "low").length, color: "hsl(165, 45%, 45%)" },
  ].filter((d) => d.value > 0);

  // Audit status
  const auditStatusData = [
    { name: "Planned", value: data.audits.filter((a) => a.status === "planned").length, color: "hsl(25, 90%, 55%)" },
    { name: "Ongoing", value: data.audits.filter((a) => a.status === "ongoing").length, color: "hsl(211, 65%, 45%)" },
    { name: "Completed", value: data.audits.filter((a) => a.status === "completed").length, color: "hsl(165, 45%, 45%)" },
  ].filter((d) => d.value > 0);

  // KPI performance
  const kpiData = data.performance.slice(0, 6).map((k) => ({
    name: k.name.length > 10 ? k.name.slice(0, 10) + "…" : k.name,
    pct: k.target > 0 ? Math.round(Math.min((k.actual / k.target) * 100, 100)) : 0,
    fill: k.status === "on_track" ? "hsl(165, 45%, 45%)" : k.status === "at_risk" ? "hsl(40, 95%, 50%)" : "hsl(0, 75%, 55%)",
  }));

  // Training
  const trainingCourses = [
    { title: "POPIA Compliance", progress: 75 },
    { title: "OHS Act", progress: 60 },
    { title: "Incident Reporting", progress: 90 },
    { title: "Risk Assessment", progress: 45 },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-display font-bold text-foreground">System Dashboard</h1>
        <p className="text-muted-foreground mt-1">Comprehensive GRC overview — every corner of the system at a glance</p>
      </motion.div>

      {/* Row 1: Core KPIs */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <motion.div variants={fadeUp}><StatCard title="Assets" value={data.assets.length} icon={Box} color="primary" /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="Open Risks" value={data.risks.filter((r) => r.status === "open").length} icon={AlertTriangle} color="severity-high" subtitle={`${criticalRisks.length} critical`} /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="Incidents" value={openIncidents.length} icon={FileWarning} color="destructive" subtitle="Active" /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="Compliance" value={data.compliance.length ? `${Math.round(((data.compliance.length - nonCompliant.length) / data.compliance.length) * 100)}%` : "N/A"} icon={Shield} color="secondary" /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="Actions" value={data.actions.length} icon={ListTodo} color="primary" subtitle={`${overdueActions.length} overdue`} /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="KPIs" value={data.performance.length} icon={BarChart3} color="secondary" subtitle={`${onTrackKPIs.length} on track`} /></motion.div>
      </motion.div>

      {/* Row 2: Secondary KPIs */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <motion.div variants={fadeUp}><StatCard title="Audits" value={data.audits.length} icon={ClipboardCheck} color="primary" subtitle={`${completedAudits.length} done`} /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="Non-Compliant" value={nonCompliant.length} icon={Shield} color="destructive" /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="Resolved Actions" value={resolvedActions.length} icon={CheckCircle2} color="secondary" /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="Unique Owners" value={new Set([...data.assets.map((a) => a.owner), ...data.risks.map((r) => r.owner)]).size} icon={Users} color="primary" /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="Policies" value={data.compliance.length} icon={FileText} color="primary" /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="Training" value="6" icon={GraduationCap} color="secondary" subtitle="Active courses" /></motion.div>
      </motion.div>

      {/* Row 3: AI Proactive Alerts + Risk Heat Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProactiveAlertsWidget />
        <div className="lg:col-span-2">
          <RiskHeatMap risks={data.risks} />
        </div>
      </div>

      {/* Row 4: Compliance Donut + Risk Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComplianceDonut records={data.compliance} />
        <RiskTrendChart risks={data.risks} />
      </div>

      {/* Row 4: Risk Trend + Incident Severity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskTrendChart risks={data.risks} />
        <IncidentBarChart incidents={data.incidents} />
      </div>

      {/* Row 5: Asset Distribution + Action Priorities + Audit Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset types */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Box className="w-4 h-4 text-primary" /> Asset Distribution
          </h3>
          {assetTypeData.length === 0 ? (
            <p className="text-muted-foreground text-sm py-6 text-center">No assets yet</p>
          ) : (
            <>
              <div className="relative h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={assetTypeData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value" animationDuration={800}>
                    {assetTypeData.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                  </Pie><Tooltip content={<GlassTooltip />} /></PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-foreground">{data.assets.length}</span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {assetTypeData.map((t) => (<div key={t.name} className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: t.color }} /><span className="text-[10px] text-muted-foreground capitalize">{t.name}</span></div>))}
              </div>
            </>
          )}
        </motion.div>

        {/* Action priorities */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-severity-high" /> Action Priorities
          </h3>
          {actionPriorityData.length === 0 ? (
            <p className="text-muted-foreground text-sm py-6 text-center">No actions yet</p>
          ) : (
            <>
              <div className="relative h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={actionPriorityData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value" animationDuration={800}>
                    {actionPriorityData.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                  </Pie><Tooltip content={<GlassTooltip />} /></PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-foreground">{data.actions.length}</span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {actionPriorityData.map((p) => (<div key={p.name} className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: p.color }} /><span className="text-[10px] text-muted-foreground">{p.name}</span></div>))}
              </div>
            </>
          )}
        </motion.div>

        {/* Audit status */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-primary" /> Audit Pipeline
          </h3>
          {auditStatusData.length === 0 ? (
            <p className="text-muted-foreground text-sm py-6 text-center">No audits yet</p>
          ) : (
            <>
              <div className="relative h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={auditStatusData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value" animationDuration={800}>
                    {auditStatusData.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                  </Pie><Tooltip content={<GlassTooltip />} /></PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-foreground">{data.audits.length}</span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {auditStatusData.map((s) => (<div key={s.name} className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: s.color }} /><span className="text-[10px] text-muted-foreground">{s.name}</span></div>))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Row 6: KPI Performance + Training Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-5">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-secondary" /> KPI Performance
          </h3>
          {kpiData.length === 0 ? (
            <p className="text-muted-foreground text-sm py-6 text-center">No KPIs tracked yet</p>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpiData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215, 12%, 50%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(215, 12%, 50%)" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip content={<GlassTooltip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                  <Bar dataKey="pct" radius={[6, 6, 0, 0]} animationDuration={800}>
                    {kpiData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-secondary" /> Training Progress
          </h3>
          <div className="space-y-4">
            {trainingCourses.map((c) => (
              <div key={c.title}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-foreground font-medium">{c.title}</span>
                  <span className="text-muted-foreground">{c.progress}%</span>
                </div>
                <Progress value={c.progress} className="h-2" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 7: Recent activity lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card p-5">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileWarning className="w-4 h-4 text-destructive" /> Recent Incidents
          </h3>
          {data.incidents.length === 0 ? (
            <p className="text-muted-foreground text-sm py-6 text-center">No incidents recorded</p>
          ) : (
            <div className="space-y-3">
              {data.incidents.slice(-5).reverse().map((inc) => (
                <div key={inc.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <div>
                    <p className="text-sm font-medium text-foreground">{inc.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> {new Date(inc.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={inc.severity} />
                    <StatusBadge status={inc.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-5">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-severity-high" /> Top Risks
          </h3>
          {data.risks.length === 0 ? (
            <p className="text-muted-foreground text-sm py-6 text-center">No risks registered</p>
          ) : (
            <div className="space-y-3">
              {[...data.risks].sort((a, b) => b.probability * b.impact - a.probability * a.impact).slice(0, 5).map((risk) => (
                <div key={risk.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <div>
                    <p className="text-sm font-medium text-foreground">{risk.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Score: {risk.probability * risk.impact} ({risk.type})</p>
                  </div>
                  <StatusBadge status={risk.status} />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
