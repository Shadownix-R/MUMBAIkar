import { useState, useEffect, useCallback } from "react";
import {
  DamData, BridgeData, TransformerData, TrafficZone, AQIZone,
  WeatherData, BusRoute, TrainRoute, Alert, SystemMetrics,
  INITIAL_DAMS, INITIAL_BRIDGES, INITIAL_TRANSFORMERS,
  INITIAL_TRAFFIC_ZONES, INITIAL_AQI_ZONES, INITIAL_WEATHER,
  INITIAL_BUS_ROUTES, INITIAL_TRAIN_ROUTES, INITIAL_ALERTS,
  fluctuate, fluctuateFloat, deriveStatus, deriveAQICategory, deriveCongestion,
} from "@/data/mockData";

export function useLiveData() {
  const [dams, setDams] = useState<DamData[]>(INITIAL_DAMS);
  const [bridges, setBridges] = useState<BridgeData[]>(INITIAL_BRIDGES);
  const [transformers, setTransformers] = useState<TransformerData[]>(INITIAL_TRANSFORMERS);
  const [trafficZones, setTrafficZones] = useState<TrafficZone[]>(INITIAL_TRAFFIC_ZONES);
  const [aqiZones, setAqiZones] = useState<AQIZone[]>(INITIAL_AQI_ZONES);
  const [weather, setWeather] = useState<WeatherData>(INITIAL_WEATHER);
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>(INITIAL_BUS_ROUTES);
  const [trainRoutes, setTrainRoutes] = useState<TrainRoute[]>(INITIAL_TRAIN_ROUTES);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);

  const applyAIUpdates = useCallback((updates: any) => {
    if (updates.dams) {
      setDams(prev => prev.map(d => {
        const update = updates.dams.find((u: any) => u.id === d.id);
        return update ? { ...d, ...update } : d;
      }));
    }
    if (updates.bridges) {
      setBridges(prev => prev.map(b => {
        const update = updates.bridges.find((u: any) => u.id === b.id);
        return update ? { ...b, ...update } : b;
      }));
    }
    if (updates.transformers) {
      setTransformers(prev => prev.map(t => {
        const update = updates.transformers.find((u: any) => u.id === t.id);
        return update ? { ...t, ...update } : t;
      }));
    }
    if (updates.weather) {
      setWeather(prev => ({ ...prev, ...updates.weather }));
    }
    if (updates.alerts) {
      setAlerts(prev => [...updates.alerts, ...prev].slice(0, 15));
    }
  }, []);

  const updateDams = useCallback(() => {
    setDams(prev => prev.map(dam => {
      const waterLevel = fluctuate(dam.waterLevel, 1.2, 0, 100);
      const rainfallForecast = fluctuate(dam.rainfallForecast, 1, 0, 100);
      const stressIndex = fluctuateFloat(dam.stressIndex, 0.02, 0, 1);
      // AI logic: high rainfall → higher overflow risk
      const overflowRisk = Math.min(1, fluctuateFloat(
        dam.overflowRisk + (rainfallForecast > 20 ? 0.01 : -0.005),
        0.02, 0, 1
      ));
      const predictionConfidence = fluctuateFloat(dam.predictionConfidence, 0.01, 0.5, 0.99);
      const status = deriveStatus(overflowRisk * 100, 35, 65);
      return { ...dam, waterLevel, stressIndex, rainfallForecast, overflowRisk, predictionConfidence, status };
    }));
  }, []);

  const updateBridges = useCallback(() => {
    setBridges(prev => prev.map(bridge => {
      const loadPercent = fluctuate(bridge.loadPercent, 2, 0, 100);
      const vibrationIndex = fluctuateFloat(bridge.vibrationIndex, 0.03, 0, 1);
      // AI logic: high load → higher vibration risk
      const adjustedVibration = vibrationIndex + (loadPercent > 85 ? 0.02 : 0);
      const riskSeverity = adjustedVibration > 0.7 ? "high" : adjustedVibration > 0.45 ? "medium" : "low";
      const status = loadPercent > 90 ? "critical" : loadPercent > 75 ? "warning" : "normal";
      const predictionConfidence = fluctuateFloat(bridge.predictionConfidence, 0.01, 0.6, 0.99);
      return { ...bridge, loadPercent, vibrationIndex: Math.min(1, adjustedVibration), riskSeverity, status, predictionConfidence };
    }));
  }, []);

  const updateTransformers = useCallback(() => {
    setTransformers(prev => prev.map(tf => {
      const loadPercent = fluctuate(tf.loadPercent, 1.5, 0, 100);
      const temperatureCelsius = fluctuate(tf.temperatureCelsius, 1.5, 20, 120);
      // AI logic: load > 85% → failure probability spikes
      const baseFP = tf.failureProbability + (loadPercent > 85 ? 0.02 : -0.01);
      const failureProbability = fluctuateFloat(baseFP, 0.02, 0, 1);
      const predictionConfidence = fluctuateFloat(tf.predictionConfidence, 0.01, 0.6, 0.99);
      const status = failureProbability > 0.75 ? "critical" : failureProbability > 0.45 ? "warning" : "normal";
      return { ...tf, loadPercent, temperatureCelsius, failureProbability, predictionConfidence, status };
    }));
  }, []);

  const updateTraffic = useCallback(() => {
    setTrafficZones(prev => prev.map(zone => {
      const intensity = fluctuate(zone.intensity, 3, 0, 100);
      const congestionLevel = deriveCongestion(intensity);
      return { ...zone, intensity, congestionLevel };
    }));
  }, []);

  const updateAQI = useCallback(() => {
    setAqiZones(prev => prev.map(zone => {
      const aqi = Math.round(fluctuate(zone.aqi, 4, 0, 500));
      const pm25 = Math.round(fluctuate(zone.pm25, 2, 0, 300));
      const category = deriveAQICategory(aqi);
      return { ...zone, aqi, pm25, category };
    }));
  }, []);

  const updateWeather = useCallback(() => {
    setWeather(prev => ({
      ...prev,
      temperature: Math.round(fluctuate(prev.temperature, 0.3, 15, 45)),
      humidity: Math.round(fluctuate(prev.humidity, 1, 20, 100)),
      windSpeed: Math.round(fluctuate(prev.windSpeed, 0.5, 0, 80)),
      rainfall: Math.round(fluctuate(prev.rainfall, 0.2, 0, 50) * 10) / 10,
      feelsLike: Math.round(fluctuate(prev.feelsLike, 0.3, 15, 50)),
    }));
  }, []);

  const updateTransport = useCallback(() => {
    setBusRoutes(prev => prev.map(r => ({
      ...r,
      delayPercent: Math.round(fluctuate(r.delayPercent, 2, 0, 60)),
      efficiency: Math.round(fluctuate(r.efficiency, 1, 40, 100)),
    })));
    setTrainRoutes(prev => prev.map(r => ({
      ...r,
      delayPercent: Math.round(fluctuate(r.delayPercent, 1.5, 0, 50)),
      efficiency: Math.round(fluctuate(r.efficiency, 1, 50, 100)),
    })));
  }, []);

  useEffect(() => {
    const fastInterval = setInterval(() => {
      updateDams();
      updateBridges();
      updateTransformers();
    }, 5000);

    const slowInterval = setInterval(() => {
      updateTraffic();
      updateAQI();
      updateWeather();
      updateTransport();
    }, 8000);

    return () => {
      clearInterval(fastInterval);
      clearInterval(slowInterval);
    };
  }, [updateDams, updateBridges, updateTransformers, updateTraffic, updateAQI, updateWeather, updateTransport]);

  const systemMetrics: SystemMetrics = {
    aqiOverall: Math.round(aqiZones.reduce((sum, z) => sum + z.aqi, 0) / aqiZones.length),
    trafficIndex: Math.round(trafficZones.reduce((sum, z) => sum + z.intensity, 0) / trafficZones.length),
    alertCount: alerts.filter(a => a.severity !== "info").length,
    weather,
  };

  return {
    dams, bridges, transformers,
    trafficZones, aqiZones, weather,
    busRoutes, trainRoutes, alerts, setAlerts,
    systemMetrics,
    applyAIUpdates,
  };
}
