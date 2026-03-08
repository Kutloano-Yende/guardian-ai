import { useState } from "react";
import { useGRC, ComplianceRecord } from "@/lib/grc-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Shield } from "lucide-react";

export default function CompliancePage() {
  const { data, addCompliance } = useGRC();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "sa_law" as ComplianceRecord["type"], department: "", owner: "", enforcement: "", consequences: "", lastReviewed: "", status: "under_review" as ComplianceRecord["status"] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCompliance(form);
    setForm({ name: "", type: "sa_law", department: "", owner: "", enforcement: "", consequences: "", lastReviewed: "", status: "under_review" });
    setOpen(false);
  };

  const statusColors = { compliant: "bg-status-resolved/15 text-status-resolved", non_compliant: "bg-severity-critical/15 text-severity-critical", under_review: "bg-status-open/15 text-status-open" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Compliance Management</h1>
          <p className="text-muted-foreground mt-1">Ensure regulatory adherence and policy compliance</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="glass-btn-primary w-auto px-4 py-2"><Plus className="w-4 h-4 mr-2" /> Add Policy</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="font-display">New Compliance Record</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Policy / Regulation Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Type</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as ComplianceRecord["type"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="internal_policy">Internal Policy</SelectItem><SelectItem value="sa_law">SA Law</SelectItem><SelectItem value="international_standard">International Standard</SelectItem></SelectContent></Select></div>
                <div><Label>Department</Label><Input required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
                <div><Label>Owner</Label><Input required value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} /></div>
                <div><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ComplianceRecord["status"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="compliant">Compliant</SelectItem><SelectItem value="non_compliant">Non-Compliant</SelectItem><SelectItem value="under_review">Under Review</SelectItem></SelectContent></Select></div>
                <div><Label>Last Reviewed</Label><Input type="date" value={form.lastReviewed} onChange={(e) => setForm({ ...form, lastReviewed: e.target.value })} /></div>
              </div>
              <div><Label>Enforcement Mechanism</Label><Input value={form.enforcement} onChange={(e) => setForm({ ...form, enforcement: e.target.value })} /></div>
              <div><Label>Consequences for Non-Compliance</Label><Textarea value={form.consequences} onChange={(e) => setForm({ ...form, consequences: e.target.value })} /></div>
              <button type="submit" className="glass-btn-primary">Add Record</button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {data.compliance.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display font-semibold text-foreground">No compliance records</h3>
          <p className="text-muted-foreground text-sm mt-1">Add policies and regulations to track compliance</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.compliance.map((c) => (
            <div key={c.id} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display font-semibold text-foreground">{c.name}</h3>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[c.status]}`}>{c.status.replace("_", " ")}</span>
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
