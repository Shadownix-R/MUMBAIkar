import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DamData, BridgeData, TransformerData, TrafficZone, AQIZone,
  BusRoute, TrainRoute, Role
} from "@/data/mockData";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, LineChart, Line
} from "recharts";
import { ChevronUp, ChevronDown, BarChart3 } from "lucide-react";

interface BottomDrawerProps {
  dams: DamData[];
  bridges: BridgeData[];
  transformers: TransformerData[];
  trafficZones: TrafficZone[];
  aqiZones: AQIZone[];
  busRoutes: BusRoute[];
  trainRoutes: TrainRoute[];
  role: Role;
}

// Generates sparkline-style history from current value
function genHistory(current: number, points = 12, range = 10): { t: string; v: number }[] {
  const data = [];
  let val = current;
  for (let i = points; i >= 0; i--) {
    val = Math.max(0, Math.min(100, val + (Math.random() - 0.5) * range));
    data.push({ t: `${i * 5}m`, v: Math.round(val * 10) / 10 });
  }
  return data.reverse();
}

const CUSTOM_TOOLTIP_STYLE = {
  backgroundColor: "hsl(222, 40%, 9%)",
  border: "1px solid hsl(220, 25%, 15%)",
  borderRadius: 8,
  fontSize: 11,
  color: "hsl(210, 30%, 92%)",
};

type TabId = "traffic" | "aqi" | "infrastructure" | "transport";

export default function BottomDrawer({
  dams, bridges, transformers, trafficZones, aqiZones, busRoutes, trainRoutes, role
}: BottomDrawerProps) {
  const [open, setOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("infrastructure");

  const tabs: { id: TabId; label: string; roles: Role[] }[] = [
    { id: "infrastructure", label: "Infrastructure", roles: ["officer", "admin"] },
    { id: "traffic", label: "Traffic", roles: ["citizen", "officer", "admin"] },
    { id: "aqi", label: "Air Quality", roles: ["citizen", "officer", "admin"] },
    { id: "transport", label: "Transport", roles: ["citizen", "officer", "admin"] },
  ];

  const visibleTabs = tabs.filter(t => t.roles.includes(role));
  const effectiveTab = visibleTabs.find(t => t.id === activeTab) ? activeTab : visibleTabs[0]?.id;

  const trafficData = trafficZones.map(z => ({ name: z.name.split(" ").slice(-1)[0], value: z.intensity }));
  const aqiData = aqiZones.map(z => ({ name: z.name, value: z.aqi }));
  const infraData = [
    { name: "Dam WL", value: Math.round(dams.reduce((s, d) => s + d.waterLevel, 0) / dams.length) },
    { name: "Bridge Load", value: Math.round(bridges.reduce((s, b) => s + b.loadPercent, 0) / bridges.length) },
    { name: "TF Load", value: Math.round(transformers.reduce((s, t) => s + t.loadPercent, 0) / transformers.length) },
    { name: "Overflow Risk", value: Math.round(dams.reduce((s, d) => s + d.overflowRisk * 100, 0) / dams.length) },
    { name: "Fail Risk", value: Math.round(transformers.reduce((s, t) => s + t.failureProbability * 100, 0) / transformers.length) },
  ];

  const transportData = [
    ...busRoutes.map(r => ({ name: r.routeNo, type: "Bus", delay: r.delayPercent, efficiency: r.efficiency })),
    ...trainRoutes.map(r => ({ name: r.name.split(" ")[0], type: "Train", delay: r.delayPercent, efficiency: r.efficiency })),
  ];

  return (
    <motion.div
      animate={{ height: open ? 200 : 40 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-card border-t border-border overflow-hidden flex-shrink-0"
    >
      {/* Handle */}
      <div
        className="h-10 flex items-center justify-between px-4 cursor-pointer hover:bg-secondary/30 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground">Analytics Panel</span>
          <span className="text-[10px] text-muted-foreground">— Live Charts</span>
        </div>
        <div className="flex items-center gap-3">
          {open && visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={(e) => { e.stopPropagation(); setActiveTab(tab.id); }}
              className={`text-xs px-2 py-0.5 rounded transition-all ${
                effectiveTab === tab.id
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
          {open ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
      </div>

      {/* Chart area */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 pb-3 h-[160px]"
          >
            {effectiveTab === "traffic" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trafficData} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 25% 15%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215 20% 50%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(215 20% 50%)" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                  <Bar dataKey="value" name="Intensity %" fill="hsl(0 72% 55%)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
            {effectiveTab === "aqi" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aqiData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 25% 15%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215 20% 50%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(215 20% 50%)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                  <Bar dataKey="value" name="AQI" fill="hsl(38 92% 52%)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
            {effectiveTab === "infrastructure" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={infraData} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 25% 15%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215 20% 50%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(215 20% 50%)" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                  <Bar dataKey="value" name="%" fill="hsl(195 90% 50%)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
            {effectiveTab === "transport" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transportData} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 25% 15%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215 20% 50%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(215 20% 50%)" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                  <Bar dataKey="efficiency" name="Efficiency %" fill="hsl(195 90% 50%)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="delay" name="Delay %" fill="hsl(38 92% 52%)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
