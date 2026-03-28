import { useState } from "react";
import { useGRC, ActionItem } from "@/lib/grc-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { SeverityBadge, StatusBadge } from "@/components/ui/severity-badge";
import { StatCard } from "@/components/ui/stat-card";
import { Plus, ListTodo, Clock, CheckCircle2, AlertOctagon, Timer, Pencil, Trash2 } from "lucide-react";
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

const DEFAULT_FORM = { name: "", relatedType: "incident" as ActionItem["relatedType"], relatedId: "", assignedTo: "", priority: "medium" as ActionItem["priority"], startDate: "", dueDate: "", status: "open" as ActionItem["status"], notes: "", estimatedImpactOfDelay: "" };

export default function ActionsPage() {
  const { data, addAction, updateItem, deleteItem } = useGRC();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  const relatedOptions = form.relatedType === "risk" ? data.risks : form.relatedType === "incident" ? data.incidents : data.audits;

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) { setEditingId(null); setForm(DEFAULT_FORM); }
  };

  const openEdit = (a: ActionItem) => {
    setForm({ name: a.name, relatedType: a.relatedType, relatedId: a.relatedId, assignedTo: a.assignedTo, priority: a.priority, startDate: a.startDate || "", dueDate: a.dueDate, status: a.status, notes: a.notes, estimatedImpactOfDelay: a.estimatedImpactOfDelay });
    setEditingId(a.id);
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateItem("actions", editingId, form);
    } else {
      addAction(form);
    }
    setForm(DEFAULT_FORM);
    setEditingId(null);
    setOpen(false);
  };

  const actions = data.actions;
  const openActions = actions.filter((a) => a.status === "open");
  const inProgress = actions.filter((a) => a.status === "in_progress");
  const resolved = actions.filter((a) => a.status === "resolved" || a.status === "closed");
  const overdue = actions.filter((a) => a.status !== "resolved" && a.status !== "closed" && new Date(a.dueDate) < new Date());

  const priorityData = [
    { name: "Critical", value: actions.filter((a) => a.priority === "critical").length, color: "hsl(0, 75%, 55%)" },
    { name: "High", value: actions.filter((a) => a.priority === "high").length, color: "hsl(25, 90%, 55%)" },
    { name: "Medium", value: actions.filter((a) => a.priority === "medium").length, color: "hsl(40, 95%, 50%)" },
    { name: "Low", value: actions.filter((a) => a.priority === "low").length, color: "hsl(165, 45%, 45%)" },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Action Plans</h1>
          <p className="text-muted-foreground mt-1">Track mitigation actions and task follow-ups</p>
        </div>
        <Button onClick={() => setOpen(true)} className="glass-btn-primary w-auto px-4 py-2"><Plus className="w-4 h-4 mr-2" /> Add Action</Button>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">{editingId ? "Edit Action" : "New Action Item"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-white">Action Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label className="text-white">Priority</Label><Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as ActionItem["priority"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent></Select></div>
              <div><Label className="text-white">Related To</Label><Select value={form.relatedType} onValueChange={(v) => setForm({ ...form, relatedType: v as ActionItem["relatedType"], relatedId: "" })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="incident">Incident</SelectItem><SelectItem value="risk">Risk</SelectItem><SelectItem value="audit">Audit</SelectItem></SelectContent></Select></div>
              <div><Label className="text-white">Linked Item</Label><Select value={form.relatedId} onValueChange={(v) => setForm({ ...form, relatedId: v })}><SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger><SelectContent>{relatedOptions.map((o: any) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent></Select></div>
              <div><Label className="text-white">Assigned To</Label><Input required value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} /></div>
              <div><Label className="text-white">Due Date</Label><Input type="date" required value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
              <div><Label className="text-white">Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ActionItem["status"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="open">Open</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="resolved">Resolved</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label className="text-white">Impact of Delay</Label><Input placeholder="e.g., R50,000 fine, POPIA breach" value={form.estimatedImpactOfDelay} onChange={(e) => setForm({ ...form, estimatedImpactOfDelay: e.target.value })} /></div>
            <div><Label className="text-white">Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <button type="submit" className="glass-btn-primary">{editingId ? "Save Changes" : "Create Action"}</button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Module Dashboard */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Actions" value={actions.length} icon={ListTodo} color="primary" subtitle="All tracked" />
        <StatCard title="Open" value={openActions.length} icon={AlertOctagon} color="severity-high" subtitle={`${inProgress.length} in progress`} />
        <StatCard title="Completed" value={resolved.length} icon={CheckCircle2} color="secondary" subtitle={`${actions.length > 0 ? Math.round((resolved.length / actions.length) * 100) : 0}% done`} />
        <StatCard title="Overdue" value={overdue.length} icon={Timer} color="destructive" subtitle="Past due date" />
      </motion.div>

      {actions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
            <h3 className="font-display font-semibold text-foreground mb-4">Priority Distribution</h3>
            <div className="relative h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={priorityData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" animationDuration={800}>
                  {priorityData.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                </Pie><Tooltip content={<GlassTooltip />} /></PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-foreground">{actions.length}</span>
              </div>
            </div>
            <div className="flex justify-center gap-3 mt-2">
              {priorityData.map((p) => (<div key={p.name} className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} /><span className="text-[11px] text-muted-foreground">{p.name}</span></div>))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5">
            <h3 className="font-display font-semibold text-foreground mb-4">Overdue Actions</h3>
            {overdue.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">🎉 No overdue actions!</p>
            ) : (
              <div className="space-y-3 max-h-56 overflow-y-auto">
                {overdue.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <div>
                      <p className="text-sm font-medium text-foreground">{a.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> Due: {new Date(a.dueDate).toLocaleDateString()}</p>
                    </div>
                    <SeverityBadge severity={a.priority} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Data Table */}
      {actions.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <ListTodo className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display font-semibold text-foreground">No action items</h3>
          <p className="text-muted-foreground text-sm mt-1">Create actions linked to incidents, risks, or audits</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full glass-table">
            <thead><tr className="border-b" style={{ borderColor: "var(--glass-border)" }}><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Action</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Priority</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Linked To</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Assigned</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Due Date</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th><th className="px-4 py-3"></th></tr></thead>
            <tbody>
              {actions.map((a) => (
                <tr key={a.id} className="border-b last:border-0 transition-colors" style={{ borderColor: "var(--glass-border)" }}>
                  <td className="px-4 py-3"><p className="text-sm font-medium text-foreground">{a.name}</p>{a.estimatedImpactOfDelay && <p className="text-xs text-severity-high">⚠ {a.estimatedImpactOfDelay}</p>}</td>
                  <td className="px-4 py-3"><SeverityBadge severity={a.priority} /></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{a.relatedType}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{a.assignedTo}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(a.dueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><button className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-severity-high transition-colors"><Trash2 className="w-3.5 h-3.5" /></button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Delete Action?</AlertDialogTitle><AlertDialogDescription>This will permanently delete "{a.name}". This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteItem("actions", a.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
