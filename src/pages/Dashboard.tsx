import { useState, Suspense, type Dispatch, type SetStateAction } from "react";
import { Role } from "@/data/mockData";
import { useLiveData } from "@/hooks/useLiveData";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import MapView from "@/components/dashboard/MapView";
import RightPanel from "@/components/dashboard/RightPanel";
import BottomDrawer from "@/components/dashboard/BottomDrawer";
import FloatingWidgets from "@/components/dashboard/FloatingWidgets";
import OverviewPanel from "@/components/dashboard/OverviewPanel";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import AIPredictionPanel from "@/components/ai/AIPredictionPanel";
import CitizenChatbot from "@/components/citizen/CitizenChatbot";
import UploadPanel from "@/components/dashboard/UploadPanel";
import AdminApprovalPanel, { AnalysisRequest } from "@/components/dashboard/AdminApprovalPanel";
import { toast } from "sonner";

interface DashboardProps {
  role: Role;
  userDisplayName?: string;
  onLogout: () => void;
  activeModule: string;
  setActiveModule: (m: string) => void;
  analysisRequests: AnalysisRequest[];
  setAnalysisRequests: Dispatch<SetStateAction<AnalysisRequest[]>>;
  liveData: ReturnType<typeof useLiveData>;
}

type PanelView = "map" | "overview" | "alerts" | "ai";

