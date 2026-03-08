import { useState } from "react";
import { useGRC, AuditRecord } from "@/lib/grc-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, ClipboardCheck } from "lucide-react";

export default function AuditsPage() {
  const { data, addAudit } = useGRC();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", scope: "", type: "internal" as AuditRecord["type"], auditor: "", startDate: "", endDate: "", findings: "", status: "planned" as AuditRecord["status"], linkedIncidents: [] as string[], linkedRisks: [] as string[] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAudit(form);
    setForm({ name: "", scope: "", type: "internal", auditor: "", startDate: "", endDate: "", findings: "", status: "planned", linkedIncidents: [], linkedRisks: [] });
    setOpen(false);
  };

  const statusColors = { planned: "text-status-open", ongoing: "text-status-progress", completed: "text-status-resolved" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Audit Management</h1>
          <p className="text-muted-foreground mt-1">Plan, execute, and record audits</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Schedule Audit</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="font-display">New Audit</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Audit Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Type</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as AuditRecord["type"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="internal">Internal</SelectItem><SelectItem value="external">External</SelectItem><SelectItem value="regulatory">Regulatory</SelectItem></SelectContent></Select></div>
                <div><Label>Scope</Label><Input required value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} /></div>
                <div><Label>Auditor</Label><Input required value={form.auditor} onChange={(e) => setForm({ ...form, auditor: e.target.value })} /></div>
                <div><Label>Start Date</Label><Input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
                <div><Label>End Date</Label><Input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
              </div>
              <div><Label>Findings / Notes</Label><Textarea value={form.findings} onChange={(e) => setForm({ ...form, findings: e.target.value })} /></div>
              <Button type="submit" className="w-full">Create Audit</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {data.audits.length === 0 ? (
        <div className="grc-card p-12 text-center">
          <ClipboardCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display font-semibold text-foreground">No audits scheduled</h3>
          <p className="text-muted-foreground text-sm mt-1">Schedule your first audit to begin tracking compliance</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.audits.map((a) => (
            <div key={a.id} className="grc-card p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display font-semibold text-foreground text-sm">{a.name}</h3>
                <span className={`text-xs font-semibold capitalize ${statusColors[a.status]}`}>{a.status}</span>
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
