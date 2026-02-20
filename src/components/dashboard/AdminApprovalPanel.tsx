import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, Clock, FileText, User, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export interface AnalysisRequest {
  id: string;
  fileName: string;
  fileType?: string;
  fileUrl?: string;
  officerName: string;
  timestamp: string;
  status: "pending" | "approved" | "rejected";
}

interface AdminApprovalPanelProps {
  requests: AnalysisRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function AdminApprovalPanel({ requests, onApprove, onReject }: AdminApprovalPanelProps) {
  const pendingRequests = requests.filter(r => r.status === "pending");
  const historyRequests = requests.filter(r => r.status !== "pending");

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-float-up">
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-2xl font-bold text-foreground">AI Analysis Approvals</h2>
        <p className="text-muted-foreground">Review and approve document analysis requests from Government Officers.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="glass-panel border-panel-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Pending Requests ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {pendingRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-50">
                  <CheckCircle2 className="h-10 w-10 mb-2" />
                  <p>No pending requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50 transition-all hover:bg-secondary/40">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{req.fileName}</div>
                          {req.fileType && (
                            <div className="text-[10px] text-muted-foreground mt-0.5">{req.fileType}</div>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <User className="h-3 w-3" /> {req.officerName}
                            </span>
                            <span className="text-[10px] text-muted-foreground">•</span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(req.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {req.fileUrl && (
                            <a
                              href={req.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-primary mt-1 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View document
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            onReject(req.id);
                            toast.error("Request rejected");
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1.5" />
                          Reject
                        </Button>
                        <Button 
                          size="sm" 
                          className="h-8 bg-success hover:bg-success/90 text-white"
                          onClick={() => {
                            onApprove(req.id);
                            toast.success("Request approved");
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1.5" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="glass-panel border-panel-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent History</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] pr-4">
              {historyRequests.length === 0 ? (
                <p className="text-center py-8 text-xs text-muted-foreground opacity-50">No history yet</p>
              ) : (
                <div className="space-y-2">
                  {historyRequests.slice().reverse().map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 text-xs">
                      <div className="flex items-center gap-3">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{req.fileName}</span>
                        <span className="text-muted-foreground">by {req.officerName}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-medium ${
                        req.status === "approved" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                      }`}>
                        {req.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
