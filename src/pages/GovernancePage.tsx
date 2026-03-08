import { Scale, Shield, Users, FileText, GitBranch, BarChart3 } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { useGRC } from "@/lib/grc-store";
import { motion } from "framer-motion";

const governanceAreas = [
  { title: "Policy Management", desc: "Create, review, and enforce organizational policies and SOPs", icon: FileText },
  { title: "Role Assignments", desc: "Define roles, responsibilities, and segregation of duties", icon: Users },
  { title: "Regulatory Mapping", desc: "Map activities to SA laws: POPIA, OHS Act, Labour Laws", icon: Scale },
  { title: "Workflow Enforcement", desc: "Automate approval chains and escalation workflows", icon: GitBranch },
  { title: "Authority Matrix", desc: "Define decision-making authority and delegation rules", icon: Shield },
  { title: "Board Reporting", desc: "Generate governance reports for board oversight", icon: BarChart3 },
];

export default function GovernancePage() {
  const { data } = useGRC();

  const totalPolicies = data.compliance.length;
  const totalRoles = new Set(data.assets.map((a) => a.owner).concat(data.risks.map((r) => r.owner))).size;
  const regulatoryItems = data.compliance.filter((c) => c.type === "sa_law" || c.type === "international_standard").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Governance</h1>
        <p className="text-muted-foreground mt-1">Define policies, roles, and authority matrices</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Policies Tracked" value={totalPolicies} icon={FileText} color="primary" subtitle="Across compliance" />
        <StatCard title="Unique Owners" value={totalRoles} icon={Users} color="secondary" subtitle="Assigned responsibility" />
        <StatCard title="Regulatory Items" value={regulatoryItems} icon={Scale} color="severity-medium" subtitle="SA Law & Int'l Standards" />
        <StatCard title="Governance Areas" value={governanceAreas.length} icon={Shield} color="primary" subtitle="Active modules" />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {governanceAreas.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
            >
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-foreground text-sm">{item.title}</h3>
            <p className="text-muted-foreground text-xs mt-1">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
