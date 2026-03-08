import { useState } from "react";
import { useGRC, Risk } from "@/lib/grc-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/severity-badge";
import { StatCard } from "@/components/ui/stat-card";
import { RiskHeatMap } from "@/components/charts/RiskHeatMap";
import { Plus, AlertTriangle, ShieldAlert, Target, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { motion } from "framer-motion";

const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs font-medium text-white shadow-lg"
      style={{ background: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(8px)" }}>
      {label}: {payload[0].value}
    </div>
  );
};

export default function RisksPage() {
  const { data, addRisk } = useGRC();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "operational" as Risk["type"], assetId: "", probability: 3, impact: 3, mitigationStrategy: "", owner: "", status: "open" as Risk["status"], regulatoryRef: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRisk({ ...form, assetId: form.assetId || undefined });
    setForm({ name: "", type: "operational", assetId: "", probability: 3, impact: 3, mitigationStrategy: "", owner: "", status: "open", regulatoryRef: "" });
    setOpen(false);
  };

  const risks = data.risks;
  const openRisks = risks.filter((r) => r.status === "open");
  const criticalRisks = risks.filter((r) => r.probability * r.impact >= 15);
  const resolvedRisks = risks.filter((r) => r.status === "resolved" || r.status === "closed");
  const avgScore = risks.length > 0 ? (risks.reduce((s, r) => s + r.probability * r.impact, 0) / risks.length).toFixed(1) : "0";

  const typeData = [
    { type: "Operational", count: risks.filter((r) => r.type === "operational").length, fill: "hsl(211, 65%, 45%)" },
    { type: "Financial", count: risks.filter((r) => r.type === "financial").length, fill: "hsl(40, 95%, 50%)" },
    { type: "Compliance", count: risks.filter((r) => r.type === "compliance").length, fill: "hsl(165, 45%, 45%)" },
    { type: "Strategic", count: risks.filter((r) => r.type === "strategic").length, fill: "hsl(270, 50%, 55%)" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Risk Management</h1>
          <p className="text-muted-foreground mt-1">Identify, assess, and monitor risks</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="glass-btn-primary w-auto px-4 py-2"><Plus className="w-4 h-4 mr-2" /> Add Risk</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="font-display">New Risk</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-white">Risk Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label className="text-white">Type</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Risk["type"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="operational">Operational</SelectItem><SelectItem value="financial">Financial</SelectItem><SelectItem value="compliance">Compliance</SelectItem><SelectItem value="strategic">Strategic</SelectItem></SelectContent></Select></div>
                <div><Label className="text-white">Linked Asset</Label><Select value={form.assetId} onValueChange={(v) => setForm({ ...form, assetId: v })}><SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger><SelectContent>{data.assets.map((a) => (<SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>))}</SelectContent></Select></div>
                <div><Label className="text-white">Owner</Label><Input required value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} /></div>
                <div><Label className="text-white">Probability (1-5)</Label><Input type="number" min={1} max={5} value={form.probability} onChange={(e) => setForm({ ...form, probability: +e.target.value })} /></div>
                <div><Label className="text-white">Impact (1-5)</Label><Input type="number" min={1} max={5} value={form.impact} onChange={(e) => setForm({ ...form, impact: +e.target.value })} /></div>
              </div>
              <div><Label className="text-white">Mitigation Strategy</Label><Textarea value={form.mitigationStrategy} onChange={(e) => setForm({ ...form, mitigationStrategy: e.target.value })} /></div>
              <div><Label className="text-white">Regulatory Reference</Label><Input placeholder="e.g., POPIA Section 19" value={form.regulatoryRef} onChange={(e) => setForm({ ...form, regulatoryRef: e.target.value })} /></div>
              <button type="submit" className="glass-btn-primary">Create Risk</button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Module Dashboard */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Risks" value={risks.length} icon={AlertTriangle} color="primary" subtitle={`${openRisks.length} open`} />
        <StatCard title="Critical Risks" value={criticalRisks.length} icon={ShieldAlert} color="destructive" subtitle="Score ≥ 15" />
        <StatCard title="Avg Risk Score" value={avgScore} icon={Target} color="severity-medium" subtitle="Probability × Impact" />
        <StatCard title="Resolved" value={resolvedRisks.length} icon={TrendingDown} color="secondary" subtitle={`${risks.length > 0 ? Math.round((resolvedRisks.length / risks.length) * 100) : 0}% resolution rate`} />
      </motion.div>

      {risks.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RiskHeatMap risks={risks} />
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
            <h3 className="font-display font-semibold text-foreground mb-4">Risks by Type</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="type" tick={{ fontSize: 11, fill: "hsl(215, 12%, 50%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(215, 12%, 50%)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<GlassTooltip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={800}>
                    {typeData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      )}

      {/* Data Table */}
      {risks.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display font-semibold text-foreground">No risks registered</h3>
          <p className="text-muted-foreground text-sm mt-1">Start by identifying and registering risks</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full glass-table">
            <thead><tr className="border-b" style={{ borderColor: "var(--glass-border)" }}><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Risk</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Type</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Score</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Owner</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Regulation</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th></tr></thead>
            <tbody>
              {risks.map((r) => (
                <tr key={r.id} className="border-b last:border-0 transition-colors" style={{ borderColor: "var(--glass-border)" }}>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{r.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{r.type}</td>
                  <td className="px-4 py-3"><span className={`text-sm font-bold ${r.probability * r.impact >= 15 ? "text-severity-critical" : r.probability * r.impact >= 10 ? "text-severity-high" : "text-severity-medium"}`}>{r.probability * r.impact}</span></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{r.owner}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{r.regulatoryRef || "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
