import { useState } from "react";
import { useGRC, Asset } from "@/lib/grc-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { StatCard } from "@/components/ui/stat-card";
import { Plus, Box, Monitor, Users, Cpu, Pencil, Trash2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";

const TYPE_COLORS: Record<string, string> = {
  hardware: "hsl(211, 65%, 45%)",
  software: "hsl(165, 45%, 45%)",
  human: "hsl(25, 90%, 55%)",
  intellectual_property: "hsl(270, 50%, 55%)",
  financial: "hsl(40, 95%, 50%)",
};

const GlassTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs font-medium text-white shadow-lg"
      style={{ background: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(8px)" }}>
      {payload[0].name}: {payload[0].value}
    </div>
  );
};

const DEFAULT_FORM = { name: "", type: "hardware" as Asset["type"], department: "", owner: "", status: "active" as Asset["status"], criticality: "low" as Asset["criticality"], location: "" };

export default function AssetsPage() {
  const { data, addAsset, updateItem, deleteItem } = useGRC();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) { setEditingId(null); setForm(DEFAULT_FORM); }
  };

  const openEdit = (a: Asset) => {
    setForm({ name: a.name, type: a.type, department: a.department, owner: a.owner, status: a.status, criticality: a.criticality, location: a.location || "" });
    setEditingId(a.id);
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateItem("assets", editingId, form);
    } else {
      addAsset(form);
    }
    setForm(DEFAULT_FORM);
    setEditingId(null);
    setOpen(false);
  };

  const assets = data.assets;
  const activeAssets = assets.filter((a) => a.status === "active");
  const criticalAssets = assets.filter((a) => a.criticality === "critical" || a.criticality === "high");
  const deptCounts = assets.reduce((acc, a) => { acc[a.department] = (acc[a.department] || 0) + 1; return acc; }, {} as Record<string, number>);
  const topDept = Object.entries(deptCounts).sort((a, b) => b[1] - a[1])[0];

  const typeData = Object.entries(
    assets.reduce((acc, a) => { acc[a.type] = (acc[a.type] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: name.replace("_", " "), value, color: TYPE_COLORS[name] || "hsl(211, 65%, 45%)" }));

  const critData = [
    { name: "Critical", value: assets.filter((a) => a.criticality === "critical").length, color: "hsl(0, 75%, 55%)" },
    { name: "High", value: assets.filter((a) => a.criticality === "high").length, color: "hsl(25, 90%, 55%)" },
    { name: "Medium", value: assets.filter((a) => a.criticality === "medium").length, color: "hsl(40, 95%, 50%)" },
    { name: "Low", value: assets.filter((a) => a.criticality === "low").length, color: "hsl(165, 45%, 45%)" },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Asset Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage all company assets</p>
        </div>
        <Button onClick={() => setOpen(true)} className="glass-btn-primary w-auto px-4 py-2"><Plus className="w-4 h-4 mr-2" /> Add Asset</Button>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">{editingId ? "Edit Asset" : "New Asset"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-white">Asset Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label className="text-white">Type</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Asset["type"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="hardware">Hardware</SelectItem><SelectItem value="software">Software</SelectItem><SelectItem value="human">Human</SelectItem><SelectItem value="intellectual_property">Intellectual Property</SelectItem><SelectItem value="financial">Financial</SelectItem></SelectContent></Select></div>
              <div><Label className="text-white">Department</Label><Input required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
              <div><Label className="text-white">Owner</Label><Input required value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} /></div>
              <div><Label className="text-white">Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <div><Label className="text-white">Criticality</Label><Select value={form.criticality} onValueChange={(v) => setForm({ ...form, criticality: v as Asset["criticality"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent></Select></div>
              <div><Label className="text-white">Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Asset["status"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="maintenance">Maintenance</SelectItem><SelectItem value="retired">Retired</SelectItem></SelectContent></Select></div>
            </div>
            <button type="submit" className="glass-btn-primary">{editingId ? "Save Changes" : "Create Asset"}</button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Module Dashboard */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Assets" value={assets.length} icon={Box} color="primary" subtitle="All registered assets" />
        <StatCard title="Active" value={activeAssets.length} icon={Monitor} color="secondary" subtitle={`${assets.filter((a) => a.status === "maintenance").length} in maintenance`} />
        <StatCard title="High/Critical" value={criticalAssets.length} icon={Cpu} color="severity-high" subtitle="Require attention" />
        <StatCard title="Top Department" value={topDept ? topDept[0] : "N/A"} icon={Users} color="primary" subtitle={topDept ? `${topDept[1]} assets` : ""} />
      </motion.div>

      {assets.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
            <h3 className="font-display font-semibold text-foreground mb-4">Assets by Type</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" animationDuration={800}>
                    {typeData.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                  </Pie>
                  <Tooltip content={<GlassTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {typeData.map((t) => (
                <div key={t.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
                  <span className="text-[11px] text-muted-foreground capitalize">{t.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5">
            <h3 className="font-display font-semibold text-foreground mb-4">Criticality Distribution</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={critData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" animationDuration={800}>
                    {critData.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                  </Pie>
                  <Tooltip content={<GlassTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {critData.map((c) => (
                <div key={c.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                  <span className="text-[11px] text-muted-foreground">{c.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Data Table */}
      {assets.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Box className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display font-semibold text-foreground">No assets yet</h3>
          <p className="text-muted-foreground text-sm mt-1">Start by adding your first asset to track</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full glass-table">
            <thead><tr className="border-b" style={{ borderColor: "var(--glass-border)" }}><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Name</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Type</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Department</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Owner</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Criticality</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th><th className="px-4 py-3"></th></tr></thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.id} className="border-b last:border-0 transition-colors" style={{ borderColor: "var(--glass-border)" }}>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{a.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{a.type.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{a.department}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{a.owner}</td>
                  <td className="px-4 py-3"><SeverityBadge severity={a.criticality} /></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{a.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><button className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-severity-high transition-colors"><Trash2 className="w-3.5 h-3.5" /></button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Delete Asset?</AlertDialogTitle><AlertDialogDescription>This will permanently delete "{a.name}". This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteItem("assets", a.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
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
