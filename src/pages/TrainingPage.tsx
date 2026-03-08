import { GraduationCap } from "lucide-react";

export default function TrainingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Training & Awareness</h1>
        <p className="text-muted-foreground mt-1">Educate staff on policies, compliance, and risk awareness</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "POPIA Compliance", desc: "Data protection and privacy regulations training", progress: 75 },
          { title: "OHS Act Awareness", desc: "Occupational health and safety requirements", progress: 60 },
          { title: "Incident Reporting", desc: "How to identify and report incidents effectively", progress: 90 },
          { title: "Risk Assessment", desc: "Understanding risk identification and mitigation", progress: 45 },
          { title: "Audit Preparation", desc: "Preparing for internal and external audits", progress: 30 },
          { title: "Governance Policies", desc: "Understanding company policies and procedures", progress: 55 },
        ].map((item, i) => (
          <div key={i} className="grc-card p-5">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mb-3">
              <GraduationCap className="w-5 h-5 text-secondary" />
            </div>
            <h3 className="font-display font-semibold text-foreground text-sm">{item.title}</h3>
            <p className="text-muted-foreground text-xs mt-1">{item.desc}</p>
            <div className="mt-3 w-full bg-muted rounded-full h-1.5">
              <div className="bg-secondary rounded-full h-1.5 transition-all" style={{ width: `${item.progress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{item.progress}% complete</p>
          </div>
        ))}
      </div>
    </div>
  );
}
