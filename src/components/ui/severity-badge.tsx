import { cn } from "@/lib/utils";

const severityConfig = {
  critical: "bg-severity-critical/15 text-severity-critical border-severity-critical/20",
  high: "bg-severity-high/15 text-severity-high border-severity-high/20",
  medium: "bg-severity-medium/15 text-severity-medium border-severity-medium/20",
  low: "bg-severity-low/15 text-severity-low border-severity-low/20",
};

const statusConfig = {
  open: "bg-status-open/15 text-status-open border-status-open/20",
  in_progress: "bg-status-progress/15 text-status-progress border-status-progress/20",
  resolved: "bg-status-resolved/15 text-status-resolved border-status-resolved/20",
  closed: "bg-status-closed/15 text-status-closed border-status-closed/20",
};

export function SeverityBadge({ severity }: { severity: keyof typeof severityConfig }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border", severityConfig[severity])}>
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  );
}

export function StatusBadge({ status }: { status: keyof typeof statusConfig }) {
  const label = status.replace("_", " ");
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize", statusConfig[status])}>
      {label}
    </span>
  );
}
