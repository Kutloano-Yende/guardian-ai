import { useState } from "react";
import { useGRC, Incident } from "@/lib/grc-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SeverityBadge, StatusBadge } from "@/components/ui/severity-badge";
import { StatCard } from "@/components/ui/stat-card";
import { Plus, FileWarning, Clock, AlertOctagon, CheckCircle2, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { PieChart, Pie, Cell as PieCell } from "recharts";
import { motion } from "framer-motion";

const incidentTypes = ["Data Breach", "Equipment Failure", "Safety Violation", "Policy Violation", "System Outage", "Environmental", "Fraud", "Other"];

const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs font-medium text-white shadow-lg"
      style={{ background: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(8px)" }}>
      {label || payload[0].name}: {payload[0].value}
    </div>
  );
};

export default function IncidentsPage() {
  const { data, addIncident } = useGRC();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", type: "Other", reportedBy: "", department: "", severity: "medium" as Incident["severity"],
    assetId: "", riskId: "", assignedTo: "", status: "open" as Incident["status"],
    regulatoryImpact: "", deadline: "", description: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addIncident({ ...form, assetId: form.assetId || undefined, riskId: form.riskId || undefined });
    setForm({ name: "", type: "Other", reportedBy: "", department: "", severity: "medium", assetId: "", riskId: "", assignedTo: "", status: "open", regulatoryImpact: "", deadline: "", description: "" });
    setOpen(false);
  };

  const incidents = data.incidents;
  const openInc = incidents.filter((i) => i.status === "open");
  const inProgress = incidents.filter((i) => i.status === "in_progress");
  const resolved = incidents.filter((i) => i.status === "resolved" || i.status === "closed");
  const overdue = incidents.filter((i) => i.deadline && new Date(i.deadline) < new Date() && i.status !== "resolved" && i.status !== "closed");

  const sevData = [
    { severity: "Critical", count: incidents.filter((i) => i.severity === "critical").length, fill: "hsl(0, 75%, 55%)" },
    { severity: "High", count: incidents.filter((i) => i.severity === "high").length, fill: "hsl(25, 90%, 55%)" },
    { severity: "Medium", count: incidents.filter((i) => i.severity === "medium").length, fill: "hsl(40, 95%, 50%)" },
    { severity: "Low", count: incidents.filter((i) => i.severity === "low").length, fill: "hsl(165, 45%, 45%)" },
  ];

  const statusData = [
    { name: "Open", value: openInc.length, color: "hsl(25, 90%, 55%)" },
    { name: "In Progress", value: inProgress.length, color: "hsl(211, 65%, 45%)" },
    { name: "Resolved", value: resolved.length, color: "hsl(165, 45%, 45%)" },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Incident Management</h1>
          <p className="text-muted-foreground mt-1">Capture, track, and resolve incidents in real-time</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="glass-btn-primary w-auto px-4 py-2"><Plus className="w-4 h-4 mr-2" /> Report Incident</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-display">Report Incident</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Incident Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Type</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{incidentTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Reported By</Label><Input required value={form.reportedBy} onChange={(e) => setForm({ ...form, reportedBy: e.target.value })} /></div>
                <div><Label>Department</Label><Input required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
                <div><Label>Severity</Label><Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v as Incident["severity"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent></Select></div>
                <div><Label>Assigned To</Label><Input required value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} /></div>
                <div><Label>Linked Asset</Label><Select value={form.assetId} onValueChange={(v) => setForm({ ...form, assetId: v })}><SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger><SelectContent>{data.assets.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Linked Risk</Label><Select value={form.riskId} onValueChange={(v) => setForm({ ...form, riskId: v })}><SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger><SelectContent>{data.risks.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Resolution Deadline</Label><Input type="date" required value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
              </div>
              <div><Label>Regulatory Impact</Label><Input placeholder="e.g., POPIA violation, possible fine R50,000" value={form.regulatoryImpact} onChange={(e) => setForm({ ...form, regulatoryImpact: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <button type="submit" className="glass-btn-primary">Submit Incident</button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Module Dashboard */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Incidents" value={incidents.length} icon={FileWarning} color="primary" subtitle="All reported" />
        <StatCard title="Open" value={openInc.length} icon={AlertOctagon} color="severity-high" subtitle={`${inProgress.length} in progress`} />
        <StatCard title="Resolved" value={resolved.length} icon={CheckCircle2} color="secondary" subtitle={`${incidents.length > 0 ? Math.round((resolved.length / incidents.length) * 100) : 0}% resolved`} />
        <StatCard title="Overdue" value={overdue.length} icon={Timer} color="destructive" subtitle="Past deadline" />
      </motion.div>

      {incidents.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
            <h3 className="font-display font-semibold text-foreground mb-4">By Severity</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sevData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="severity" tick={{ fontSize: 11, fill: "hsl(215, 12%, 50%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(215, 12%, 50%)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<GlassTooltip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={800}>
                    {sevData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5">
            <h3 className="font-display font-semibold text-foreground mb-4">Status Breakdown</h3>
            <div className="relative h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" animationDuration={800}>
                    {statusData.map((e, i) => <PieCell key={i} fill={e.color} stroke="transparent" />)}
                  </Pie>
                  <Tooltip content={<GlassTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <span className="text-2xl font-bold text-foreground">{incidents.length}</span>
                  <br /><span className="text-[10px] text-muted-foreground">Total</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {statusData.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="text-[11px] text-muted-foreground">{s.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Data Table */}
      {incidents.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FileWarning className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display font-semibold text-foreground">No incidents reported</h3>
          <p className="text-muted-foreground text-sm mt-1">Report incidents as they occur to track and resolve them</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full glass-table">
            <thead><tr className="border-b" style={{ borderColor: "var(--glass-border)" }}><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Incident</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Type</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Severity</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Assigned To</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Deadline</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th></tr></thead>
            <tbody>
              {incidents.map((inc) => (
                <tr key={inc.id} className="border-b last:border-0 transition-colors" style={{ borderColor: "var(--glass-border)" }}>
                  <td className="px-4 py-3"><p className="text-sm font-medium text-foreground">{inc.name}</p><p className="text-xs text-muted-foreground">{inc.department}</p></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{inc.type}</td>
                  <td className="px-4 py-3"><SeverityBadge severity={inc.severity} /></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{inc.assignedTo}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{inc.deadline ? new Date(inc.deadline).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={inc.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
