// ═══════════════════════════════════════════════════
// MUMBAI SMART CITY – MOCK DATA ARCHITECTURE
// All data structures for dynamic simulation
// ═══════════════════════════════════════════════════

export type Role = "citizen" | "officer" | "admin";

export interface DamData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  waterLevel: number; // 0–100%
  stressIndex: number; // 0–1
  rainfallForecast: number; // mm
  overflowRisk: number; // 0–1
  predictionConfidence: number; // 0–1
  status: "normal" | "warning" | "critical";
}

export interface BridgeData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  loadPercent: number; // 0–100
  vibrationIndex: number; // 0–1
  riskSeverity: "low" | "medium" | "high" | "critical";
  predictionConfidence: number;
  status: "normal" | "warning" | "critical";
}

export interface TransformerData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  loadPercent: number; // 0–100
  failureProbability: number; // 0–1
  temperatureCelsius: number;
  predictionConfidence: number;
  status: "normal" | "warning" | "critical";
}

export interface TrafficZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  intensity: number; // 0–100
  congestionLevel: "low" | "moderate" | "high" | "severe";
}

export interface AQIZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  aqi: number; // 0–500
  category: "Good" | "Moderate" | "Unhealthy" | "Very Unhealthy" | "Hazardous";
  pm25: number;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainfall: number;
  condition: "Clear" | "Partly Cloudy" | "Overcast" | "Rain" | "Heavy Rain";
  feelsLike: number;
}

export interface BusRoute {
  id: string;
  routeNo: string;
  from: string;
  to: string;
  activeBuses: number;
  delayPercent: number;
  efficiency: number;
  waypoints: [number, number][];
}

export interface TrainRoute {
  id: string;
  name: string;
  activeTrains: number;
  delayPercent: number;
  efficiency: number;
  waypoints: [number, number][];
  color: string;
}

export interface Alert {
  id: string;
  severity: "info" | "warning" | "critical";
  message: string;
  source: string;
  timestamp: Date;
}

export interface SystemMetrics {
  aqiOverall: number;
  trafficIndex: number;
  alertCount: number;
  weather: WeatherData;
}

// ═══════════════════════════════════════════════
// INITIAL MOCK DATA
// ═══════════════════════════════════════════════

export const INITIAL_DAMS: DamData[] = [
  {
    id: "dam_01",
    name: "Vihar Lake Dam",
    lat: 19.132,
    lng: 72.921,
    waterLevel: 72,
    stressIndex: 0.63,
    rainfallForecast: 18,
    overflowRisk: 0.42,
    predictionConfidence: 0.81,
    status: "warning",
  },
  {
    id: "dam_02",
    name: "Tulsi Reservoir",
    lat: 19.097,
    lng: 72.895,
    waterLevel: 45,
    stressIndex: 0.31,
    rainfallForecast: 8,
    overflowRisk: 0.15,
    predictionConfidence: 0.88,
    status: "normal",
  },
  {
    id: "dam_03",
    name: "Powai Lake",
    lat: 19.12,
    lng: 72.908,
    waterLevel: 88,
    stressIndex: 0.82,
    rainfallForecast: 24,
    overflowRisk: 0.71,
    predictionConfidence: 0.76,
    status: "critical",
  },
];

export const INITIAL_BRIDGES: BridgeData[] = [
  {
    id: "bridge_01",
    name: "Bandra-Worli Sea Link",
    lat: 19.04,
    lng: 72.818,
    loadPercent: 67,
    vibrationIndex: 0.34,
    riskSeverity: "medium",
    predictionConfidence: 0.85,
    status: "normal",
  },
  {
    id: "bridge_02",
    name: "Mahim Causeway",
    lat: 19.044,
    lng: 72.842,
    loadPercent: 91,
    vibrationIndex: 0.78,
    riskSeverity: "high",
    predictionConfidence: 0.79,
    status: "critical",
  },
  {
    id: "bridge_03",
    name: "Vashi Bridge",
    lat: 19.076,
    lng: 73.0,
    loadPercent: 52,
    vibrationIndex: 0.21,
    riskSeverity: "low",
    predictionConfidence: 0.92,
    status: "normal",
  },
];

export const INITIAL_TRANSFORMERS: TransformerData[] = [
  {
    id: "tf_01",
    name: "Dharavi Grid Station",
    lat: 19.047,
    lng: 72.857,
    loadPercent: 88,
    failureProbability: 0.67,
    temperatureCelsius: 78,
    predictionConfidence: 0.83,
    status: "warning",
  },
  {
    id: "tf_02",
    name: "BKC Substation",
    lat: 19.066,
    lng: 72.866,
    loadPercent: 61,
    failureProbability: 0.22,
    temperatureCelsius: 54,
    predictionConfidence: 0.91,
    status: "normal",
  },
  {
    id: "tf_03",
    name: "Kurla Power Hub",
    lat: 19.072,
    lng: 72.879,
    loadPercent: 95,
    failureProbability: 0.89,
    temperatureCelsius: 94,
    predictionConfidence: 0.77,
    status: "critical",
  },
];

export const INITIAL_TRAFFIC_ZONES: TrafficZone[] = [
  { id: "tz_01", name: "Western Express Highway", lat: 19.113, lng: 72.862, intensity: 82, congestionLevel: "severe" },
  { id: "tz_02", name: "Eastern Express Highway", lat: 19.09, lng: 72.893, intensity: 65, congestionLevel: "high" },
  { id: "tz_03", name: "SV Road - Bandra", lat: 19.054, lng: 72.835, intensity: 55, congestionLevel: "moderate" },
  { id: "tz_04", name: "LBS Marg", lat: 19.072, lng: 72.874, intensity: 41, congestionLevel: "moderate" },
  { id: "tz_05", name: "Marine Drive", lat: 18.944, lng: 72.824, intensity: 28, congestionLevel: "low" },
  { id: "tz_06", name: "Dadar TT", lat: 19.019, lng: 72.843, intensity: 76, congestionLevel: "high" },
];

