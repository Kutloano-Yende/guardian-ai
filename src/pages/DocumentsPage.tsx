import { FileText, Upload, FolderOpen, FileCheck } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { useGRC } from "@/lib/grc-store";
import { motion } from "framer-motion";

export default function DocumentsPage() {
  const { data } = useGRC();

  // Derive document stats from linked data
  const auditDocs = data.audits.filter((a) => a.findings).length;
  const complianceDocs = data.compliance.length;
  const totalLinked = auditDocs + complianceDocs;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Document Management</h1>
        <p className="text-muted-foreground mt-1">Store policies, SOPs, compliance evidence, and reports</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Linked Documents" value={totalLinked} icon={FileText} color="primary" subtitle="From audits & compliance" />
        <StatCard title="Audit Findings" value={auditDocs} icon={FileCheck} color="secondary" subtitle="With documentation" />
        <StatCard title="Compliance Policies" value={complianceDocs} icon={FolderOpen} color="primary" subtitle="Tracked" />
        <StatCard title="Upload Ready" value="—" icon={Upload} color="severity-medium" subtitle="Storage coming soon" />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "Policy Documents", desc: "Internal policies, SOPs, and procedures", count: complianceDocs },
          { title: "Audit Evidence", desc: "Audit findings, reports, and evidence files", count: auditDocs },
          { title: "Compliance Certificates", desc: "Regulatory certificates and attestations", count: 0 },
          { title: "Risk Assessments", desc: "Risk analysis reports and mitigation plans", count: data.risks.length },
          { title: "Incident Reports", desc: "Incident documentation and root cause analyses", count: data.incidents.length },
          { title: "Training Materials", desc: "Training content, presentations, and records", count: 6 },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <span className="text-lg font-bold text-foreground">{item.count}</span>
            </div>
            <h3 className="font-display font-semibold text-foreground text-sm">{item.title}</h3>
            <p className="text-muted-foreground text-xs mt-1">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
