import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-provider";
import { 
  Sparkles, AlertTriangle, Clock, Shield, FileWarning, 
  BarChart3, ChevronRight, RefreshCw, Zap 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Alert {
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  module: "incidents" | "actions" | "compliance" | "risks" | "performance";
  recommendation: string;
}

interface AlertsResponse {
  alerts: Alert[];
  summary: {
    criticalIncidents: number;
    overdueActions: number;
    nonCompliantItems: number;
    highRisks: number;
    offTrackKPIs: number;
  };
  generatedAt: string;
}

const moduleIcons: Record<string, React.ElementType> = {
  incidents: FileWarning,
  actions: Clock,
  compliance: Shield,
  risks: AlertTriangle,
  performance: BarChart3,
};

const moduleRoutes: Record<string, string> = {
  incidents: "/incidents",
  actions: "/actions",
  compliance: "/compliance",
  risks: "/risks",
  performance: "/performance",
};

const severityColors: Record<string, string> = {
  critical: "bg-severity-critical/20 text-severity-critical border-severity-critical/30",
  high: "bg-severity-high/20 text-severity-high border-severity-high/30",
  medium: "bg-severity-medium/20 text-severity-medium border-severity-medium/30",
  low: "bg-severity-low/20 text-severity-low border-severity-low/30",
};

const severityGlow: Record<string, string> = {
  critical: "shadow-[0_0_20px_rgba(239,68,68,0.3)]",
  high: "shadow-[0_0_15px_rgba(249,115,22,0.25)]",
  medium: "",
  low: "",
};

export function ProactiveAlertsWidget() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<AlertsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedAlert, setExpandedAlert] = useState<number | null>(null);

  const fetchAlerts = async () => {
    if (!session?.access_token) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/grc-proactive-alerts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          setError("Rate limited. Try again shortly.");
        } else if (response.status === 402) {
          setError("AI credits exhausted.");
        } else {
          setError("Failed to generate alerts.");
        }
        return;
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError("Network error. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.access_token) {
      fetchAlerts();
    }
  }, [session?.access_token]);

  const totalIssues = data?.summary 
    ? data.summary.criticalIncidents + data.summary.overdueActions + 
      data.summary.nonCompliantItems + data.summary.highRisks + data.summary.offTrackKPIs
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-5 relative overflow-hidden"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-foreground">AI Proactive Alerts</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAlerts}
            disabled={loading}
            className="h-7 px-2 text-xs"
          >
            <RefreshCw className={cn("w-3 h-3 mr-1", loading && "animate-spin")} />
            {loading ? "Analyzing..." : "Refresh"}
          </Button>
        </div>

        {/* Content */}
        {error ? (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchAlerts} className="mt-3">
              Retry
            </Button>
          </div>
        ) : loading && !data ? (
          <div className="py-8 flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              <Zap className="w-4 h-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-sm text-muted-foreground">Analyzing GRC data...</p>
          </div>
        ) : !data || data.alerts.length === 0 ? (
          <div className="py-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/20 mb-3">
              <Shield className="w-6 h-6 text-secondary" />
            </div>
            <p className="text-sm font-medium text-foreground">All Clear</p>
            <p className="text-xs text-muted-foreground mt-1">No critical issues detected</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {data.alerts.map((alert, idx) => {
                const Icon = moduleIcons[alert.module] || AlertTriangle;
                const isExpanded = expandedAlert === idx;

                return (
                  <motion.div
                    key={idx}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                    className={cn(
                      "rounded-xl border p-3 cursor-pointer transition-all duration-200",
                      severityColors[alert.severity],
                      severityGlow[alert.severity],
                      isExpanded && "ring-1 ring-white/20"
                    )}
                    onClick={() => setExpandedAlert(isExpanded ? null : idx)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-1.5 rounded-lg shrink-0",
                        alert.severity === "critical" && "bg-severity-critical/30",
                        alert.severity === "high" && "bg-severity-high/30",
                        alert.severity === "medium" && "bg-severity-medium/30",
                        alert.severity === "low" && "bg-severity-low/30"
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{alert.title}</p>
                          <ChevronRight className={cn(
                            "w-4 h-4 text-muted-foreground transition-transform shrink-0",
                            isExpanded && "rotate-90"
                          )} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 capitalize">{alert.module}</p>
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <p className="text-xs text-foreground/80 mt-2 leading-relaxed">
                                {alert.description}
                              </p>
                              <div className="mt-2 pt-2 border-t border-white/10">
                                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                                  Recommended Action
                                </p>
                                <p className="text-xs text-foreground/90">{alert.recommendation}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Summary footer */}
            {data.summary && totalIssues > 0 && (
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/10">
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  {data.summary.criticalIncidents > 0 && (
                    <span className="flex items-center gap-1">
                      <FileWarning className="w-3 h-3 text-severity-critical" />
                      {data.summary.criticalIncidents}
                    </span>
                  )}
                  {data.summary.overdueActions > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-severity-high" />
                      {data.summary.overdueActions}
                    </span>
                  )}
                  {data.summary.nonCompliantItems > 0 && (
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-severity-medium" />
                      {data.summary.nonCompliantItems}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(data.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
