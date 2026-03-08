import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { Risk } from "@/lib/grc-store";

interface RiskTrendChartProps {
  risks: Risk[];
}

const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs font-medium text-white shadow-lg"
      style={{ background: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(8px)" }}>
      <p className="mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export function RiskTrendChart({ risks }: RiskTrendChartProps) {
  // Group risks by month
  const monthMap = new Map<string, { open: number; resolved: number }>();
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
    monthMap.set(key, { open: 0, resolved: 0 });
  }

  risks.forEach((r) => {
    const d = new Date(r.createdAt);
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
    if (monthMap.has(key)) {
      const entry = monthMap.get(key)!;
      if (r.status === "resolved" || r.status === "closed") entry.resolved++;
      else entry.open++;
    }
  });

  const data = Array.from(monthMap, ([month, v]) => ({ month, ...v }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass-card p-5"
    >
      <h3 className="font-display font-semibold text-foreground mb-4">Risk Trend (6 months)</h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="openGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(25, 90%, 55%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(25, 90%, 55%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(165, 45%, 45%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(165, 45%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(215, 12%, 50%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(215, 12%, 50%)" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<GlassTooltip />} />
            <Area type="monotone" dataKey="open" name="Open" stroke="hsl(25, 90%, 55%)" fill="url(#openGrad)" strokeWidth={2} animationDuration={800} />
            <Area type="monotone" dataKey="resolved" name="Resolved" stroke="hsl(165, 45%, 45%)" fill="url(#resolvedGrad)" strokeWidth={2} animationDuration={800} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(25, 90%, 55%)" }} />
          <span className="text-[11px] text-muted-foreground">Open</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(165, 45%, 45%)" }} />
          <span className="text-[11px] text-muted-foreground">Resolved</span>
        </div>
      </div>
    </motion.div>
  );
}
