import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { uploadReport, analyzeReport, getReportStatus, sanitizeErrorMessage } from "@/services/api";
import { fetchAndSaveAnalysis } from "@/hooks/useRealAnalyses";
import AnalysisProgress from "@/components/AnalysisProgress";
import { useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@/hooks/useNotifications";

export default function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const [files, setFiles] = useState<{ file: File; companyName: string; reportYear: string }[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [progressStages, setProgressStages] = useState<Record<string, { stage: string; companyName: string }>>({});

  const onDrop = useCallback((accepted: File[]) => {
    setFiles(prev => [...prev, ...accepted.map(f => ({ file: f, companyName: "", reportYear: "2024" }))]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "application/pdf": [".pdf"] }, maxFiles: 10 });

  const updateStage = (key: string, stage: string, companyName: string) => {
    setProgressStages(prev => ({ ...prev, [key]: { stage, companyName } }));
  };

  const removeStage = (key: string) => {
    setProgressStages(prev => { const copy = { ...prev }; delete copy[key]; return copy; });
  };

  const handleAnalyze = async () => {
    if (!user) { toast.error("You must be signed in."); return; }
    setAnalyzing(true);
    try {
      for (const uf of files) {
        const key = `${uf.file.name}-${Date.now()}`;
        updateStage(key, "uploading", uf.companyName);
        addNotification(`Uploading: ${uf.companyName || uf.file.name}`, "info");

        const filePath = `${user.id}/${Date.now()}_${uf.file.name}`;
        const { error: storageError } = await supabase.storage.from("reports").upload(filePath, uf.file);
        if (storageError) { toast.error(`Storage upload failed: ${storageError.message}`); removeStage(key); continue; }

        const { data: report, error: dbError } = await supabase.from("reports").insert({
          user_id: user.id, file_name: uf.file.name, file_size: uf.file.size, file_url: filePath,
          company_name: uf.companyName, report_year: parseInt(uf.reportYear), status: "uploading",
        }).select().single();
        if (dbError || !report) { toast.error(`Failed to create report record`); removeStage(key); continue; }

        try {
          const uploadResult = await uploadReport(uf.file);
          updateStage(key, "processing", uf.companyName);
          addNotification(`Processing PDF: ${uf.companyName}`, "info");
          await supabase.from("reports").update({ status: "processing" }).eq("id", report.id);

          await analyzeReport(uploadResult.report_id, uf.companyName, parseInt(uf.reportYear));
          updateStage(key, "analyzing", uf.companyName);
          addNotification(`Analyzing with AI: ${uf.companyName}`, "info");

          // Poll every 3 seconds
          const pollInterval = setInterval(async () => {
            try {
              const status = await getReportStatus(uploadResult.report_id);
              if (status.status === "completed" && status.analysis_id) {
                clearInterval(pollInterval);
                updateStage(key, "saving", uf.companyName);

                const savedId = await fetchAndSaveAnalysis(
                  status.analysis_id, user.id, report.id, uf.companyName, parseInt(uf.reportYear)
                );

                await supabase.from("reports").update({
                  status: "completed",
                  processing_completed_at: new Date().toISOString(),
                  analysis_id: savedId,
                } as any).eq("id", report.id);

                updateStage(key, "completed", uf.companyName);
                toast.success(`Analysis completed for ${uf.companyName}!`);
                addNotification(`Analysis completed: ${uf.companyName}`, "success");
                queryClient.invalidateQueries({ queryKey: ["real-analyses"] });

                setTimeout(() => {
                  removeStage(key);
                  if (savedId) navigate(`/analysis/${savedId}`);
                }, 1500);
              } else if (status.status === "failed") {
                clearInterval(pollInterval);
                await supabase.from("reports").update({ status: "failed" }).eq("id", report.id);
                toast.error(`Analysis failed for ${uf.companyName}: ${sanitizeErrorMessage(status.error || "Unknown error")}`);
                addNotification(`Analysis failed: ${uf.companyName}`, "error");
                removeStage(key);
              }
            } catch { /* keep polling */ }
          }, 3000);
          setTimeout(() => { clearInterval(pollInterval); removeStage(key); }, 300000);
        } catch {
          await supabase.from("reports").update({ status: "pending" }).eq("id", report.id);
          toast.warning(`${uf.file.name} saved to cloud. Backend analysis will run when available.`);
          addNotification(`${uf.file.name} queued for analysis`, "warning");
          removeStage(key);
        }
      }
      setFiles([]);
    } catch (err: any) { toast.error(`Error: ${sanitizeErrorMessage(err.message)}`); }
    finally { setAnalyzing(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <h1 className="font-display text-4xl text-foreground">NEW ANALYSIS</h1>

      <div
        {...getRootProps()}
        className={`bg-card rounded-lg border-2 border-dashed p-12 text-center cursor-pointer transition-all hover:border-primary ${isDragActive ? "border-primary bg-primary/5" : "border-border"}`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
        <p className="font-body text-foreground font-bold text-lg mb-1">Drop PDF reports here or click to upload</p>
        <p className="font-body text-sm text-muted-foreground">Accepts .pdf files (up to 10 at once, max 50MB each)</p>
      </div>

      {/* Progress indicators */}
      {Object.entries(progressStages).length > 0 && (
        <div className="space-y-3">
          {Object.entries(progressStages).map(([key, { stage, companyName }]) => (
            <AnalysisProgress key={key} stage={stage} companyName={companyName} />
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-4 space-y-3">
          {files.map((uf, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-3 bg-muted rounded-md">
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm font-bold truncate">{uf.file.name}</p>
                <p className="font-body text-xs text-muted-foreground">{(uf.file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
              <Input
                placeholder="Company Name" value={uf.companyName}
                onChange={e => { const c = [...files]; c[i].companyName = e.target.value; setFiles(c); }}
                className="w-full sm:w-40 text-sm font-body"
              />
              <Select value={uf.reportYear} onValueChange={v => { const c = [...files]; c[i].reportYear = v; setFiles(c); }}>
                <SelectTrigger className="w-full sm:w-24 text-sm font-body"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ))}
          <Button className="w-full font-body font-bold" disabled={files.some(f => !f.companyName) || analyzing} onClick={handleAnalyze}>
            {analyzing ? "ANALYZING..." : "START ANALYSIS"}
          </Button>
        </div>
      )}
    </div>
  );
}
