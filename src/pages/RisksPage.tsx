import { useState } from "react";
import { useGRC, Risk } from "@/lib/grc-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/severity-badge";
import { Plus, AlertTriangle } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Risk Management</h1>
          <p className="text-muted-foreground mt-1">Identify, assess, and monitor risks</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Add Risk</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="font-display">New Risk</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Risk Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Type</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Risk["type"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="operational">Operational</SelectItem><SelectItem value="financial">Financial</SelectItem><SelectItem value="compliance">Compliance</SelectItem><SelectItem value="strategic">Strategic</SelectItem></SelectContent></Select></div>
                <div><Label>Linked Asset</Label><Select value={form.assetId} onValueChange={(v) => setForm({ ...form, assetId: v })}><SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger><SelectContent>{data.assets.map((a) => (<SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>))}</SelectContent></Select></div>
                <div><Label>Owner</Label><Input required value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} /></div>
                <div><Label>Probability (1-5)</Label><Input type="number" min={1} max={5} value={form.probability} onChange={(e) => setForm({ ...form, probability: +e.target.value })} /></div>
                <div><Label>Impact (1-5)</Label><Input type="number" min={1} max={5} value={form.impact} onChange={(e) => setForm({ ...form, impact: +e.target.value })} /></div>
              </div>
              <div><Label>Mitigation Strategy</Label><Textarea value={form.mitigationStrategy} onChange={(e) => setForm({ ...form, mitigationStrategy: e.target.value })} /></div>
              <div><Label>Regulatory Reference</Label><Input placeholder="e.g., POPIA Section 19" value={form.regulatoryRef} onChange={(e) => setForm({ ...form, regulatoryRef: e.target.value })} /></div>
              <Button type="submit" className="w-full">Create Risk</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {data.risks.length === 0 ? (
        <div className="grc-card p-12 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display font-semibold text-foreground">No risks registered</h3>
          <p className="text-muted-foreground text-sm mt-1">Start by identifying and registering risks</p>
        </div>
      ) : (
        <div className="grc-card overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b bg-muted/50"><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Risk</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Type</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Score</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Owner</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Regulation</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th></tr></thead>
            <tbody>
              {data.risks.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
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
