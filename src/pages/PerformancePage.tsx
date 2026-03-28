import { useState } from "react";
import { useGRC, PerformanceKPI } from "@/lib/grc-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatCard } from "@/components/ui/stat-card";
import { Plus, BarChart3, Target, TrendingUp, AlertTriangle, MoreHorizontal, Pencil, Archive, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { motion } from "framer-motion";

const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (<div className="rounded-xl px-3 py-2 text-xs font-medium text-white shadow-lg" style={{ background: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(8px)" }}>{label}: {payload[0].value}%</div>);
};

const DEFAULT_FORM = { name: "", department: "", target: 100, actual: 0, unit: "%", responsible: "", status: "on_track" as PerformanceKPI["status"], linkedRiskIds: [] as string[] };

export default function PerformancePage() {
  const { data, addPerformance, updateItem, deleteItem } = useGRC();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PerformanceKPI | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  const handleOpenChange = (v: boolean) => { setOpen(v); if (!v) { setEditingId(null); setForm(DEFAULT_FORM); } };
  const openEdit = (kpi: PerformanceKPI) => { setForm({ name: kpi.name, department: kpi.department, target: kpi.target, actual: kpi.actual, unit: kpi.unit, responsible: kpi.responsible, status: kpi.status, linkedRiskIds: kpi.linkedRiskIds }); setEditingId(kpi.id); setOpen(true); };
  const handleArchive = (kpi: PerformanceKPI) => { updateItem("performance", kpi.id, { status: "off_track" as any }); };
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (editingId) { updateItem("performance", editingId, form); } else { addPerformance(form); } setForm(DEFAULT_FORM); setEditingId(null); setOpen(false); };

  const kpis = data.performance;
  const onTrack = kpis.filter((k) => k.status === "on_track");
  const atRisk = kpis.filter((k) => k.status === "at_risk");
  const avgCompletion = kpis.length > 0 ? Math.round(kpis.reduce((s, k) => s + (k.target > 0 ? Math.min((k.actual / k.target) * 100, 100) : 0), 0) / kpis.length) : 0;
  const kpiChartData = kpis.slice(0, 8).map((k) => ({ name: k.name.length > 12 ? k.name.slice(0, 12) + "..." : k.name, pct: k.target > 0 ? Math.round(Math.min((k.actual / k.target) * 100, 100)) : 0, fill: k.status === "on_track" ? "hsl(165, 45%, 45%)" : k.status === "at_risk" ? "hsl(40, 95%, 50%)" : "hsl(0, 75%, 55%)" }));
  const statusColors: Record<string, string> = { on_track: "text-status-resolved", at_risk: "text-severity-medium", off_track: "text-severity-critical" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-display font-bold text-foreground">Performance Management</h1><p className="text-muted-foreground mt-1">Monitor KPIs, targets, and operational efficiency</p></div>
        <Button onClick={() => setOpen(true)} className="glass-btn-primary w-auto px-4 py-2"><Plus className="w-4 h-4 mr-2" /> Add KPI</Button>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">{editingId ? "Edit KPI" : "New KPI"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-white">KPI Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label className="text-white">Department</Label><Input required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
              <div><Label className="text-white">Target</Label><Input type="number" required value={form.target} onChange={(e) => setForm({ ...form, target: +e.target.value })} /></div>
              <div><Label className="text-white">Actual</Label><Input type="number" required value={form.actual} onChange={(e) => setForm({ ...form, actual: +e.target.value })} /></div>
              <div><Label className="text-white">Unit</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
              <div><Label className="text-white">Responsible</Label><Input required value={form.responsible} onChange={(e) => setForm({ ...form, responsible: e.target.value })} /></div>
              <div><Label className="text-white">Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as PerformanceKPI["status"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="on_track">On Track</SelectItem><SelectItem value="at_risk">At Risk</SelectItem><SelectItem value="off_track">Off Track</SelectItem></SelectContent></Select></div>
            </div>
            <button type="submit" className="glass-btn-primary">{editingId ? "Save Changes" : "Add KPI"}</button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete KPI?</AlertDialogTitle><AlertDialogDescription>This will permanently delete "{deleteTarget?.name}". This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { if (deleteTarget) { deleteItem("performance", deleteTarget.id); setDeleteTarget(null); } }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total KPIs" value={kpis.length} icon={BarChart3} color="primary" subtitle="Monitored" />
        <StatCard title="On Track" value={onTrack.length} icon={Target} color="secondary" subtitle={`${kpis.length > 0 ? Math.round((onTrack.length / kpis.length) * 100) : 0}%`} />
        <StatCard title="At Risk" value={atRisk.length} icon={AlertTriangle} color="severity-medium" subtitle="Needs attention" />
        <StatCard title="Avg Completion" value={`${avgCompletion}%`} icon={TrendingUp} color="primary" subtitle="Across all KPIs" />
      </motion.div>

      {kpis.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">KPI Achievement</h3>
          <div className="h-52"><ResponsiveContainer width="100%" height="100%"><BarChart data={kpiChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" /><XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215, 12%, 50%)" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: "hsl(215, 12%, 50%)" }} axisLine={false} tickLine={false} domain={[0, 100]} /><Tooltip content={<GlassTooltip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} /><Bar dataKey="pct" radius={[6, 6, 0, 0]} animationDuration={800}>{kpiChartData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar></BarChart></ResponsiveContainer></div>
        </motion.div>
      )}

      {kpis.length === 0 ? (
        <div className="glass-card p-12 text-center"><BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><h3 className="font-display font-semibold text-foreground">No KPIs tracked</h3><p className="text-muted-foreground text-sm mt-1">Add KPIs to monitor organizational performance</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi) => {
            const pct = kpi.target > 0 ? Math.min((kpi.actual / kpi.target) * 100, 100) : 0;
            return (
              <div key={kpi.id} className="glass-card p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-display font-semibold text-foreground text-sm">{kpi.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold capitalize ${statusColors[kpi.status]}`}>{kpi.status.replace("_", " ")}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><button className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"><MoreHorizontal className="w-4 h-4" /></button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => openEdit(kpi)}><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleArchive(kpi)}><Archive className="w-4 h-4 mr-2" /> Archive</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setDeleteTarget(kpi)} className="text-destructive focus:text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-muted-foreground"><span>{kpi.actual}{kpi.unit}</span><span>Target: {kpi.target}{kpi.unit}</span></div>
                  <Progress value={pct} className="h-2" />
                  <p className="text-xs text-muted-foreground">{kpi.department} · {kpi.responsible}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
