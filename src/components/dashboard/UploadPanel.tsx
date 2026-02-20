import { useState } from "react";
import { FileUp, FileText, CheckCircle2, AlertCircle, Loader2, Send, Clock, BrainCircuit, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface UploadPanelProps {
  onDataUpdate: (analysis: any) => void;
  currentRequest?: {
    fileName: string;
    fileType?: string;
    fileUrl?: string;
    status: "pending" | "approved" | "rejected";
  };
  onRequestApproval: (fileMeta: { fileName: string; fileType?: string; fileUrl?: string }) => void;
}

export default function UploadPanel({ onDataUpdate, currentRequest, onRequestApproval }: UploadPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const approvalStatus: "none" | "pending" | "approved" | "rejected" = currentRequest?.status ?? "none";
  const locked = approvalStatus === "pending" || approvalStatus === "approved";
  const displayFileName = locked ? currentRequest?.fileName ?? "" : file?.name ?? "";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        toast.error("Please upload a PDF document for best results.");
      }
      setFile(selectedFile);
      setAnalysis(null);
    }
  };

  const handleUpload = async () => {
    const effectiveFileName = file?.name || currentRequest?.fileName;
    if (!effectiveFileName) return;

    setUploading(true);
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const model = import.meta.env.VITE_GEMINI_MODEL || "gemini-1.5-flash-latest";

      if (!apiKey) {
        throw new Error("Gemini API key not found. Please check your .env.local file.");
      }

      // In a real app, we'd send the file content to Gemini.
      // Since we're in a frontend-only mock, we'll simulate the analysis
      // but use Gemini to generate a response based on the filename/type.
      
      const prompt = `Act as an Urban Infrastructure Analyst for Mumbai Smart City. 
      The user has uploaded a document named "${effectiveFileName}". 
      Analyze the document and provide a structured JSON update for the system metrics.
      
      Available IDs:
      Dams: dam_01 (Vihar), dam_02 (Tulsi), dam_03 (Powai)
      Bridges: bridge_01 (Sea Link), bridge_02 (Mahim), bridge_03 (Vashi)
      Transformers: tf_01 (Dharavi), tf_02 (BKC), tf_03 (Kurla)

      Your response MUST be a JSON object inside a code block, formatted like this:
      {
        "structuredUpdate": {
          "dams": [{"id": "dam_01", "waterLevel": 85, "status": "warning"}],
          "bridges": [{"id": "bridge_02", "loadPercent": 95, "status": "critical"}],
          "transformers": [{"id": "tf_03", "loadPercent": 98, "status": "critical"}],
          "weather": {"temperature": 34, "condition": "Heavy Rain"},
          "alerts": [{"id": "new_01", "severity": "critical", "message": "AI Alert: Heavy rainfall detected in report", "source": "AI Analysis", "timestamp": "${new Date().toISOString()}"}]
        },
        "explanation": "Brief explanation of what was found in the PDF"
      }

      Choose values that make sense based on the filename "${effectiveFileName}". 
      If the filename suggests a disaster or heavy rain, make the status "critical".`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      });

      if (!res.ok) throw new Error("AI analysis failed.");

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      // Extract JSON from code block
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      const result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

      if (result && result.structuredUpdate) {
        setAnalysis(result.explanation || rawText);
        onDataUpdate(result);
        toast.success("Document analyzed and system data updated!");
      } else {
        setAnalysis(rawText || "No analysis generated.");
        toast.info("Document analyzed, but no structured data found.");
      }

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to analyze document.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-float-up">
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-2xl font-bold text-foreground">Document Intelligence</h2>
        <p className="text-muted-foreground">Upload infrastructure reports for automated AI analysis and system updates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 glass-panel border-panel-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileUp className="h-4 w-4 text-primary" />
              Upload Report
            </CardTitle>
            <CardDescription>PDF recommended</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className={`
                border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all
                ${displayFileName ? "border-primary/50 bg-primary/5" : "border-muted-foreground/20 hover:border-primary/30"}
              `}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                disabled={locked}
              />
              <label 
                htmlFor="file-upload"
                className={locked ? "flex flex-col items-center gap-2 opacity-60 cursor-not-allowed" : "cursor-pointer flex flex-col items-center gap-2"}
              >
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <FileText className={`h-6 w-6 ${displayFileName ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <span className="text-xs font-medium text-center">
                  {displayFileName || "Select or drag file"}
                </span>
              </label>
            </div>

            {currentRequest?.fileUrl && (
              <a
                href={currentRequest.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full"
              >
                <Button type="button" variant="outline" className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Uploaded Document
                </Button>
              </a>
            )}

            <Button 
              className="w-full" 
              disabled={(!locked && !file) || uploading || approvalStatus !== "approved"}
              onClick={handleUpload}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze with AI"
              )}
            </Button>

            {!locked && file && approvalStatus === "none" && (
              <Button 
                variant="outline" 
                className="w-full border-primary/50 text-primary hover:bg-primary/10"
                onClick={() => {
                  const fileUrl = URL.createObjectURL(file);
                  onRequestApproval({ fileName: file.name, fileType: file.type, fileUrl });
                }}
              >
                <Send className="mr-2 h-4 w-4" />
                Request Admin Approval
              </Button>
            )}

            {approvalStatus === "pending" && (
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-center gap-2 text-warning">
                <Clock className="h-4 w-4 animate-pulse" />
                <span className="text-[10px] font-medium uppercase tracking-wider">Awaiting Admin Approval</span>
              </div>
            )}

            {approvalStatus === "rejected" && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-[10px] font-medium uppercase tracking-wider">Request Rejected by Admin</span>
              </div>
            )}

            {approvalStatus === "approved" && (
              <div className="p-3 rounded-lg bg-success/10 border border-success/20 flex items-center gap-2 text-success">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-[10px] font-medium uppercase tracking-wider">Approved - Ready for AI</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 glass-panel border-panel-border overflow-hidden flex flex-col">
          <CardHeader className="border-b border-panel-border bg-muted/30">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-primary" />
              AI Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <ScrollArea className="h-[400px]">
              {analysis ? (
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-success/10 border border-success/20">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-success">Analysis Complete</h4>
                      <p className="text-xs text-muted-foreground">The system has identified actionable insights from the report.</p>
                    </div>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {analysis}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-3 opacity-50">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="text-base font-medium">No Analysis Available</h4>
                    <p className="text-sm text-muted-foreground">Upload a document to see AI-powered infrastructure insights.</p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
