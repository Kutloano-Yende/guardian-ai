import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Clock, AlertTriangle, Shield, FileWarning, ClipboardCheck, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "high" | "medium" | "low";
  module: string;
  route: string;
  dueDate: string;
  type: "overdue" | "due_today" | "due_soon";
}

const MODULE_ICONS: Record<string, React.ElementType> = {
  actions: Clock,
  incidents: FileWarning,
  audits: ClipboardCheck,
  compliance: Shield,
  risks: AlertTriangle,
};

const TYPE_LABELS: Record<string, string> = {
  overdue: "Overdue",
  due_today: "Due Today",
  due_soon: "Due in 3 days",
};

const SEVERITY_STYLES: Record<string, string> = {
  critical: "border-l-severity-critical bg-severity-critical/10",
  high: "border-l-severity-high bg-severity-high/10",
  medium: "border-l-severity-medium bg-severity-medium/10",
  low: "border-l-4 border-l-muted bg-muted/10",
};

export function NotificationBell() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);

  const checkDueDates = useCallback(async () => {
    if (!session?.access_token) return;

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const items: Notification[] = [];

    // Fetch actions, incidents, audits in parallel
    const [actionsRes, incidentsRes, auditsRes] = await Promise.all([
      supabase.from("actions").select("id, name, due_date, priority, status").neq("status", "resolved").neq("status", "closed"),
      supabase.from("incidents").select("id, name, deadline, severity, status").in("status", ["open", "in_progress"]),
      supabase.from("audits").select("id, name, end_date, status").neq("status", "completed"),
    ]);

    // Process actions
    (actionsRes.data || []).forEach((a) => {
      if (!a.due_date) return;
      const due = a.due_date;
      const type = due < today ? "overdue" : due === today ? "due_today" : due <= threeDaysLater ? "due_soon" : null;
      if (!type) return;
      const severity = type === "overdue" ? "critical" : type === "due_today" ? "high" : "medium";
      items.push({
        id: `action-${a.id}`,
        title: a.name,
        message: `Action "${a.name}" is ${TYPE_LABELS[type].toLowerCase()} (${a.due_date})`,
        severity,
        module: "Actions",
        route: "/actions",
        dueDate: a.due_date,
        type,
      });
    });

    // Process incidents
    (incidentsRes.data || []).forEach((i) => {
      if (!i.deadline) return;
      const due = i.deadline;
      const type = due < today ? "overdue" : due === today ? "due_today" : due <= threeDaysLater ? "due_soon" : null;
      if (!type) return;
      const severity = type === "overdue" ? "critical" : type === "due_today" ? "high" : "medium";
      items.push({
        id: `incident-${i.id}`,
        title: i.name,
        message: `Incident "${i.name}" deadline is ${TYPE_LABELS[type].toLowerCase()} (${i.deadline})`,
        severity,
        module: "Incidents",
        route: "/incidents",
        dueDate: i.deadline,
        type,
      });
    });

    // Process audits
    (auditsRes.data || []).forEach((a) => {
      if (!a.end_date) return;
      const due = a.end_date;
      const type = due < today ? "overdue" : due === today ? "due_today" : due <= threeDaysLater ? "due_soon" : null;
      if (!type) return;
      const severity = type === "overdue" ? "critical" : type === "due_today" ? "high" : "medium";
      items.push({
        id: `audit-${a.id}`,
        title: a.name,
        message: `Audit "${a.name}" end date is ${TYPE_LABELS[type].toLowerCase()} (${a.end_date})`,
        severity,
        module: "Audits",
        route: "/audits",
        dueDate: a.end_date,
        type,
      });
    });

    // Sort: overdue first, then due_today, then due_soon
    const priority = { overdue: 0, due_today: 1, due_soon: 2 };
    items.sort((a, b) => priority[a.type] - priority[b.type]);

    setNotifications(items);

    // Show toast for new critical/overdue items
    items
      .filter((n) => n.type === "overdue" && !dismissed.has(n.id))
      .slice(0, 3)
      .forEach((n) => {
        toast.error(n.message, {
          description: `Go to ${n.module} to resolve this.`,
          duration: 6000,
        });
      });
  }, [session?.access_token, dismissed]);

  useEffect(() => {
    if (session?.access_token) {
      checkDueDates();
      // Re-check every 60 seconds
      const interval = setInterval(checkDueDates, 60000);
      return () => clearInterval(interval);
    }
  }, [session?.access_token, checkDueDates]);

  const activeNotifications = notifications.filter((n) => !dismissed.has(n.id));
  const criticalCount = activeNotifications.filter((n) => n.severity === "critical" || n.severity === "high").length;

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed((prev) => new Set(prev).add(id));
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-2 rounded-xl transition-colors"
          style={{ background: "rgba(255,255,255,0.15)" }}
        >
          <Bell className={cn("w-5 h-5 text-muted-foreground", criticalCount > 0 && "text-severity-critical animate-pulse")} />
          {activeNotifications.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-severity-critical text-white text-[10px] font-bold flex items-center justify-center px-1">
              {activeNotifications.length}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto p-0">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          <p className="text-[10px] text-muted-foreground">
            {activeNotifications.length} active alert{activeNotifications.length !== 1 ? "s" : ""}
          </p>
        </div>
        {activeNotifications.length === 0 ? (
          <div className="py-8 text-center">
            <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No pending notifications</p>
          </div>
        ) : (
          <div className="py-1">
            {activeNotifications.map((n) => {
              const Icon = MODULE_ICONS[n.module.toLowerCase()] || AlertTriangle;
              return (
                <div
                  key={n.id}
                  onClick={() => {
                    navigate(n.route);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 border-l-4 cursor-pointer hover:bg-accent/50 transition-colors",
                    SEVERITY_STYLES[n.severity]
                  )}
                >
                  <Icon className="w-4 h-4 mt-0.5 shrink-0 text-foreground/70" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-foreground truncate">{n.title}</span>
                      <button
                        onClick={(e) => handleDismiss(n.id, e)}
                        className="shrink-0 p-0.5 rounded hover:bg-background/50"
                      >
                        <X className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{n.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        "text-[9px] uppercase font-bold px-1.5 py-0.5 rounded",
                        n.type === "overdue" && "bg-severity-critical/20 text-severity-critical",
                        n.type === "due_today" && "bg-severity-high/20 text-severity-high",
                        n.type === "due_soon" && "bg-severity-medium/20 text-severity-medium",
                      )}>
                        {TYPE_LABELS[n.type]}
                      </span>
                      <span className="text-[9px] text-muted-foreground">{n.module}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
