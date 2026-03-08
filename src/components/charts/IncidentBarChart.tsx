import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { Incident } from "@/lib/grc-store";

interface IncidentBarChartProps {
  incidents: Incident[];
}

const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs font-medium text-white shadow-lg"
      style={{ background: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(8px)" }}>
      <p className="mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.fill }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export function IncidentBarChart({ incidents }: IncidentBarChartProps) {
  const severityData = [
    { severity: "Critical", count: incidents.filter((i) => i.severity === "critical").length, fill: "hsl(0, 75%, 55%)" },
    { severity: "High", count: incidents.filter((i) => i.severity === "high").length, fill: "hsl(25, 90%, 55%)" },
    { severity: "Medium", count: incidents.filter((i) => i.severity === "medium").length, fill: "hsl(40, 95%, 50%)" },
    { severity: "Low", count: incidents.filter((i) => i.severity === "low").length, fill: "hsl(165, 45%, 45%)" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass-card p-5"
    >
      <h3 className="font-display font-semibold text-foreground mb-4">Incidents by Severity</h3>
      {incidents.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">No incidents recorded yet.</p>
      ) : (
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={severityData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="severity" tick={{ fontSize: 11, fill: "hsl(215, 12%, 50%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215, 12%, 50%)" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<GlassTooltip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
              <Bar dataKey="count" name="Incidents" radius={[6, 6, 0, 0]} animationDuration={800}>
                {severityData.map((entry, i) => (
                  <motion.rect key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
