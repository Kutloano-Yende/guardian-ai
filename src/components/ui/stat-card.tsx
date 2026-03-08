import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  color?: "primary" | "secondary" | "destructive" | "severity-high" | "severity-medium";
}

export function StatCard({ title, value, subtitle, icon: Icon, color = "primary" }: StatCardProps) {
  const colorMap: Record<string, string> = {
    primary: "text-primary",
    secondary: "text-secondary",
    destructive: "text-destructive",
    "severity-high": "text-severity-high",
    "severity-medium": "text-severity-medium",
  };

  return (
    <div className="grc-stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-display font-bold mt-1 text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div
          className="p-2.5 rounded-xl"
          style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(8px)" }}
        >
          <Icon className={`w-5 h-5 ${colorMap[color]}`} />
        </div>
      </div>
    </div>
  );
}
