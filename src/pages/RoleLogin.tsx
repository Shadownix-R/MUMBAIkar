import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Role } from "@/data/mockData";
import {
  Building2, Shield, Users, ArrowRight, Zap, Droplets, Activity
} from "lucide-react";

interface RoleLoginProps {
  onLogin: (session: { role: Role; username?: string; displayName?: string }) => void;
}

const ADMIN_CREDENTIAL = {
  username: "admin",
  password: "admin123",
  displayName: "System Admin",
};

const OFFICER_CREDENTIALS = [
  { username: "officer01", password: "officer01", displayName: "Officer A" },
  { username: "officer02", password: "officer02", displayName: "Officer B" },
  { username: "officer03", password: "officer03", displayName: "Officer C" },
  { username: "officer04", password: "officer04", displayName: "Officer D" },
  { username: "officer05", password: "officer05", displayName: "Officer E" },
];

const roles = [
  {
    id: "citizen" as Role,
    title: "Citizen",
    description: "View public safety metrics, AQI levels, transport status, and general infrastructure health.",
    icon: Users,
    color: "primary",
    features: ["AQI & Weather", "Transport Status", "Public Alerts"],
  },
  {
    id: "officer" as Role,
    title: "Government Officer",
    description: "Access department data, trend analytics, predictive insights, and infrastructure module details.",
    icon: Shield,
    color: "warning",
    features: ["Predictive Analytics", "Trend Graphs", "Department Filtering", "Infrastructure Modules"],
  },
  {
    id: "admin" as Role,
    title: "System Admin",
    description: "Full system oversight, multi-department view, alert management, and all infrastructure data.",
    icon: Building2,
    color: "destructive",
    features: ["All Modules", "Alert Override", "Multi-dept View", "Raw Data Access", "Export Controls"],
  },
];

const colorMap = {
  primary: {
    border: "border-primary/40 hover:border-primary",
    badge: "bg-primary/10 text-primary",
    icon: "text-primary",
    ring: "ring-primary/30",
    glow: "shadow-glow",
    button: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
  warning: {
    border: "border-warning/40 hover:border-warning",
    badge: "bg-warning/10 text-warning",
    icon: "text-warning",
    ring: "ring-warning/30",
    glow: "shadow-glow-amber",
    button: "bg-warning text-warning-foreground hover:bg-warning/90",
  },
  destructive: {
    border: "border-destructive/40 hover:border-destructive",
    badge: "bg-destructive/10 text-destructive",
    icon: "text-destructive",
    ring: "ring-destructive/30",
    glow: "shadow-glow-red",
    button: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  },
};

export default function RoleLogin({ onLogin }: RoleLoginProps) {
  const [time, setTime] = useState(new Date());
  const [hoveredRole, setHoveredRole] = useState<Role | null>(null);
  const [loginRole, setLoginRole] = useState<Role | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleRoleClick = (role: Role) => {
    if (role === "citizen") {
      onLogin({ role });
      return;
    }
    setLoginRole(role);
    setUsername("");
    setPassword("");
    setError(null);
  };

  const handleSubmit = () => {
    if (!loginRole) return;

    const u = username.trim();
    const p = password;

    if (loginRole === "admin") {
      const ok = u === ADMIN_CREDENTIAL.username && p === ADMIN_CREDENTIAL.password;
      if (!ok) {
        setError("Invalid Admin credentials");
        return;
      }
      onLogin({ role: "admin", username: u, displayName: ADMIN_CREDENTIAL.displayName });
      return;
    }

    const officer = OFFICER_CREDENTIALS.find((o) => o.username === u && o.password === p);
    if (!officer) {
      setError("Invalid Officer credentials");
      return;
    }
    onLogin({ role: "officer", username: officer.username, displayName: officer.displayName });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-warning/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-5xl px-6"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-12 mt-8">
            <img
              src="/logo.jpeg"
              alt="MUMBAIkar"
              className="h-20 w-20 rounded-xl object-cover"
            />
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-3 tracking-tight">
            MUMBAIkar
          </h1>
          <p className="text-muted-foreground text-lg mb-1">
            Urban Infrastructure Monitoring System
          </p>
          <div className="text-mono text-sm text-primary/70">
            {time.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            {" · "}
            <span className="data-blink">{time.toLocaleTimeString("en-IN")}</span>
          </div>
        </div>

        {/* Role selector */}
        <div className="mb-6 text-center">
          <p className="text-muted-foreground text-sm uppercase tracking-widest">
            Select your access role to continue
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {roles.map((role, i) => {
            const colors = colorMap[role.color];
            const Icon = role.icon;
            const isHovered = hoveredRole === role.id;
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                onHoverStart={() => setHoveredRole(role.id)}
                onHoverEnd={() => setHoveredRole(null)}
                className={`
                  relative glass-panel rounded-xl p-6 cursor-pointer transition-all duration-300
                  border ${colors.border} ${isHovered ? colors.glow : ""}
                `}
                onClick={() => handleRoleClick(role.id)}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${colors.badge} flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 ${colors.icon}`} />
                </div>

                <h2 className="text-lg font-semibold text-foreground mb-2">{role.title}</h2>
                <p className="text-muted-foreground text-sm mb-5 leading-relaxed">{role.description}</p>

                {/* Features */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {role.features.map(f => (
                    <span key={f} className={`text-xs px-2 py-0.5 rounded-full ${colors.badge}`}>
                      {f}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${colors.button}`}
                    >
                      Enter as {role.title}
                      <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  )}
                </AnimatePresence>
                {!isHovered && (
                  <div className="h-[42px] flex items-center justify-center">
                    <span className={`text-sm ${colors.icon} opacity-60`}>Click to enter →</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-muted-foreground/40 text-xs">
            BRIHANMUMBAI MUNICIPAL CORPORATION · AI-POWERED INFRASTRUCTURE MONITORING · v2.4.1
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {loginRole && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center"
          >
            <div
              className="absolute inset-0 bg-background/70 backdrop-blur-sm"
              onClick={() => setLoginRole(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="relative w-full max-w-md glass-panel rounded-xl p-6 border border-panel-border"
            >
              <div className="text-center mb-5">
                <h3 className="text-lg font-semibold text-foreground">
                  {loginRole === "admin" ? "Admin Login" : "Government Officer Login"}
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Enter your ID and password
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">User ID</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-lg bg-background/40 border border-border/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder={loginRole === "admin" ? "admin" : "officer01"}
                    autoFocus
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg bg-background/40 border border-border/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="••••••••"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSubmit();
                    }}
                  />
                </div>

                {error && (
                  <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-2">
                    {error}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    className="flex-1 rounded-lg border border-border/70 bg-background/40 hover:bg-background/60 text-sm py-2"
                    onClick={() => setLoginRole(null)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm py-2"
                    onClick={handleSubmit}
                    type="button"
                  >
                    Login
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
