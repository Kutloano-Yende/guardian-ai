import { useState } from "react";
import { useGRC, Asset } from "@/lib/grc-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { Plus, Box } from "lucide-react";

export default function AssetsPage() {
  const { data, addAsset } = useGRC();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "hardware" as Asset["type"], department: "", owner: "", status: "active" as Asset["status"], criticality: "low" as Asset["criticality"], location: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAsset(form);
    setForm({ name: "", type: "hardware", department: "", owner: "", status: "active", criticality: "low", location: "" });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Asset Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage all company assets</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="glass-btn-primary w-auto px-4 py-2"><Plus className="w-4 h-4 mr-2" /> Add Asset</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="font-display">New Asset</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Asset Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Type</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Asset["type"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="hardware">Hardware</SelectItem><SelectItem value="software">Software</SelectItem><SelectItem value="human">Human</SelectItem><SelectItem value="intellectual_property">Intellectual Property</SelectItem><SelectItem value="financial">Financial</SelectItem></SelectContent></Select></div>
                <div><Label>Department</Label><Input required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
                <div><Label>Owner</Label><Input required value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} /></div>
                <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                <div><Label>Criticality</Label><Select value={form.criticality} onValueChange={(v) => setForm({ ...form, criticality: v as Asset["criticality"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent></Select></div>
              </div>
              <button type="submit" className="glass-btn-primary">Create Asset</button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {data.assets.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Box className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display font-semibold text-foreground">No assets yet</h3>
          <p className="text-muted-foreground text-sm mt-1">Start by adding your first asset to track</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full glass-table">
            <thead><tr className="border-b" style={{ borderColor: "var(--glass-border)" }}><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Name</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Type</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Department</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Owner</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Criticality</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th></tr></thead>
            <tbody>
              {data.assets.map((a) => (
                <tr key={a.id} className="border-b last:border-0 transition-colors" style={{ borderColor: "var(--glass-border)" }}>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{a.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{a.type.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{a.department}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{a.owner}</td>
                  <td className="px-4 py-3"><SeverityBadge severity={a.criticality} /></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
