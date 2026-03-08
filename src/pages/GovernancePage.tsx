import { Scale } from "lucide-react";

export default function GovernancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Governance</h1>
        <p className="text-muted-foreground mt-1">Define policies, roles, and authority matrices</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "Policy Management", desc: "Create, review, and enforce organizational policies and SOPs" },
          { title: "Role Assignments", desc: "Define roles, responsibilities, and segregation of duties" },
          { title: "Regulatory Mapping", desc: "Map activities to SA laws: POPIA, OHS Act, Labour Laws" },
          { title: "Workflow Enforcement", desc: "Automate approval chains and escalation workflows" },
          { title: "Authority Matrix", desc: "Define decision-making authority and delegation rules" },
          { title: "Board Reporting", desc: "Generate governance reports for board oversight" },
        ].map((item, i) => (
          <div key={i} className="glass-card p-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(8px)" }}
            >
              <Scale className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-foreground text-sm">{item.title}</h3>
            <p className="text-muted-foreground text-xs mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
