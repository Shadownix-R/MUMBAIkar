import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  DamData, BridgeData, TransformerData, TrafficZone, AQIZone,
  BusRoute, TrainRoute, MUMBAI_CENTER
} from "@/data/mockData";
import { Droplets, GitBranch, Zap, Layers, Bus, Train, Wind, Car } from "lucide-react";

// Fix leaflet default icon issue in Vite
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function createCustomIcon(color: string, symbol: string) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 32px; height: 32px;
        background: hsl(222, 40%, 9%);
        border: 2px solid ${color};
        border-radius: 50%;
        display: flex; align-items: center; justify-center;
        box-shadow: 0 0 10px ${color}60;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${symbol}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

const statusColors = {
  normal: "#10b981",
  warning: "#f59e0b",
  critical: "#ef4444",
};

interface OverlayToggle {
  traffic: boolean;
  aqi: boolean;
  transport: boolean;
  infrastructure: boolean;
}

interface MapViewProps {
  dams: DamData[];
  bridges: BridgeData[];
  transformers: TransformerData[];
  trafficZones: TrafficZone[];
  aqiZones: AQIZone[];
  busRoutes: BusRoute[];
  trainRoutes: TrainRoute[];
  onSelectMarker: (type: string, id: string) => void;
}

function getAQIColor(aqi: number): string {
  if (aqi <= 50) return "#10b981";
  if (aqi <= 100) return "#f59e0b";
  if (aqi <= 150) return "#f97316";
  if (aqi <= 200) return "#ef4444";
  return "#7c3aed";
}

function getTrafficColor(intensity: number): string {
  if (intensity < 30) return "#10b981";
  if (intensity < 55) return "#f59e0b";
  if (intensity < 75) return "#f97316";
  return "#ef4444";
}

