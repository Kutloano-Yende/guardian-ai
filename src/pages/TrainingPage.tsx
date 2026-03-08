import { GraduationCap, BookOpen, Award, Users } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

const courses = [
  { title: "POPIA Compliance", desc: "Data protection and privacy regulations training", progress: 75, enrolled: 45 },
  { title: "OHS Act Awareness", desc: "Occupational health and safety requirements", progress: 60, enrolled: 38 },
  { title: "Incident Reporting", desc: "How to identify and report incidents effectively", progress: 90, enrolled: 52 },
  { title: "Risk Assessment", desc: "Understanding risk identification and mitigation", progress: 45, enrolled: 30 },
  { title: "Audit Preparation", desc: "Preparing for internal and external audits", progress: 30, enrolled: 22 },
  { title: "Governance Policies", desc: "Understanding company policies and procedures", progress: 55, enrolled: 35 },
];

const avgProgress = Math.round(courses.reduce((s, c) => s + c.progress, 0) / courses.length);
const totalEnrolled = courses.reduce((s, c) => s + c.enrolled, 0);
const completedCourses = courses.filter((c) => c.progress >= 80).length;

export default function TrainingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Training & Awareness</h1>
        <p className="text-muted-foreground mt-1">Educate staff on policies, compliance, and risk awareness</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Courses" value={courses.length} icon={BookOpen} color="primary" subtitle="Available" />
        <StatCard title="Avg Progress" value={`${avgProgress}%`} icon={GraduationCap} color="secondary" subtitle="Across all courses" />
        <StatCard title="Near Complete" value={completedCourses} icon={Award} color="secondary" subtitle="≥80% progress" />
        <StatCard title="Total Enrolled" value={totalEnrolled} icon={Users} color="primary" subtitle="Staff participating" />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
            >
              <GraduationCap className="w-5 h-5 text-secondary" />
            </div>
            <h3 className="font-display font-semibold text-foreground text-sm">{item.title}</h3>
            <p className="text-muted-foreground text-xs mt-1">{item.desc}</p>
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{item.progress}% complete</span>
                <span>{item.enrolled} enrolled</span>
              </div>
              <Progress value={item.progress} className="h-1.5" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
