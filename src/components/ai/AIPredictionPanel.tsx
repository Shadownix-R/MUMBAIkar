import { motion } from "framer-motion";
import { DamData, BridgeData, TransformerData, Role } from "@/data/mockData";
import { BrainCircuit, TrendingUp, Clock, AlertTriangle, CheckCircle } from "lucide-react";

interface AIPredictionPanelProps {
  dams: DamData[];
  bridges: BridgeData[];
  transformers: TransformerData[];
  role: Role;
}

interface Prediction {
  id: string;
  title: string;
  statement: string;
  confidence: number;
  severity: "low" | "medium" | "high" | "critical";
  timeToImpact: string;
  source: string;
}

function derivePredictions(
  dams: DamData[],
  bridges: BridgeData[],
  transformers: TransformerData[]
): Prediction[] {
  const predictions: Prediction[] = [];

  dams.forEach(dam => {
    if (dam.overflowRisk > 0.35) {
      const hours = dam.overflowRisk > 0.65
        ? Math.round(6 - dam.overflowRisk * 4)
        : Math.round(24 - dam.overflowRisk * 20);
      predictions.push({
        id: `dam_pred_${dam.id}`,
        title: `${dam.name} Overflow`,
        statement: `With ${dam.rainfallForecast.toFixed(0)}mm rainfall forecast and ${(dam.waterLevel).toFixed(0)}% current level, overflow probability exceeds safe threshold.`,
        confidence: dam.predictionConfidence,
        severity: dam.overflowRisk > 0.65 ? "critical" : "high",
        timeToImpact: `~${hours}h`,
        source: "Hydrological Model",
      });
    }
  });

  bridges.forEach(bridge => {
    if (bridge.loadPercent > 75) {
      predictions.push({
        id: `bridge_pred_${bridge.id}`,
        title: `${bridge.name} Load Stress`,
        statement: `Structural load at ${bridge.loadPercent.toFixed(0)}% with vibration index ${(bridge.vibrationIndex * 100).toFixed(0)}%. Fatigue risk increasing.`,
        confidence: bridge.predictionConfidence,
        severity: bridge.loadPercent > 90 ? "critical" : "medium",
        timeToImpact: bridge.loadPercent > 90 ? "~2–4h" : "~12–24h",
        source: "Structural Analysis",
      });
    }
  });

  transformers.forEach(tf => {
    if (tf.failureProbability > 0.45) {
      predictions.push({
        id: `tf_pred_${tf.id}`,
        title: `${tf.name} Failure Risk`,
        statement: `Load at ${tf.loadPercent.toFixed(0)}% with core temperature ${tf.temperatureCelsius.toFixed(0)}°C. Thermal runaway risk at current trajectory.`,
        confidence: tf.predictionConfidence,
        severity: tf.failureProbability > 0.75 ? "critical" : "high",
        timeToImpact: tf.failureProbability > 0.75 ? "~1–3h" : "~8–12h",
        source: "Thermal Load Model",
      });
    }
  });

  return predictions.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.severity] - order[b.severity];
  });
}

const severityConfig = {
  critical: { color: "text-destructive", border: "border-l-destructive", bg: "bg-destructive/5", badge: "bg-destructive/10 text-destructive" },
  high: { color: "text-orange-400", border: "border-l-orange-400", bg: "bg-orange-400/5", badge: "bg-orange-400/10 text-orange-400" },
  medium: { color: "text-warning", border: "border-l-warning", bg: "bg-warning/5", badge: "bg-warning/10 text-warning" },
  low: { color: "text-success", border: "border-l-success", bg: "bg-success/5", badge: "bg-success/10 text-success" },
};

function ConfidenceRing({ value }: { value: number }) {
  const r = 16;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value);
  return (
    <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
      <svg className="-rotate-90 absolute inset-0" width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
        <circle cx="20" cy="20" r={r} fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <span className="text-[9px] font-bold text-primary relative">{Math.round(value * 100)}</span>
    </div>
  );
}

export default function AIPredictionPanel({ dams, bridges, transformers, role }: AIPredictionPanelProps) {
  if (role === "citizen") {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <BrainCircuit className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm">AI Predictions require Officer or Admin access</p>
      </div>
    );
  }

  const predictions = derivePredictions(dams, bridges, transformers);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <BrainCircuit className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">AI Prediction Engine</h2>
        <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full ml-auto">
          {predictions.length} active
        </span>
      </div>

      {predictions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 gap-3">
          <CheckCircle className="h-8 w-8 text-success" />
          <p className="text-sm text-muted-foreground">All systems within normal parameters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {predictions.map((pred, i) => {
            const sc = severityConfig[pred.severity];
            return (
              <motion.div
                key={pred.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`glass-panel rounded-lg p-3 border-l-2 ${sc.border} ${sc.bg}`}
              >
                <div className="flex items-start gap-2 mb-2">
                  <ConfidenceRing value={pred.confidence} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground truncate">{pred.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize flex-shrink-0 ${sc.badge}`}>
                        {pred.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{pred.statement}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">{pred.source}</span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" />
                    <span>Impact: <strong className={sc.color}>{pred.timeToImpact}</strong></span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
