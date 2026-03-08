import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { ComplianceRecord } from "@/lib/grc-store";

interface ComplianceDonutProps {
  records: ComplianceRecord[];
}

const STATUS_CONFIG = [
  { key: "compliant", label: "Compliant", color: "hsl(165, 45%, 45%)" },
  { key: "non_compliant", label: "Non-Compliant", color: "hsl(0, 65%, 55%)" },
  { key: "under_review", label: "Under Review", color: "hsl(40, 95%, 50%)" },
];

const GlassTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs font-medium text-white shadow-lg"
      style={{ background: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(8px)" }}>
      {payload[0].name}: {payload[0].value}
    </div>
  );
};

export function ComplianceDonut({ records }: ComplianceDonutProps) {
  const chartData = STATUS_CONFIG.map((s) => ({
    name: s.label,
    value: records.filter((r) => r.status === s.key).length,
    color: s.color,
  })).filter((d) => d.value > 0);

  const total = records.length;
  const compliantPct = total > 0 ? Math.round((records.filter((r) => r.status === "compliant").length / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-5"
    >
      <h3 className="font-display font-semibold text-foreground mb-4">Compliance Status</h3>
      {total === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">No compliance records yet.</p>
      ) : (
        <div className="relative h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<GlassTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <span className="text-2xl font-bold text-foreground">{compliantPct}%</span>
              <br />
              <span className="text-[10px] text-muted-foreground">Compliant</span>
            </div>
          </div>
        </div>
      )}
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2">
        {STATUS_CONFIG.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
            <span className="text-[11px] text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
