import { useState } from "react";
import { useGRC, ActionItem } from "@/lib/grc-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SeverityBadge, StatusBadge } from "@/components/ui/severity-badge";
import { Plus, ListTodo } from "lucide-react";

export default function ActionsPage() {
  const { data, addAction } = useGRC();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", relatedType: "incident" as ActionItem["relatedType"], relatedId: "", assignedTo: "", priority: "medium" as ActionItem["priority"], startDate: "", dueDate: "", status: "open" as ActionItem["status"], notes: "", estimatedImpactOfDelay: "" });

  const relatedOptions = form.relatedType === "risk" ? data.risks : form.relatedType === "incident" ? data.incidents : data.audits;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAction(form);
    setForm({ name: "", relatedType: "incident", relatedId: "", assignedTo: "", priority: "medium", startDate: "", dueDate: "", status: "open", notes: "", estimatedImpactOfDelay: "" });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Action Plans</h1>
          <p className="text-muted-foreground mt-1">Track mitigation actions and task follow-ups</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Add Action</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="font-display">New Action Item</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Action Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Priority</Label><Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as ActionItem["priority"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent></Select></div>
                <div><Label>Related To</Label><Select value={form.relatedType} onValueChange={(v) => setForm({ ...form, relatedType: v as ActionItem["relatedType"], relatedId: "" })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="incident">Incident</SelectItem><SelectItem value="risk">Risk</SelectItem><SelectItem value="audit">Audit</SelectItem></SelectContent></Select></div>
                <div><Label>Linked Item</Label><Select value={form.relatedId} onValueChange={(v) => setForm({ ...form, relatedId: v })}><SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger><SelectContent>{relatedOptions.map((o: any) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Assigned To</Label><Input required value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} /></div>
                <div><Label>Due Date</Label><Input type="date" required value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
              </div>
              <div><Label>Impact of Delay</Label><Input placeholder="e.g., R50,000 fine, POPIA breach" value={form.estimatedImpactOfDelay} onChange={(e) => setForm({ ...form, estimatedImpactOfDelay: e.target.value })} /></div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <Button type="submit" className="w-full">Create Action</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {data.actions.length === 0 ? (
        <div className="grc-card p-12 text-center">
          <ListTodo className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display font-semibold text-foreground">No action items</h3>
          <p className="text-muted-foreground text-sm mt-1">Create actions linked to incidents, risks, or audits</p>
        </div>
      ) : (
        <div className="grc-card overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b bg-muted/50"><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Action</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Priority</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Linked To</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Assigned</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Due Date</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th></tr></thead>
            <tbody>
              {data.actions.map((a) => (
                <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3"><p className="text-sm font-medium text-foreground">{a.name}</p>{a.estimatedImpactOfDelay && <p className="text-xs text-severity-high">⚠ {a.estimatedImpactOfDelay}</p>}</td>
                  <td className="px-4 py-3"><SeverityBadge severity={a.priority} /></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{a.relatedType}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{a.assignedTo}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(a.dueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
