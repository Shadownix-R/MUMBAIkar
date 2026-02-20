import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Role } from "@/data/mockData";
import {
  LayoutDashboard, Droplets, GitBranch, Zap, Bus, BrainCircuit,
  ChevronLeft, ChevronRight, Bell, LogOut, Map, FileUp, ClipboardList
} from "lucide-react";

interface SidebarProps {
  role: Role;
  activeModule: string;
  setActiveModule: (m: string) => void;
  onLogout: () => void;
  alertCount: number;
  requestCount?: number;
}

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, roles: ["citizen", "officer", "admin"] },
  { id: "map", label: "Map View", icon: Map, roles: ["citizen", "officer", "admin"] },
  { id: "dam", label: "Dam Monitor", icon: Droplets, roles: ["officer", "admin"] },
  { id: "bridge", label: "Bridge Monitor", icon: GitBranch, roles: ["officer", "admin"] },
  { id: "transformer", label: "Power Grid", icon: Zap, roles: ["officer", "admin"] },
  { id: "transport", label: "Transport", icon: Bus, roles: ["citizen", "officer", "admin"] },
  { id: "ai", label: "AI Predictions", icon: BrainCircuit, roles: ["officer", "admin"] },
  { id: "upload", label: "Upload Docs", icon: FileUp, roles: ["officer"] },
  { id: "approvals", label: "Approvals", icon: ClipboardList, roles: ["admin"] },
  { id: "alerts", label: "Alerts", icon: Bell, roles: ["citizen", "officer", "admin"] },
];

const roleColors: Record<Role, string> = {
  citizen: "text-primary bg-primary/10",
  officer: "text-warning bg-warning/10",
  admin: "text-destructive bg-destructive/10",
};

const roleLabels: Record<Role, string> = {
  citizen: "CITIZEN",
  officer: "GOV. OFFICER",
  admin: "SYS. ADMIN",
};

export default function Sidebar({ role, activeModule, setActiveModule, onLogout, alertCount, requestCount = 0 }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const accessibleItems = navItems.filter(item => item.roles.includes(role));

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative flex flex-col bg-sidebar border-r border-sidebar-border h-full z-20 overflow-hidden flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-sidebar-border flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse-glow" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
            <div className="text-xs font-bold text-foreground leading-tight">MUMBAI</div>
            <div className="text-[10px] text-muted-foreground leading-tight">Smart City OS</div>
          </motion.div>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-3 py-2 border-b border-sidebar-border">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${roleColors[role]}`}>
            {roleLabels[role]}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {accessibleItems.map(item => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          const hasAlert = item.id === "alerts" && alertCount > 0;
          const hasRequest = item.id === "approvals" && requestCount > 0;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`
                w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 group
                ${isActive
                  ? "bg-sidebar-accent text-sidebar-primary font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                }
              `}
            >
              <div className="relative flex-shrink-0">
                <Icon className="h-4 w-4" />
                {(hasAlert || hasRequest) && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
                )}
              </div>
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {!collapsed && hasAlert && (
                <span className="ml-auto text-[10px] bg-destructive text-destructive-foreground rounded-full px-1.5 py-0.5 font-bold">
                  {alertCount}
                </span>
              )}
              {!collapsed && hasRequest && (
                <span className="ml-auto text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 font-bold">
                  {requestCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Switch Role</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3 top-16 w-6 h-6 bg-sidebar border border-sidebar-border rounded-full flex items-center justify-center hover:bg-sidebar-accent transition-all z-30"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </motion.aside>
  );
}
