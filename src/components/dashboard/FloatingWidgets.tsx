import { motion } from "framer-motion";
import { SystemMetrics, AQIZone } from "@/data/mockData";
import { Thermometer, Wind, AlertTriangle, Car } from "lucide-react";

interface FloatingWidgetsProps {
  metrics: SystemMetrics;
  aqiZones: AQIZone[];
}

function getAQIColor(aqi: number) {
  if (aqi <= 50) return { text: "text-success", stroke: "#10b981", label: "Good" };
  if (aqi <= 100) return { text: "text-warning", stroke: "#f59e0b", label: "Moderate" };
  if (aqi <= 150) return { text: "text-orange-400", stroke: "#f97316", label: "Unhealthy" };
  if (aqi <= 200) return { text: "text-destructive", stroke: "#ef4444", label: "Very Unhealthy" };
  return { text: "text-purple-400", stroke: "#a855f7", label: "Hazardous" };
}

function getTrafficColor(index: number) {
  if (index < 30) return { text: "text-success", label: "Low" };
  if (index < 55) return { text: "text-warning", label: "Moderate" };
  if (index < 75) return { text: "text-orange-400", label: "High" };
  return { text: "text-destructive", label: "Severe" };
}

function AQIRing({ aqi }: { aqi: number }) {
  const { text, stroke, label } = getAQIColor(aqi);
  const pct = Math.min(aqi / 300, 1);
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct);

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
        <circle
          cx="32" cy="32" r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="relative text-center">
        <div className={`text-xs font-bold ${text} mono`}>{aqi}</div>
        <div className="text-[8px] text-muted-foreground">AQI</div>
      </div>
    </div>
  );
}

export default function FloatingWidgets({ metrics, aqiZones }: FloatingWidgetsProps) {
  const aqiColor = getAQIColor(metrics.aqiOverall);
  const trafficColor = getTrafficColor(metrics.trafficIndex);
  const { weather } = metrics;

  return (
    <div className="absolute bottom-6 left-4 z-[1000] flex flex-col gap-2">
      {/* AQI Widget */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel rounded-xl p-3 flex items-center gap-3 min-w-[160px]"
      >
        <AQIRing aqi={metrics.aqiOverall} />
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Air Quality</div>
          <div className={`text-sm font-semibold ${aqiColor.text}`}>{aqiColor.label}</div>
          <div className="text-[10px] text-muted-foreground">City Average</div>
        </div>
      </motion.div>

      {/* Temperature Widget */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-panel rounded-xl p-3 flex items-center gap-3"
      >
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Thermometer className="h-4 w-4 text-primary" />
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Temperature</div>
          <div className="text-sm font-bold text-foreground mono">
            {weather.temperature}°C
            <span className="text-[10px] text-muted-foreground ml-1">feels {weather.feelsLike}°</span>
          </div>
          <div className="text-[10px] text-muted-foreground">{weather.condition}</div>
        </div>
      </motion.div>

      {/* Traffic Widget */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-panel rounded-xl p-3 flex items-center gap-3"
      >
        <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
          <Car className="h-4 w-4 text-destructive" />
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Traffic Index</div>
          <div className={`text-sm font-bold mono ${trafficColor.text}`}>
            {metrics.trafficIndex}
            <span className="text-xs text-muted-foreground ml-1">/ 100</span>
          </div>
          <div className={`text-[10px] ${trafficColor.text}`}>{trafficColor.label}</div>
        </div>
      </motion.div>

      {/* Alert Widget */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className={`glass-panel rounded-xl p-3 flex items-center gap-3 ${
          metrics.alertCount > 0 ? "border-destructive/40" : ""
        }`}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          metrics.alertCount > 0 ? "bg-destructive/10" : "bg-muted"
        }`}>
          <AlertTriangle className={`h-4 w-4 ${metrics.alertCount > 0 ? "text-destructive" : "text-muted-foreground"}`} />
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Active Alerts</div>
          <div className={`text-sm font-bold mono ${metrics.alertCount > 0 ? "text-destructive" : "text-success"}`}>
            {metrics.alertCount}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {metrics.alertCount > 0 ? "Require attention" : "All clear"}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
