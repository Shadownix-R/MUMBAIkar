import { motion } from "framer-motion";
import { Alert, Role } from "@/data/mockData";
import { AlertTriangle, Info, CheckCircle, Clock } from "lucide-react";

interface AlertsPanelProps {
  alerts: Alert[];
  role: Role;
}

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/5",
    border: "border-l-destructive",
    badge: "bg-destructive/10 text-destructive",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning/5",
    border: "border-l-warning",
    badge: "bg-warning/10 text-warning",
  },
  info: {
    icon: Info,
    color: "text-primary",
    bg: "bg-primary/5",
    border: "border-l-primary",
    badge: "bg-primary/10 text-primary",
  },
};

function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (!(d instanceof Date) || isNaN(d.getTime())) return "Unknown time";
  
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export default function AlertsPanel({ alerts, role }: AlertsPanelProps) {
  const visible = role === "citizen"
    ? alerts.filter(a => a.severity !== "critical")
    : alerts;

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-foreground">System Alerts</h2>
        <span className="text-[10px] text-muted-foreground">{visible.length} total</span>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 gap-2">
          <CheckCircle className="h-8 w-8 text-success" />
          <p className="text-sm text-muted-foreground">No active alerts</p>
        </div>
      ) : (
        visible.map((alert, i) => {
          const sc = severityConfig[alert.severity];
          const Icon = sc.icon;
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`glass-panel rounded-lg p-3 border-l-2 ${sc.border} ${sc.bg}`}
            >
              <div className="flex items-start gap-2">
                <Icon className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${sc.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${sc.badge}`}>
                      {alert.severity}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />
                      {timeAgo(alert.timestamp)}
                    </div>
                  </div>
                  <p className="text-xs text-foreground mt-1 leading-relaxed">{alert.message}</p>
                  <span className="text-[10px] text-muted-foreground">{alert.source}</span>
                </div>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
}