export default function MapView({
  dams, bridges, transformers, trafficZones, aqiZones,
  busRoutes, trainRoutes, onSelectMarker
}: MapViewProps) {
  const [overlays, setOverlays] = useState<OverlayToggle>({
    traffic: true,
    aqi: false,
    transport: false,
    infrastructure: true,
  });

  const toggleOverlay = (key: keyof OverlayToggle) => {
    setOverlays(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const overlayControls = [
    { key: "infrastructure" as const, label: "Infrastructure", icon: Layers, color: "text-primary" },
    { key: "traffic" as const, label: "Traffic", icon: Car, color: "text-destructive" },
    { key: "aqi" as const, label: "AQI", icon: Wind, color: "text-warning" },
    { key: "transport" as const, label: "Transport", icon: Bus, color: "text-success" },
  ];

  return (
    <div className="relative w-full h-full">
      {/* Map */}
      <MapContainer
        center={MUMBAI_CENTER}
        zoom={12}
        style={{ width: "100%", height: "100%" }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          maxZoom={20}
        />

        {/* Traffic Circles */}
        <AnimatePresence>
          {overlays.traffic && trafficZones.map(zone => (
            <Circle
              key={`traffic-${zone.id}`}
              center={[zone.lat, zone.lng]}
              radius={1200}
              pathOptions={{
                color: getTrafficColor(zone.intensity),
                fillColor: getTrafficColor(zone.intensity),
                fillOpacity: 0.18,
                weight: 2,
                opacity: 0.7,
                dashArray: "4 4",
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold mb-1">{zone.name}</div>
                  <div>Intensity: <strong>{zone.intensity}%</strong></div>
                  <div>Level: <strong className="capitalize">{zone.congestionLevel}</strong></div>
                </div>
              </Popup>
            </Circle>
          ))}
        </AnimatePresence>

        {/* AQI Circles */}
        {overlays.aqi && aqiZones.map(zone => (
          <Circle
            key={`aqi-${zone.id}`}
            center={[zone.lat, zone.lng]}
            radius={2000}
            pathOptions={{
              color: getAQIColor(zone.aqi),
              fillColor: getAQIColor(zone.aqi),
              fillOpacity: 0.2,
              weight: 1.5,
              opacity: 0.6,
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold mb-1">{zone.name}</div>
                <div>AQI: <strong>{zone.aqi}</strong></div>
                <div>Category: <strong>{zone.category}</strong></div>
                <div>PM2.5: <strong>{zone.pm25} µg/m³</strong></div>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Bus routes */}
        {overlays.transport && busRoutes.map(route => (
          <Polyline
            key={`bus-${route.id}`}
            positions={route.waypoints}
            pathOptions={{ color: "#06b6d4", weight: 2.5, opacity: 0.7, dashArray: "6 4" }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold mb-1">Bus {route.routeNo}</div>
                <div>{route.from} → {route.to}</div>
                <div>Active Buses: <strong>{route.activeBuses}</strong></div>
                <div>Delay: <strong>{route.delayPercent}%</strong></div>
                <div>Efficiency: <strong>{route.efficiency}%</strong></div>
              </div>
            </Popup>
          </Polyline>
        ))}

        {/* Train routes */}
        {overlays.transport && trainRoutes.map(route => (
          <Polyline
            key={`train-${route.id}`}
            positions={route.waypoints}
            pathOptions={{ color: route.color, weight: 3, opacity: 0.8 }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold mb-1">{route.name}</div>
                <div>Active Trains: <strong>{route.activeTrains}</strong></div>
                <div>Delay: <strong>{route.delayPercent}%</strong></div>
                <div>Efficiency: <strong>{route.efficiency}%</strong></div>
              </div>
            </Popup>
          </Polyline>
        ))}

        {/* Dam markers */}
        {overlays.infrastructure && dams.map(dam => (
          <Marker
            key={dam.id}
            position={[dam.lat, dam.lng]}
            icon={createCustomIcon(statusColors[dam.status], "💧")}
            eventHandlers={{ click: () => onSelectMarker("dam", dam.id) }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold mb-1">{dam.name}</div>
                <div>Water Level: <strong>{dam.waterLevel.toFixed(1)}%</strong></div>
                <div>Overflow Risk: <strong>{(dam.overflowRisk * 100).toFixed(0)}%</strong></div>
                <div>Status: <strong className="capitalize">{dam.status}</strong></div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Bridge markers */}
        {overlays.infrastructure && bridges.map(bridge => (
          <Marker
            key={bridge.id}
            position={[bridge.lat, bridge.lng]}
            icon={createCustomIcon(statusColors[bridge.status], "🌉")}
            eventHandlers={{ click: () => onSelectMarker("bridge", bridge.id) }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold mb-1">{bridge.name}</div>
                <div>Load: <strong>{bridge.loadPercent.toFixed(0)}%</strong></div>
                <div>Risk: <strong className="capitalize">{bridge.riskSeverity}</strong></div>
                <div>Status: <strong className="capitalize">{bridge.status}</strong></div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Transformer markers */}
        {overlays.infrastructure && transformers.map(tf => (
          <Marker
            key={tf.id}
            position={[tf.lat, tf.lng]}
            icon={createCustomIcon(statusColors[tf.status], "⚡")}
            eventHandlers={{ click: () => onSelectMarker("transformer", tf.id) }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold mb-1">{tf.name}</div>
                <div>Load: <strong>{tf.loadPercent.toFixed(0)}%</strong></div>
                <div>Temp: <strong>{tf.temperatureCelsius.toFixed(0)}°C</strong></div>
                <div>Failure Risk: <strong>{(tf.failureProbability * 100).toFixed(0)}%</strong></div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Overlay controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-1.5">
        {overlayControls.map(ctrl => {
          const Icon = ctrl.icon;
          return (
            <button
              key={ctrl.key}
              onClick={() => toggleOverlay(ctrl.key)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
                glass-panel transition-all duration-200
                ${overlays[ctrl.key]
                  ? `${ctrl.color} border-current/50`
                  : "text-muted-foreground border-border/50"
                }
              `}
            >
              <Icon className="h-3 w-3" />
              {ctrl.label}
              <span className={`w-1.5 h-1.5 rounded-full ${overlays[ctrl.key] ? "bg-current" : "bg-muted-foreground/30"}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
