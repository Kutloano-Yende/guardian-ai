import { useState } from "react";
import { useGRC, AuditRecord } from "@/lib/grc-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatCard } from "@/components/ui/stat-card";
import { Plus, ClipboardCheck, CalendarClock, CheckCircle2, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";

const GlassTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs font-medium text-white shadow-lg"
      style={{ background: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(8px)" }}>
      {payload[0].name}: {payload[0].value}
    </div>
  );
};

export default function AuditsPage() {
  const { data, addAudit } = useGRC();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", scope: "", type: "internal" as AuditRecord["type"], auditor: "", startDate: "", endDate: "", findings: "", status: "planned" as AuditRecord["status"], linkedIncidents: [] as string[], linkedRisks: [] as string[] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAudit(form);
    setForm({ name: "", scope: "", type: "internal", auditor: "", startDate: "", endDate: "", findings: "", status: "planned", linkedIncidents: [], linkedRisks: [] });
    setOpen(false);
  };

  const audits = data.audits;
  const planned = audits.filter((a) => a.status === "planned");
  const ongoing = audits.filter((a) => a.status === "ongoing");
  const completed = audits.filter((a) => a.status === "completed");

  const statusData = [
    { name: "Planned", value: planned.length, color: "hsl(25, 90%, 55%)" },
    { name: "Ongoing", value: ongoing.length, color: "hsl(211, 65%, 45%)" },
    { name: "Completed", value: completed.length, color: "hsl(165, 45%, 45%)" },
  ].filter((d) => d.value > 0);

  const typeData = [
    { name: "Internal", value: audits.filter((a) => a.type === "internal").length, color: "hsl(211, 65%, 45%)" },
    { name: "External", value: audits.filter((a) => a.type === "external").length, color: "hsl(165, 45%, 45%)" },
    { name: "Regulatory", value: audits.filter((a) => a.type === "regulatory").length, color: "hsl(25, 90%, 55%)" },
  ].filter((d) => d.value > 0);

  const statusColors: Record<string, string> = { planned: "text-status-open", ongoing: "text-status-progress", completed: "text-status-resolved" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Audit Management</h1>
          <p className="text-muted-foreground mt-1">Plan, execute, and record audits</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="glass-btn-primary w-auto px-4 py-2"><Plus className="w-4 h-4 mr-2" /> Schedule Audit</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="font-display">New Audit</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Audit Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Type</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as AuditRecord["type"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="internal">Internal</SelectItem><SelectItem value="external">External</SelectItem><SelectItem value="regulatory">Regulatory</SelectItem></SelectContent></Select></div>
                <div><Label>Scope</Label><Input required value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} /></div>
                <div><Label>Auditor</Label><Input required value={form.auditor} onChange={(e) => setForm({ ...form, auditor: e.target.value })} /></div>
                <div><Label>Start Date</Label><Input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
                <div><Label>End Date</Label><Input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
              </div>
              <div><Label>Findings / Notes</Label><Textarea value={form.findings} onChange={(e) => setForm({ ...form, findings: e.target.value })} /></div>
              <button type="submit" className="glass-btn-primary">Create Audit</button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Module Dashboard */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Audits" value={audits.length} icon={ClipboardCheck} color="primary" subtitle="All scheduled" />
        <StatCard title="Planned" value={planned.length} icon={CalendarClock} color="severity-medium" subtitle="Upcoming" />
        <StatCard title="Ongoing" value={ongoing.length} icon={Loader2} color="primary" subtitle="In execution" />
        <StatCard title="Completed" value={completed.length} icon={CheckCircle2} color="secondary" subtitle={`${audits.length > 0 ? Math.round((completed.length / audits.length) * 100) : 0}% completion`} />
      </motion.div>

      {audits.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
            <h3 className="font-display font-semibold text-foreground mb-4">Audit Status</h3>
            <div className="relative h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" animationDuration={800}>
                  {statusData.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                </Pie><Tooltip content={<GlassTooltip />} /></PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-foreground">{audits.length}</span>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {statusData.map((s) => (<div key={s.name} className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} /><span className="text-[11px] text-muted-foreground">{s.name}</span></div>))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5">
            <h3 className="font-display font-semibold text-foreground mb-4">By Type</h3>
            <div className="relative h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={typeData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" animationDuration={800}>
                  {typeData.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                </Pie><Tooltip content={<GlassTooltip />} /></PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {typeData.map((s) => (<div key={s.name} className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} /><span className="text-[11px] text-muted-foreground">{s.name}</span></div>))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Audit Cards */}
      {audits.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <ClipboardCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display font-semibold text-foreground">No audits scheduled</h3>
          <p className="text-muted-foreground text-sm mt-1">Schedule your first audit to begin tracking compliance</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {audits.map((a) => (
            <div key={a.id} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display font-semibold text-foreground text-sm">{a.name}</h3>
                <span className={`text-xs font-semibold capitalize ${statusColors[a.status]}`}>{a.status}</span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Type: <span className="capitalize">{a.type}</span></p>
                <p>Scope: {a.scope}</p>
                <p>Auditor: {a.auditor}</p>
                <p>{new Date(a.startDate).toLocaleDateString()} — {new Date(a.endDate).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
