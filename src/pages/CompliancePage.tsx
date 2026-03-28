import { useState } from "react";
import { useGRC, ComplianceRecord } from "@/lib/grc-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatCard } from "@/components/ui/stat-card";
import { ComplianceDonut } from "@/components/charts/ComplianceDonut";
import { Plus, Shield, CheckCircle2, XCircle, Search, MoreHorizontal, Pencil, Archive, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { motion } from "framer-motion";

const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (<div className="rounded-xl px-3 py-2 text-xs font-medium text-white shadow-lg" style={{ background: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(8px)" }}>{label}: {payload[0].value}</div>);
};

const DEFAULT_FORM = { name: "", type: "sa_law" as ComplianceRecord["type"], department: "", owner: "", enforcement: "", consequences: "", lastReviewed: "", status: "under_review" as ComplianceRecord["status"] };

export default function CompliancePage() {
  const { data, addCompliance, updateItem, deleteItem } = useGRC();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ComplianceRecord | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  const handleOpenChange = (v: boolean) => { setOpen(v); if (!v) { setEditingId(null); setForm(DEFAULT_FORM); } };
  const openEdit = (c: ComplianceRecord) => { setForm({ name: c.name, type: c.type, department: c.department, owner: c.owner, enforcement: c.enforcement, consequences: c.consequences, lastReviewed: c.lastReviewed || "", status: c.status }); setEditingId(c.id); setOpen(true); };
  const handleArchive = (c: ComplianceRecord) => { updateItem("compliance", c.id, { status: "compliant" as any }); };
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (editingId) { updateItem("compliance", editingId, form); } else { addCompliance(form); } setForm(DEFAULT_FORM); setEditingId(null); setOpen(false); };

  const records = data.compliance;
  const compliant = records.filter((c) => c.status === "compliant");
  const nonCompliant = records.filter((c) => c.status === "non_compliant");
  const underReview = records.filter((c) => c.status === "under_review");
  const complianceRate = records.length > 0 ? Math.round((compliant.length / records.length) * 100) : 0;
  const typeData = [
    { type: "Internal Policy", count: records.filter((r) => r.type === "internal_policy").length, fill: "hsl(211, 65%, 45%)" },
    { type: "SA Law", count: records.filter((r) => r.type === "sa_law").length, fill: "hsl(165, 45%, 45%)" },
    { type: "International", count: records.filter((r) => r.type === "international_standard").length, fill: "hsl(270, 50%, 55%)" },
  ];
  const statusColors: Record<string, string> = { compliant: "bg-status-resolved/15 text-status-resolved", non_compliant: "bg-severity-critical/15 text-severity-critical", under_review: "bg-status-open/15 text-status-open" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-display font-bold text-foreground">Compliance Management</h1><p className="text-muted-foreground mt-1">Ensure regulatory adherence and policy compliance</p></div>
        <Button onClick={() => setOpen(true)} className="glass-btn-primary w-auto px-4 py-2"><Plus className="w-4 h-4 mr-2" /> Add Policy</Button>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">{editingId ? "Edit Compliance Record" : "New Compliance Record"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-white">Policy / Regulation Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label className="text-white">Type</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as ComplianceRecord["type"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="internal_policy">Internal Policy</SelectItem><SelectItem value="sa_law">SA Law</SelectItem><SelectItem value="international_standard">International Standard</SelectItem></SelectContent></Select></div>
              <div><Label className="text-white">Department</Label><Input required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
              <div><Label className="text-white">Owner</Label><Input required value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} /></div>
              <div><Label className="text-white">Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ComplianceRecord["status"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="compliant">Compliant</SelectItem><SelectItem value="non_compliant">Non-Compliant</SelectItem><SelectItem value="under_review">Under Review</SelectItem></SelectContent></Select></div>
              <div><Label className="text-white">Last Reviewed</Label><Input type="date" value={form.lastReviewed} onChange={(e) => setForm({ ...form, lastReviewed: e.target.value })} /></div>
            </div>
            <div><Label className="text-white">Enforcement Mechanism</Label><Input value={form.enforcement} onChange={(e) => setForm({ ...form, enforcement: e.target.value })} /></div>
            <div><Label className="text-white">Consequences for Non-Compliance</Label><Textarea value={form.consequences} onChange={(e) => setForm({ ...form, consequences: e.target.value })} /></div>
            <button type="submit" className="glass-btn-primary">{editingId ? "Save Changes" : "Add Record"}</button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Compliance Record?</AlertDialogTitle><AlertDialogDescription>This will permanently delete "{deleteTarget?.name}". This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { if (deleteTarget) { deleteItem("compliance", deleteTarget.id); setDeleteTarget(null); } }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Policies" value={records.length} icon={Shield} color="primary" subtitle="Tracked" />
        <StatCard title="Compliant" value={compliant.length} icon={CheckCircle2} color="secondary" subtitle={`${complianceRate}% rate`} />
        <StatCard title="Non-Compliant" value={nonCompliant.length} icon={XCircle} color="destructive" subtitle="Requires action" />
        <StatCard title="Under Review" value={underReview.length} icon={Search} color="severity-medium" subtitle="Pending assessment" />
      </motion.div>

      {records.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComplianceDonut records={records} />
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
            <h3 className="font-display font-semibold text-foreground mb-4">By Framework Type</h3>
            <div className="h-52"><ResponsiveContainer width="100%" height="100%"><BarChart data={typeData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" /><XAxis dataKey="type" tick={{ fontSize: 11, fill: "hsl(215, 12%, 50%)" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: "hsl(215, 12%, 50%)" }} axisLine={false} tickLine={false} allowDecimals={false} /><Tooltip content={<GlassTooltip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} /><Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={800}>{typeData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar></BarChart></ResponsiveContainer></div>
          </motion.div>
        </div>
      )}

      {records.length === 0 ? (
        <div className="glass-card p-12 text-center"><Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><h3 className="font-display font-semibold text-foreground">No compliance records</h3><p className="text-muted-foreground text-sm mt-1">Add policies and regulations to track compliance</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {records.map((c) => (
            <div key={c.id} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display font-semibold text-foreground">{c.name}</h3>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[c.status]}`}>{c.status.replace("_", " ")}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><button className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"><MoreHorizontal className="w-4 h-4" /></button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => openEdit(c)}><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleArchive(c)}><Archive className="w-4 h-4 mr-2" /> Mark Compliant</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setDeleteTarget(c)} className="text-destructive focus:text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <p>Type: <span className="capitalize">{c.type.replace("_", " ")}</span></p>
                <p>Department: {c.department}</p>
                <p>Owner: {c.owner}</p>
                {c.consequences && <p className="text-severity-high text-xs mt-2">⚠ {c.consequences}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
