import { useState } from "react";
import { useGRC, PerformanceKPI } from "@/lib/grc-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function PerformancePage() {
  const { data, addPerformance } = useGRC();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", department: "", target: 100, actual: 0, unit: "%", responsible: "", status: "on_track" as PerformanceKPI["status"], linkedRiskIds: [] as string[] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPerformance(form);
    setForm({ name: "", department: "", target: 100, actual: 0, unit: "%", responsible: "", status: "on_track", linkedRiskIds: [] });
    setOpen(false);
  };

  const statusColors = { on_track: "text-status-resolved", at_risk: "text-severity-medium", off_track: "text-severity-critical" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Performance Management</h1>
          <p className="text-muted-foreground mt-1">Monitor KPIs, targets, and operational efficiency</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Add KPI</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="font-display">New KPI</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>KPI Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Department</Label><Input required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
                <div><Label>Target</Label><Input type="number" required value={form.target} onChange={(e) => setForm({ ...form, target: +e.target.value })} /></div>
                <div><Label>Actual</Label><Input type="number" required value={form.actual} onChange={(e) => setForm({ ...form, actual: +e.target.value })} /></div>
                <div><Label>Unit</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
                <div><Label>Responsible</Label><Input required value={form.responsible} onChange={(e) => setForm({ ...form, responsible: e.target.value })} /></div>
                <div><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as PerformanceKPI["status"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="on_track">On Track</SelectItem><SelectItem value="at_risk">At Risk</SelectItem><SelectItem value="off_track">Off Track</SelectItem></SelectContent></Select></div>
              </div>
              <Button type="submit" className="w-full">Add KPI</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {data.performance.length === 0 ? (
        <div className="grc-card p-12 text-center">
          <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display font-semibold text-foreground">No KPIs tracked</h3>
          <p className="text-muted-foreground text-sm mt-1">Add KPIs to monitor organizational performance</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.performance.map((kpi) => {
            const pct = kpi.target > 0 ? Math.min((kpi.actual / kpi.target) * 100, 100) : 0;
            return (
              <div key={kpi.id} className="grc-card p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-display font-semibold text-foreground text-sm">{kpi.name}</h3>
                  <span className={`text-xs font-semibold capitalize ${statusColors[kpi.status]}`}>{kpi.status.replace("_", " ")}</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{kpi.actual}{kpi.unit}</span>
                    <span>Target: {kpi.target}{kpi.unit}</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <p className="text-xs text-muted-foreground">{kpi.department} · {kpi.responsible}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
