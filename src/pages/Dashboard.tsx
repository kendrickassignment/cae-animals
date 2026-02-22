import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Building2, AlertTriangle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { seedAnalyses, seedCompanies, getRiskBgColor } from "@/data/seed-data";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { uploadReport, analyzeReport, getReportStatus, sanitizeErrorMessage } from "@/services/api";
import { useRealAnalyses, fetchAndSaveAnalysis } from "@/hooks/useRealAnalyses";
import AnalysisProgress from "@/components/AnalysisProgress";
import { useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@/hooks/useNotifications";

const RISK_COLORS: Record<string, string> = {
  critical: "#DC2626",
  high: "#EA580C",
  medium: "#D97706",
  low: "#16A34A",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const [uploadFiles, setUploadFiles] = useState<{ file: File; companyName: string; reportYear: string }[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [progressStages, setProgressStages] = useState<Record<string, { stage: string; companyName: string }>>({});

  const { data: realAnalyses = [] } = useRealAnalyses();

  // Combine seed + real, real takes priority for same company
  const allAnalyses = useMemo(() => {
    const realCompanies = new Set(realAnalyses.map(a => a.company_name.toLowerCase()));
    const filtered = seedAnalyses.filter(s => !realCompanies.has(s.company_name.toLowerCase()));
    return [...realAnalyses, ...filtered];
  }, [realAnalyses]);

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
      for (const uf of uploadFiles) {
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

          const pollInterval = setInterval(async () => {
            try {
              const status = await getReportStatus(uploadResult.report_id);
              if (status.status === "completed" && status.analysis_id) {
                clearInterval(pollInterval);
                updateStage(key, "saving", uf.companyName);
                const savedId = await fetchAndSaveAnalysis(status.analysis_id, user.id, report.id, uf.companyName, parseInt(uf.reportYear));
                await supabase.from("reports").update({ status: "completed", processing_completed_at: new Date().toISOString(), analysis_id: savedId } as any).eq("id", report.id);
                updateStage(key, "completed", uf.companyName);
                toast.success(`Analysis completed for ${uf.companyName}!`);
                addNotification(`Analysis completed: ${uf.companyName}`, "success");
                queryClient.invalidateQueries({ queryKey: ["real-analyses"] });
                setTimeout(() => removeStage(key), 2000);
              } else if (status.status === "failed") {
                clearInterval(pollInterval);
                await supabase.from("reports").update({ status: "failed" }).eq("id", report.id);
                toast.error(`Analysis failed: ${sanitizeErrorMessage(status.error || "Unknown error")}`);
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
      setUploadFiles([]);
    } catch (err: any) { toast.error(`Error: ${sanitizeErrorMessage(err.message)}`); }
    finally { setAnalyzing(false); }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadFiles(prev => [...prev, ...acceptedFiles.map(f => ({ file: f, companyName: "", reportYear: "2024" }))]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "application/pdf": [".pdf"] }, maxFiles: 10 });

  const stats = useMemo(() => {
    const totalReports = allAnalyses.length;
    const companyNames = new Set([...allAnalyses.map(a => a.company_name), ...seedCompanies.map(c => c.name)]);
    const totalCompanies = companyNames.size;
    const highRisk = allAnalyses.filter(a => a.overall_risk_level === "critical" || a.overall_risk_level === "high").length;
    const avgScore = totalReports > 0 ? Math.round(allAnalyses.reduce((s, a) => s + a.overall_risk_score, 0) / totalReports) : 0;
    return { totalReports, totalCompanies, highRisk, avgScore };
  }, [allAnalyses]);

  const riskDistribution = useMemo(() => {
    const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    allAnalyses.forEach(a => { counts[a.overall_risk_level] = (counts[a.overall_risk_level] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [allAnalyses]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Reports", value: stats.totalReports, icon: FileText, color: "text-foreground" },
          { label: "Companies Tracked", value: stats.totalCompanies, icon: Building2, color: "text-foreground" },
          { label: "High Risk Findings", value: stats.highRisk, icon: AlertTriangle, color: "text-destructive" },
          { label: "Avg Risk Score", value: stats.avgScore, icon: BarChart3, color: "text-risk-high" },
        ].map((stat, i) => (
          <div key={stat.label} className="bg-card rounded-lg p-5 border border-border shadow-sm border-t-[3px] border-t-primary animate-float-in" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-body text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</span>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className={`font-display text-4xl ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Upload */}
          <div {...getRootProps()} className={`bg-card rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-all hover:border-primary ${isDragActive ? "border-primary bg-primary/5" : "border-border"}`}>
            <input {...getInputProps()} />
            <Upload className="h-10 w-10 text-primary mx-auto mb-3" />
            <p className="font-body text-foreground font-bold mb-1">{isDragActive ? "Drop PDF reports here..." : "Drop PDF reports here or click to upload"}</p>
            <p className="font-body text-sm text-muted-foreground">Accepts .pdf files (up to 10 at once)</p>
          </div>

          {/* Progress */}
          {Object.entries(progressStages).length > 0 && (
            <div className="space-y-3">
              {Object.entries(progressStages).map(([key, { stage, companyName }]) => (
                <AnalysisProgress key={key} stage={stage} companyName={companyName} />
              ))}
            </div>
          )}

          {uploadFiles.length > 0 && (
            <div className="bg-card rounded-lg border border-border p-4 space-y-3">
              {uploadFiles.map((uf, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-3 bg-muted rounded-md">
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-bold truncate">{uf.file.name}</p>
                    <p className="font-body text-xs text-muted-foreground">{(uf.file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                  <Input placeholder="Company Name" value={uf.companyName} onChange={(e) => { const copy = [...uploadFiles]; copy[i].companyName = e.target.value; setUploadFiles(copy); }} className="w-full sm:w-40 text-sm font-body" />
                  <Select value={uf.reportYear} onValueChange={(v) => { const copy = [...uploadFiles]; copy[i].reportYear = v; setUploadFiles(copy); }}>
                    <SelectTrigger className="w-full sm:w-24 text-sm font-body"><SelectValue /></SelectTrigger>
                    <SelectContent>{[2026, 2025, 2024, 2023, 2022, 2021, 2020].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              ))}
              <Button className="w-full font-body font-bold" disabled={uploadFiles.some(f => !f.companyName) || analyzing} onClick={handleAnalyze}>
                {analyzing ? "ANALYZING..." : "START ANALYSIS"}
              </Button>
            </div>
          )}

          {/* Recent analyses */}
          <div>
            <h3 className="font-display text-xl mb-4">RECENT ANALYSES</h3>
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-sidebar text-sidebar-foreground">
                      <th className="font-nav text-[11px] tracking-wider text-left p-3">COMPANY</th>
                      <th className="font-nav text-[11px] tracking-wider text-left p-3 hidden sm:table-cell">YEAR</th>
                      <th className="font-nav text-[11px] tracking-wider text-left p-3">RISK</th>
                      <th className="font-nav text-[11px] tracking-wider text-left p-3 hidden md:table-cell">SCORE</th>
                      <th className="font-nav text-[11px] tracking-wider text-left p-3 hidden lg:table-cell">SOURCE</th>
                      <th className="font-nav text-[11px] tracking-wider text-left p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {allAnalyses.map((analysis, i) => (
                      <tr key={analysis.id} className={`border-t border-border hover:bg-muted/50 cursor-pointer transition-colors ${i % 2 === 1 ? "bg-muted/30" : ""}`} onClick={() => navigate(`/analysis/${analysis.id}`)}>
                        <td className="p-3 font-body text-sm font-bold">{analysis.company_name}</td>
                        <td className="p-3 font-body text-sm text-muted-foreground hidden sm:table-cell">{analysis.report_year}</td>
                        <td className="p-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${getRiskBgColor(analysis.overall_risk_level)}`}>{analysis.overall_risk_level}</span>
                        </td>
                        <td className="p-3 font-display text-lg hidden md:table-cell">{analysis.overall_risk_score}</td>
                        <td className="p-3 hidden lg:table-cell">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${(analysis as any).isReal ? "bg-primary/10 text-primary" : "bg-risk-low-bg text-risk-low"}`}>
                            {(analysis as any).isReal ? "⚡ Live" : "✓ Demo"}
                          </span>
                        </td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm" className="font-nav text-[11px] tracking-wider text-secondary">VIEW</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-card rounded-lg border border-border p-5">
          <h3 className="font-display text-lg mb-4">RISK DISTRIBUTION</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} strokeWidth={2}>
                  {riskDistribution.map((entry) => (<Cell key={entry.name} fill={RISK_COLORS[entry.name] || "#6B7280"} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {riskDistribution.map(entry => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: RISK_COLORS[entry.name] || "#6B7280" }} />
                <span className="font-body text-xs capitalize text-muted-foreground">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
