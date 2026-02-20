import { motion } from "framer-motion";
import {
  DamData, BridgeData, TransformerData, TrafficZone,
  AQIZone, BusRoute, TrainRoute, Role, WeatherData
} from "@/data/mockData";
import { Droplets, GitBranch, Zap, Wind, Car, Bus, Train, Thermometer, Droplet } from "lucide-react";

interface OverviewPanelProps {
  dams: DamData[];
  bridges: BridgeData[];
  transformers: TransformerData[];
  trafficZones: TrafficZone[];
  aqiZones: AQIZone[];
  busRoutes: BusRoute[];
  trainRoutes: TrainRoute[];
  weather: WeatherData;
  role: Role;
  onSelectModule: (id: string) => void;
}

function StatusDot({ status }: { status: "normal" | "warning" | "critical" }) {
  const colors = {
    normal: "bg-success",
    warning: "bg-warning",
    critical: "bg-destructive status-pulse",
  };
  return <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${colors[status]}`} />;
}

function MiniCard({
  icon: Icon, label, value, sub, status, onClick, color = "text-primary"
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  status?: "normal" | "warning" | "critical";
  onClick?: () => void;
  color?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: onClick ? 1.01 : 1 }}
      onClick={onClick}
      className={`glass-panel rounded-xl p-4 flex flex-col gap-2 ${onClick ? "cursor-pointer hover:border-primary/40" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div className={`w-8 h-8 rounded-lg bg-card flex items-center justify-center`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        {status && <StatusDot status={status} />}
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-xl font-bold text-foreground mono">{value}</div>
        {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
      </div>
    </motion.div>
  );
}

function getWorstStatus(items: Array<{ status: string }>): "normal" | "warning" | "critical" {
  if (items.some(i => i.status === "critical")) return "critical";
  if (items.some(i => i.status === "warning")) return "warning";
  return "normal";
}

export default function OverviewPanel({
  dams, bridges, transformers, trafficZones, aqiZones,
  busRoutes, trainRoutes, weather, role, onSelectModule
}: OverviewPanelProps) {
  const avgAQI = Math.round(aqiZones.reduce((s, z) => s + z.aqi, 0) / aqiZones.length);
  const avgTraffic = Math.round(trafficZones.reduce((s, z) => s + z.intensity, 0) / trafficZones.length);
  const totalBuses = busRoutes.reduce((s, r) => s + r.activeBuses, 0);
  const totalTrains = trainRoutes.reduce((s, r) => s + r.activeTrains, 0);
  const avgBusDelay = Math.round(busRoutes.reduce((s, r) => s + r.delayPercent, 0) / busRoutes.length);
  const avgTrainDelay = Math.round(trainRoutes.reduce((s, r) => s + r.delayPercent, 0) / trainRoutes.length);

  const aqiStatus: "normal" | "warning" | "critical" = avgAQI > 150 ? "critical" : avgAQI > 100 ? "warning" : "normal";
  const trafficStatus: "normal" | "warning" | "critical" = avgTraffic > 75 ? "critical" : avgTraffic > 50 ? "warning" : "normal";

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">System Overview</h2>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Mumbai Metro Region</span>
      </div>

      {/* Weather row */}
      <div className="glass-panel rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Current Weather</span>
          </div>
          <span className="text-xs text-muted-foreground">{weather.condition}</span>
        </div>
        <div className="grid grid-cols-4 gap-3 mt-3">
          {[
            { label: "Temp", value: `${weather.temperature}°C` },
            { label: "Humidity", value: `${weather.humidity}%` },
            { label: "Wind", value: `${weather.windSpeed} km/h` },
            { label: "Rain", value: `${weather.rainfall} mm` },
          ].map(item => (
            <div key={item.label} className="text-center">
              <div className="text-base font-bold text-foreground mono">{item.value}</div>
              <div className="text-[10px] text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Environment metrics */}
      <div className="grid grid-cols-2 gap-3">
        <MiniCard
          icon={Wind}
          label="Avg AQI"
          value={avgAQI}
          sub={aqiZones[0]?.category}
          status={aqiStatus}
          color="text-warning"
        />
        <MiniCard
          icon={Car}
          label="Traffic Index"
          value={avgTraffic}
          sub={avgTraffic > 70 ? "Heavy congestion" : avgTraffic > 45 ? "Moderate flow" : "Smooth"}
          status={trafficStatus}
          color="text-destructive"
        />
      </div>

      {/* Transport */}
      <div className="grid grid-cols-2 gap-3">
        <MiniCard
          icon={Bus}
          label="Active Buses"
          value={totalBuses}
          sub={`Avg delay ${avgBusDelay}%`}
          color="text-primary"
          onClick={() => onSelectModule("transport")}
        />
        <MiniCard
          icon={Train}
          label="Active Trains"
          value={totalTrains}
          sub={`Avg delay ${avgTrainDelay}%`}
          color="text-primary"
          onClick={() => onSelectModule("transport")}
        />
      </div>

      {/* Infrastructure (officer/admin only) */}
      {role !== "citizen" && (
        <>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider pt-1">Infrastructure Status</div>
          <div className="grid grid-cols-3 gap-2">
            <MiniCard
              icon={Droplets}
              label="Dams"
              value={dams.length}
              sub={`${dams.filter(d => d.status !== "normal").length} alerts`}
              status={getWorstStatus(dams)}
              color="text-primary"
              onClick={() => onSelectModule("dam")}
            />
            <MiniCard
              icon={GitBranch}
              label="Bridges"
              value={bridges.length}
              sub={`${bridges.filter(b => b.status !== "normal").length} alerts`}
              status={getWorstStatus(bridges)}
              color="text-warning"
              onClick={() => onSelectModule("bridge")}
            />
            <MiniCard
              icon={Zap}
              label="Transformers"
              value={transformers.length}
              sub={`${transformers.filter(t => t.status !== "normal").length} alerts`}
              status={getWorstStatus(transformers)}
              color="text-destructive"
              onClick={() => onSelectModule("transformer")}
            />
          </div>
        </>
      )}
    </div>
  );
}