export const INITIAL_AQI_ZONES: AQIZone[] = [
  { id: "aq_01", name: "Andheri", lat: 19.119, lng: 72.847, aqi: 163, category: "Unhealthy", pm25: 68 },
  { id: "aq_02", name: "Bandra", lat: 19.054, lng: 72.840, aqi: 112, category: "Unhealthy", pm25: 45 },
  { id: "aq_03", name: "Colaba", lat: 18.906, lng: 72.815, aqi: 87, category: "Moderate", pm25: 34 },
  { id: "aq_04", name: "Kurla", lat: 19.072, lng: 72.879, aqi: 198, category: "Unhealthy", pm25: 89 },
  { id: "aq_05", name: "Borivali", lat: 19.228, lng: 72.859, aqi: 74, category: "Moderate", pm25: 28 },
  { id: "aq_06", name: "Thane", lat: 19.218, lng: 72.978, aqi: 145, category: "Unhealthy", pm25: 62 },
];

export const INITIAL_WEATHER: WeatherData = {
  temperature: 31,
  humidity: 78,
  windSpeed: 14,
  rainfall: 3.2,
  condition: "Partly Cloudy",
  feelsLike: 36,
};

export const INITIAL_BUS_ROUTES: BusRoute[] = [
  {
    id: "bus_01",
    routeNo: "BEST-312",
    from: "Borivali",
    to: "Churchgate",
    activeBuses: 14,
    delayPercent: 18,
    efficiency: 76,
    waypoints: [
      [19.228, 72.859], [19.17, 72.855], [19.119, 72.847],
      [19.054, 72.840], [18.944, 72.824], [18.921, 72.831],
    ],
  },
  {
    id: "bus_02",
    routeNo: "BEST-451",
    from: "Kurla",
    to: "BKC",
    activeBuses: 8,
    delayPercent: 7,
    efficiency: 89,
    waypoints: [
      [19.072, 72.879], [19.066, 72.866], [19.06, 72.855],
    ],
  },
];

export const INITIAL_TRAIN_ROUTES: TrainRoute[] = [
  {
    id: "train_wr",
    name: "Western Railway",
    activeTrains: 42,
    delayPercent: 12,
    efficiency: 84,
    color: "#06b6d4",
    waypoints: [
      [19.228, 72.859], [19.197, 72.854], [19.17, 72.855],
      [19.139, 72.849], [19.119, 72.847], [19.082, 72.838],
      [19.054, 72.840], [19.028, 72.836], [18.944, 72.824],
    ],
  },
  {
    id: "train_cr",
    name: "Central Railway",
    activeTrains: 38,
    delayPercent: 9,
    efficiency: 88,
    color: "#f59e0b",
    waypoints: [
      [19.218, 72.978], [19.17, 72.941], [19.12, 72.908],
      [19.072, 72.879], [19.04, 72.856], [18.979, 72.834],
      [18.944, 72.824],
    ],
  },
];

export const INITIAL_ALERTS: Alert[] = [
  {
    id: "alt_01",
    severity: "critical",
    message: "Powai Lake overflow risk elevated to 71%",
    source: "Dam Monitoring",
    timestamp: new Date(),
  },
  {
    id: "alt_02",
    severity: "critical",
    message: "Kurla Power Hub at 95% load – failure imminent",
    source: "Transformer Grid",
    timestamp: new Date(Date.now() - 120000),
  },
  {
    id: "alt_03",
    severity: "warning",
    message: "Mahim Causeway vibration index elevated",
    source: "Bridge Monitoring",
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: "alt_04",
    severity: "warning",
    message: "AQI in Andheri & Kurla exceed safe limits",
    source: "Air Quality",
    timestamp: new Date(Date.now() - 600000),
  },
  {
    id: "alt_05",
    severity: "info",
    message: "Western Railway delay tracking active",
    source: "Transport",
    timestamp: new Date(Date.now() - 900000),
  },
];

export const MUMBAI_CENTER: [number, number] = [19.076, 72.877];

// ═══════════════════════════════════════════════
// FLUCTUATION HELPERS
// ═══════════════════════════════════════════════

export function fluctuate(value: number, range: number, min = 0, max = 100): number {
  const delta = (Math.random() - 0.5) * 2 * range;
  return Math.max(min, Math.min(max, value + delta));
}

export function fluctuateFloat(value: number, range: number, min = 0, max = 1): number {
  const delta = (Math.random() - 0.5) * 2 * range;
  return Math.max(min, Math.min(max, Math.round((value + delta) * 100) / 100));
}

export function deriveStatus(value: number, warningThreshold: number, criticalThreshold: number): "normal" | "warning" | "critical" {
  if (value >= criticalThreshold) return "critical";
  if (value >= warningThreshold) return "warning";
  return "normal";
}

export function deriveAQICategory(aqi: number): AQIZone["category"] {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy";
  if (aqi <= 200) return "Very Unhealthy";
  return "Hazardous";
}

export function deriveCongestion(intensity: number): TrafficZone["congestionLevel"] {
  if (intensity < 30) return "low";
  if (intensity < 55) return "moderate";
  if (intensity < 75) return "high";
  return "severe";
}
