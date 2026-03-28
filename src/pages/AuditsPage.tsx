import { useState } from "react";
import { useGRC, AuditRecord } from "@/lib/grc-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatCard } from "@/components/ui/stat-card";
import { Plus, ClipboardCheck, CalendarClock, CheckCircle2, Loader2, MoreHorizontal, Pencil, Archive, Trash2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";

const GlassTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (<div className="rounded-xl px-3 py-2 text-xs font-medium text-white shadow-lg" style={{ background: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(8px)" }}>{payload[0].name}: {payload[0].value}</div>);
};

const DEFAULT_FORM = { name: "", scope: "", type: "internal" as AuditRecord["type"], auditor: "", startDate: "", endDate: "", findings: "", status: "planned" as AuditRecord["status"], linkedIncidents: [] as string[], linkedRisks: [] as string[] };

export default function AuditsPage() {
  const { data, addAudit, updateItem, deleteItem } = useGRC();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AuditRecord | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  const handleOpenChange = (v: boolean) => { setOpen(v); if (!v) { setEditingId(null); setForm(DEFAULT_FORM); } };
  const openEdit = (a: AuditRecord) => { setForm({ name: a.name, scope: a.scope, type: a.type, auditor: a.auditor, startDate: a.startDate, endDate: a.endDate, findings: a.findings, status: a.status, linkedIncidents: a.linkedIncidents, linkedRisks: a.linkedRisks }); setEditingId(a.id); setOpen(true); };
  const handleArchive = (a: AuditRecord) => { updateItem("audits", a.id, { status: "completed" as any }); };
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (editingId) { updateItem("audits", editingId, form); } else { addAudit(form); } setForm(DEFAULT_FORM); setEditingId(null); setOpen(false); };

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
        <div><h1 className="text-2xl font-display font-bold text-foreground">Audit Management</h1><p className="text-muted-foreground mt-1">Plan, execute, and record audits</p></div>
        <Button onClick={() => setOpen(true)} className="glass-btn-primary w-auto px-4 py-2"><Plus className="w-4 h-4 mr-2" /> Schedule Audit</Button>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">{editingId ? "Edit Audit" : "New Audit"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-white">Audit Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label className="text-white">Type</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as AuditRecord["type"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="internal">Internal</SelectItem><SelectItem value="external">External</SelectItem><SelectItem value="regulatory">Regulatory</SelectItem></SelectContent></Select></div>
              <div><Label className="text-white">Scope</Label><Input required value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} /></div>
              <div><Label className="text-white">Auditor</Label><Input required value={form.auditor} onChange={(e) => setForm({ ...form, auditor: e.target.value })} /></div>
              <div><Label className="text-white">Start Date</Label><Input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
              <div><Label className="text-white">End Date</Label><Input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
              <div><Label className="text-white">Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as AuditRecord["status"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="planned">Planned</SelectItem><SelectItem value="ongoing">Ongoing</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label className="text-white">Findings / Notes</Label><Textarea value={form.findings} onChange={(e) => setForm({ ...form, findings: e.target.value })} /></div>
            <button type="submit" className="glass-btn-primary">{editingId ? "Save Changes" : "Create Audit"}</button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Audit?</AlertDialogTitle><AlertDialogDescription>This will permanently delete "{deleteTarget?.name}". This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { if (deleteTarget) { deleteItem("audits", deleteTarget.id); setDeleteTarget(null); } }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>

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
            <div className="relative h-48"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" animationDuration={800}>{statusData.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}</Pie><Tooltip content={<GlassTooltip />} /></PieChart></ResponsiveContainer><div className="absolute inset-0 flex items-center justify-center pointer-events-none"><span className="text-2xl font-bold text-foreground">{audits.length}</span></div></div>
            <div className="flex justify-center gap-4 mt-2">{statusData.map((s) => (<div key={s.name} className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} /><span className="text-[11px] text-muted-foreground">{s.name}</span></div>))}</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5">
            <h3 className="font-display font-semibold text-foreground mb-4">By Type</h3>
            <div className="relative h-48"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={typeData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" animationDuration={800}>{typeData.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}</Pie><Tooltip content={<GlassTooltip />} /></PieChart></ResponsiveContainer></div>
            <div className="flex justify-center gap-4 mt-2">{typeData.map((s) => (<div key={s.name} className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} /><span className="text-[11px] text-muted-foreground">{s.name}</span></div>))}</div>
          </motion.div>
        </div>
      )}

      {audits.length === 0 ? (
        <div className="glass-card p-12 text-center"><ClipboardCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><h3 className="font-display font-semibold text-foreground">No audits scheduled</h3><p className="text-muted-foreground text-sm mt-1">Schedule your first audit to begin tracking compliance</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {audits.map((a) => (
            <div key={a.id} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display font-semibold text-foreground text-sm">{a.name}</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold capitalize ${statusColors[a.status]}`}>{a.status}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><button className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"><MoreHorizontal className="w-4 h-4" /></button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => openEdit(a)}><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleArchive(a)}><Archive className="w-4 h-4 mr-2" /> Archive</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setDeleteTarget(a)} className="text-destructive focus:text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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
