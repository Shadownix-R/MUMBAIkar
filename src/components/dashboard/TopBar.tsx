import { useState, useEffect } from "react";
import { Role } from "@/data/mockData";
import { Bell, Wifi, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TopBarProps {
  role: Role;
  alertCount: number;
  onShowAlerts: () => void;
}

const roleConfig: Record<Role, { label: string; color: string; pulse: string }> = {
  citizen: { label: "Citizen View", color: "text-primary border-primary/30 bg-primary/10", pulse: "bg-primary" },
  officer: { label: "Government Officer", color: "text-warning border-warning/30 bg-warning/10", pulse: "bg-warning" },
  admin: { label: "System Administrator", color: "text-destructive border-destructive/30 bg-destructive/10", pulse: "bg-destructive" },
};

export default function TopBar({ role, alertCount, onShowAlerts }: TopBarProps) {
  const [time, setTime] = useState(new Date());
  const [prevAlertCount, setPrevAlertCount] = useState(alertCount);
  const [alertFlash, setAlertFlash] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (alertCount !== prevAlertCount) {
      setAlertFlash(true);
      setTimeout(() => setAlertFlash(false), 1000);
      setPrevAlertCount(alertCount);
    }
  }, [alertCount, prevAlertCount]);

  const rc = roleConfig[role];

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 flex-shrink-0 z-10">
      {/* Left: System name */}
      <div className="flex items-center gap-4">
        <div>
          <span className="text-foreground font-semibold text-sm">Mumbai Infrastructure Monitor</span>
          <span className="text-muted-foreground text-xs ml-2">— Live Dashboard</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wifi className="h-3 w-3 text-success" />
          <span className="text-success text-xs font-mono">LIVE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-success status-pulse" />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Clock */}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span className="text-mono text-xs tabular-nums">
            {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        </div>

        {/* Date */}
        <span className="text-muted-foreground text-xs hidden sm:block">
          {time.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </span>

        {/* Role badge */}
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${rc.color}`}>
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${rc.pulse} mr-1.5 status-pulse`} />
          {rc.label}
        </span>

        {/* Alert bell */}
        <button
          onClick={onShowAlerts}
          className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
            alertFlash ? "bg-destructive/20" : "hover:bg-secondary"
          }`}
        >
          <Bell className={`h-4 w-4 ${alertCount > 0 ? "text-destructive" : "text-muted-foreground"}`} />
          <AnimatePresence>
            {alertCount > 0 && (
              <motion.span
                key={alertCount}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center"
              >
                {alertCount}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </header>
  );
}
