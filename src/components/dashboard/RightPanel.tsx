import { motion, AnimatePresence } from "framer-motion";
import { DamData, BridgeData, TransformerData, Role } from "@/data/mockData";
import { X, Droplets, GitBranch, Zap, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";

interface RightPanelProps {
  selectedMarker: { type: string; id: string } | null;
  dams: DamData[];
  bridges: BridgeData[];
  transformers: TransformerData[];
  role: Role;
  onClose: () => void;
}

function RingMeter({ value, max = 100, color, label, size = 80 }: {
  value: number; max?: number; color: string; label: string; size?: number;
}) {
  const pct = value / max;
  const radius = size / 2 - 6;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - pct);
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold mono" style={{ color }}>{Math.round(value)}</span>
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: "normal" | "warning" | "critical" }) {
  const config = {
    normal: { color: "bg-success/10 text-success border-success/30", icon: CheckCircle, label: "Normal" },
    warning: { color: "bg-warning/10 text-warning border-warning/30", icon: AlertTriangle, label: "Warning" },
    critical: { color: "bg-destructive/10 text-destructive border-destructive/30", icon: AlertTriangle, label: "Critical" },
  };
  const cfg = config[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${cfg.color}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
        <span>AI Confidence</span>
        <span className="mono text-primary">{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700"
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );
}

function DamPanel({ dam, role }: { dam: DamData; role: Role }) {
  const riskColor = dam.overflowRisk > 0.65 ? "#ef4444" : dam.overflowRisk > 0.35 ? "#f59e0b" : "#10b981";
  const rainfallRisk = dam.rainfallForecast > 20 ? "high" : dam.rainfallForecast > 10 ? "moderate" : "low";
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Droplets className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Dam Monitor</span>
          </div>
          <h3 className="text-base font-semibold text-foreground">{dam.name}</h3>
        </div>
        <StatusBadge status={dam.status} />
      </div>

      {/* Ring meters */}
      <div className="grid grid-cols-3 gap-2">
        <RingMeter value={dam.waterLevel} color="#06b6d4" label="Water Level %" />
        <RingMeter value={dam.overflowRisk * 100} color={riskColor} label="Overflow Risk %" />
        <RingMeter value={dam.stressIndex * 100} color="#f59e0b" label="Stress Index %" />
      </div>

      <div className="space-y-2">
        <div className="glass-panel rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Rainfall Forecast</span>
            <div className="flex items-center gap-1.5">
              <span className="text-mono font-bold text-sm text-foreground">{dam.rainfallForecast.toFixed(1)} mm</span>
              {rainfallRisk === "high" && <TrendingUp className="h-3 w-3 text-destructive" />}
            </div>
          </div>
          <div className="mt-1.5 h-1 bg-muted rounded-full">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                rainfallRisk === "high" ? "bg-destructive" : rainfallRisk === "moderate" ? "bg-warning" : "bg-success"
              }`}
              style={{ width: `${Math.min(100, (dam.rainfallForecast / 40) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {role !== "citizen" && (
        <>
          <ConfidenceBar value={dam.predictionConfidence} />
          <div className="glass-panel rounded-lg p-3 border-l-2 border-primary/50">
            <div className="text-[10px] text-primary uppercase tracking-wider mb-1">AI Prediction</div>
            <p className="text-xs text-foreground leading-relaxed">
              {dam.overflowRisk > 0.65
                ? `Critical overflow risk detected. With ${dam.rainfallForecast.toFixed(0)}mm forecast, dam may exceed safe capacity within 6–12 hours. Recommend immediate action.`
                : dam.overflowRisk > 0.35
                ? `Elevated overflow risk. Monitor rainfall closely. Current trajectory suggests moderate pressure over next 24 hours.`
                : `Levels within safe operational parameters. No immediate action required.`
              }
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function BridgePanel({ bridge, role }: { bridge: BridgeData; role: Role }) {
  const vibColor = bridge.vibrationIndex > 0.7 ? "#ef4444" : bridge.vibrationIndex > 0.4 ? "#f59e0b" : "#10b981";
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GitBranch className="h-4 w-4 text-warning" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Bridge Monitor</span>
          </div>
          <h3 className="text-base font-semibold text-foreground">{bridge.name}</h3>
        </div>
        <StatusBadge status={bridge.status} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <RingMeter value={bridge.loadPercent} color={bridge.loadPercent > 85 ? "#ef4444" : "#06b6d4"} label="Load %" />
        <RingMeter value={bridge.vibrationIndex * 100} color={vibColor} label="Vibration %" />
        <RingMeter value={bridge.predictionConfidence * 100} color="#10b981" label="Confidence %" />
      </div>

      <div className="glass-panel rounded-lg p-3">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Risk Severity</span>
          <span className={`font-semibold capitalize ${
            bridge.riskSeverity === "high" || bridge.riskSeverity === "critical"
              ? "text-destructive"
              : bridge.riskSeverity === "medium" ? "text-warning" : "text-success"
          }`}>{bridge.riskSeverity}</span>
        </div>
      </div>

      {role !== "citizen" && (
        <div className="glass-panel rounded-lg p-3 border-l-2 border-warning/50">
          <div className="text-[10px] text-warning uppercase tracking-wider mb-1">AI Prediction</div>
          <p className="text-xs text-foreground leading-relaxed">
            {bridge.loadPercent > 90
              ? `Load at ${bridge.loadPercent.toFixed(0)}% – exceeds design threshold. Vibration index elevated at ${(bridge.vibrationIndex * 100).toFixed(0)}%. Recommend load restriction within 2 hours.`
              : bridge.loadPercent > 75
              ? `Load approaching warning threshold. Vibration patterns indicate structural fatigue. Monitor over next 4–6 hours.`
              : `Bridge operating within normal parameters. Structural integrity confirmed.`
            }
          </p>
        </div>
      )}
    </div>
  );
}

function TransformerPanel({ tf, role }: { tf: TransformerData; role: Role }) {
  const tempColor = tf.temperatureCelsius > 85 ? "#ef4444" : tf.temperatureCelsius > 65 ? "#f59e0b" : "#10b981";
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-warning" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Power Grid</span>
          </div>
          <h3 className="text-base font-semibold text-foreground">{tf.name}</h3>
        </div>
        <StatusBadge status={tf.status} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <RingMeter value={tf.loadPercent} color={tf.loadPercent > 85 ? "#ef4444" : "#06b6d4"} label="Load %" />
        <RingMeter value={tf.failureProbability * 100} color="#ef4444" label="Failure Risk %" />
        <RingMeter value={tf.temperatureCelsius} max={120} color={tempColor} label="Temp °C" />
      </div>

      {role !== "citizen" && (
        <>
          <ConfidenceBar value={tf.predictionConfidence} />
          <div className="glass-panel rounded-lg p-3 border-l-2 border-destructive/50">
            <div className="text-[10px] text-destructive uppercase tracking-wider mb-1">AI Prediction</div>
            <p className="text-xs text-foreground leading-relaxed">
              {tf.failureProbability > 0.75
                ? `CRITICAL: Failure probability at ${(tf.failureProbability * 100).toFixed(0)}%. Temperature ${tf.temperatureCelsius.toFixed(0)}°C exceeds safe limit. Estimated time-to-failure: 1–3 hours. Initiate emergency protocol.`
                : tf.failureProbability > 0.45
                ? `Load at ${tf.loadPercent.toFixed(0)}% – approaching thermal limits. Failure risk elevated. Recommend load balancing within 6 hours.`
                : `Transformer operating within normal parameters. No immediate risk detected.`
              }
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default function RightPanel({ selectedMarker, dams, bridges, transformers, role, onClose }: RightPanelProps) {
  if (!selectedMarker) return null;

  const dam = selectedMarker.type === "dam" ? dams.find(d => d.id === selectedMarker.id) : null;
  const bridge = selectedMarker.type === "bridge" ? bridges.find(b => b.id === selectedMarker.id) : null;
  const transformer = selectedMarker.type === "transformer" ? transformers.find(t => t.id === selectedMarker.id) : null;

  return (
    <AnimatePresence>
      <motion.div
        key={selectedMarker.id}
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-72 flex-shrink-0 bg-panel border-l border-panel-border overflow-y-auto flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-panel-border">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Infrastructure Detail</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 flex-1">
          {dam && <DamPanel dam={dam} role={role} />}
          {bridge && <BridgePanel bridge={bridge} role={role} />}
          {transformer && <TransformerPanel tf={transformer} role={role} />}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
