import { useState } from "react";
import { Role } from "@/data/mockData";
import { useLiveData } from "@/hooks/useLiveData";
import RoleLogin from "@/pages/RoleLogin";
import Dashboard from "@/pages/Dashboard";
import { AnalysisRequest } from "@/components/dashboard/AdminApprovalPanel";

export default function Index() {
  const [session, setSession] = useState<{ role: Role; username?: string; displayName?: string } | null>(null);
  const [activeModule, setActiveModule] = useState("overview");
  const [analysisRequests, setAnalysisRequests] = useState<AnalysisRequest[]>([]);
  const liveData = useLiveData();

  if (!session) return <RoleLogin onLogin={setSession} />;
  
  return (
    <Dashboard 
      role={session.role} 
      userDisplayName={session.displayName}
      onLogout={() => setSession(null)} 
      activeModule={activeModule}
      setActiveModule={setActiveModule}
      analysisRequests={analysisRequests}
      setAnalysisRequests={setAnalysisRequests}
      liveData={liveData}
    />
  );
}
