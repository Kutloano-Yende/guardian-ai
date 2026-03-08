import { useState } from "react";
import { useGRC, Incident } from "@/lib/grc-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SeverityBadge, StatusBadge } from "@/components/ui/severity-badge";
import { Plus, FileWarning } from "lucide-react";

const incidentTypes = ["Data Breach", "Equipment Failure", "Safety Violation", "Policy Violation", "System Outage", "Environmental", "Fraud", "Other"];

export default function IncidentsPage() {
  const { data, addIncident } = useGRC();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", type: "Other", reportedBy: "", department: "", severity: "medium" as Incident["severity"],
    assetId: "", riskId: "", assignedTo: "", status: "open" as Incident["status"],
    regulatoryImpact: "", deadline: "", description: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addIncident({ ...form, assetId: form.assetId || undefined, riskId: form.riskId || undefined });
    setForm({ name: "", type: "Other", reportedBy: "", department: "", severity: "medium", assetId: "", riskId: "", assignedTo: "", status: "open", regulatoryImpact: "", deadline: "", description: "" });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Incident Management</h1>
          <p className="text-muted-foreground mt-1">Capture, track, and resolve incidents in real-time</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Report Incident</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-display">Report Incident</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Incident Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Type</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{incidentTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Reported By</Label><Input required value={form.reportedBy} onChange={(e) => setForm({ ...form, reportedBy: e.target.value })} /></div>
                <div><Label>Department</Label><Input required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
                <div><Label>Severity</Label><Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v as Incident["severity"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent></Select></div>
                <div><Label>Assigned To</Label><Input required value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} /></div>
                <div><Label>Linked Asset</Label><Select value={form.assetId} onValueChange={(v) => setForm({ ...form, assetId: v })}><SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger><SelectContent>{data.assets.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Linked Risk</Label><Select value={form.riskId} onValueChange={(v) => setForm({ ...form, riskId: v })}><SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger><SelectContent>{data.risks.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Resolution Deadline</Label><Input type="date" required value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
              </div>
              <div><Label>Regulatory Impact</Label><Input placeholder="e.g., POPIA violation, possible fine R50,000" value={form.regulatoryImpact} onChange={(e) => setForm({ ...form, regulatoryImpact: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <Button type="submit" className="w-full">Submit Incident</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {data.incidents.length === 0 ? (
        <div className="grc-card p-12 text-center">
          <FileWarning className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display font-semibold text-foreground">No incidents reported</h3>
          <p className="text-muted-foreground text-sm mt-1">Report incidents as they occur to track and resolve them</p>
        </div>
      ) : (
        <div className="grc-card overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b bg-muted/50"><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Incident</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Type</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Severity</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Assigned To</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Deadline</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th></tr></thead>
            <tbody>
              {data.incidents.map((inc) => (
                <tr key={inc.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3"><p className="text-sm font-medium text-foreground">{inc.name}</p><p className="text-xs text-muted-foreground">{inc.department}</p></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{inc.type}</td>
                  <td className="px-4 py-3"><SeverityBadge severity={inc.severity} /></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{inc.assignedTo}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{inc.deadline ? new Date(inc.deadline).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={inc.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