export default function Dashboard({ 
  role, 
  userDisplayName,
  onLogout, 
  activeModule, 
  setActiveModule, 
  analysisRequests, 
  setAnalysisRequests,
  liveData
}: DashboardProps) {
  const { 
    dams, bridges, transformers, 
    trafficZones, aqiZones, weather, 
    busRoutes, trainRoutes, alerts,
    systemMetrics,
    applyAIUpdates
  } = liveData;
  
  const [selectedMarker, setSelectedMarker] = useState<{ type: string; id: string } | null>(null);

  const alertCount = alerts.filter(a => a.severity !== "info").length;
  const pendingRequestCount = analysisRequests.filter(r => r.status === "pending").length;

  const handleSelectMarker = (type: string, id: string) => {
    setSelectedMarker({ type, id });
    setActiveModule("map");
  };

  const handleSetModule = (id: string) => {
    setActiveModule(id);
    if (id !== "map") setSelectedMarker(null);
  };

  const handleRequestApproval = (fileMeta: { fileName: string; fileType?: string; fileUrl?: string }) => {
    const newRequest: AnalysisRequest = {
      id: `req_${Date.now()}`,
      fileName: fileMeta.fileName,
      fileType: fileMeta.fileType,
      fileUrl: fileMeta.fileUrl,
      officerName: userDisplayName || "Government Officer",
      timestamp: new Date().toISOString(),
      status: "pending"
    };
    setAnalysisRequests(prev => [...prev, newRequest]);
    toast.success("Request sent to Admin for approval");
  };

  const handleApproveRequest = (id: string) => {
    setAnalysisRequests(prev => prev.map(r => r.id === id ? { ...r, status: "approved" } : r));
  };

  const handleRejectRequest = (id: string) => {
    setAnalysisRequests(prev => prev.map(r => r.id === id ? { ...r, status: "rejected" } : r));
  };

  const currentOfficerRequest = analysisRequests.length > 0
    ? analysisRequests[analysisRequests.length - 1]
    : undefined;

  const handleDataUpdate = (analysis: any) => {
    console.log("AI Data Update received:", analysis);
    if (analysis.structuredUpdate) {
      applyAIUpdates(analysis.structuredUpdate);
    }
  };

  const isMapView = activeModule === "map";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar
        role={role}
        activeModule={activeModule}
        setActiveModule={handleSetModule}
        onLogout={onLogout}
        alertCount={alertCount}
        requestCount={pendingRequestCount}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar
          role={role}
          alertCount={alertCount}
          onShowAlerts={() => handleSetModule("alerts")}
        />

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Main content */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="flex-1 relative overflow-hidden">
              {/* Map view - always mounted but hidden when not active */}
              <div className={`absolute inset-0 ${isMapView ? "z-10" : "z-0 pointer-events-none opacity-0"}`}>
                <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-muted-foreground">Loading map...</div>}>
                  <MapView
                    dams={dams}
                    bridges={bridges}
                    transformers={transformers}
                    trafficZones={trafficZones}
                    aqiZones={aqiZones}
                    busRoutes={busRoutes}
                    trainRoutes={trainRoutes}
                    onSelectMarker={handleSelectMarker}
                  />
                </Suspense>
                {isMapView && (
                  <FloatingWidgets metrics={systemMetrics} aqiZones={aqiZones} />
                )}
              </div>

              {/* Panel views */}
              {!isMapView && (
                <div className="absolute inset-0 overflow-y-auto z-10">
                  {activeModule === "overview" && (
                    <OverviewPanel
                      dams={dams}
                      bridges={bridges}
                      transformers={transformers}
                      trafficZones={trafficZones}
                      aqiZones={aqiZones}
                      busRoutes={busRoutes}
                      trainRoutes={trainRoutes}
                      weather={weather}
                      role={role}
                      onSelectModule={handleSetModule}
                    />
                  )}
                  {activeModule === "alerts" && (
                    <AlertsPanel alerts={alerts} role={role} />
                  )}
                  {activeModule === "ai" && (
                    <AIPredictionPanel
                      dams={dams}
                      bridges={bridges}
                      transformers={transformers}
                      role={role}
                    />
                  )}
                  {activeModule === "upload" && role === "officer" && (
                    <UploadPanel 
                      onDataUpdate={handleDataUpdate} 
                      currentRequest={currentOfficerRequest as any}
                      onRequestApproval={handleRequestApproval}
                    />
                  )}
                  {activeModule === "approvals" && role === "admin" && (
                    <AdminApprovalPanel 
                      requests={analysisRequests}
                      onApprove={handleApproveRequest}
                      onReject={handleRejectRequest}
                    />
                  )}
                  {["dam", "bridge", "transformer", "transport"].includes(activeModule) && (
                    <div className="p-4 space-y-3">
                      <p className="text-xs text-muted-foreground">Click a marker on the map to view details, or select from the list below:</p>
                      {activeModule === "dam" && dams.map(d => (
                        <button key={d.id} onClick={() => handleSelectMarker("dam", d.id)}
                          className="w-full text-left glass-panel rounded-lg p-3 hover:border-primary/40 transition-all">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{d.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                              d.status === "critical" ? "bg-destructive/10 text-destructive" :
                              d.status === "warning" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                            }`}>{d.status}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Water: {d.waterLevel.toFixed(0)}% · Risk: {(d.overflowRisk*100).toFixed(0)}%</div>
                        </button>
                      ))}
                      {activeModule === "bridge" && bridges.map(b => (
                        <button key={b.id} onClick={() => handleSelectMarker("bridge", b.id)}
                          className="w-full text-left glass-panel rounded-lg p-3 hover:border-primary/40 transition-all">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{b.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                              b.status === "critical" ? "bg-destructive/10 text-destructive" :
                              b.status === "warning" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                            }`}>{b.status}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Load: {b.loadPercent.toFixed(0)}% · Vibration: {(b.vibrationIndex*100).toFixed(0)}%</div>
                        </button>
                      ))}
                      {activeModule === "transformer" && transformers.map(t => (
                        <button key={t.id} onClick={() => handleSelectMarker("transformer", t.id)}
                          className="w-full text-left glass-panel rounded-lg p-3 hover:border-primary/40 transition-all">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{t.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                              t.status === "critical" ? "bg-destructive/10 text-destructive" :
                              t.status === "warning" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                            }`}>{t.status}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Load: {t.loadPercent.toFixed(0)}% · Temp: {t.temperatureCelsius.toFixed(0)}°C · Fail: {(t.failureProbability*100).toFixed(0)}%</div>
                        </button>
                      ))}
                      {activeModule === "transport" && (
                        <div className="space-y-3">
                          {busRoutes.map(r => (
                            <div key={r.id} className="glass-panel rounded-lg p-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Bus {r.routeNo}</span>
                                <span className="text-xs text-primary mono">{r.activeBuses} active</span>
                              </div>
                              <div className="text-xs text-muted-foreground">{r.from} → {r.to}</div>
                              <div className="text-xs text-muted-foreground mt-1">Delay: {r.delayPercent}% · Efficiency: {r.efficiency}%</div>
                            </div>
                          ))}
                          {trainRoutes.map(r => (
                            <div key={r.id} className="glass-panel rounded-lg p-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">{r.name}</span>
                                <span className="text-xs text-primary mono">{r.activeTrains} active</span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">Delay: {r.delayPercent}% · Efficiency: {r.efficiency}%</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <BottomDrawer
              dams={dams}
              bridges={bridges}
              transformers={transformers}
              trafficZones={trafficZones}
              aqiZones={aqiZones}
              busRoutes={busRoutes}
              trainRoutes={trainRoutes}
              role={role}
            />
          </div>

          {/* Right panel (contextual) */}
          <RightPanel
            selectedMarker={selectedMarker}
            dams={dams}
            bridges={bridges}
            transformers={transformers}
            role={role}
            onClose={() => setSelectedMarker(null)}
          />
        </div>
      </div>

      {role === "citizen" && <CitizenChatbot />}
    </div>
  );
}
