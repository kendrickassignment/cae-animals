import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  FileText,
  Building2,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Files,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getRiskBgColor } from "@/data/seed-data";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useRealAnalyses } from "@/hooks/useRealAnalyses";
import AnalysisProgress from "@/components/AnalysisProgress";
import RiskScoreLegend from "@/components/RiskScoreLegend";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { computeFileHash } from "@/lib/file-hash";
import { useAnalysisQueue, type UploadFile } from "@/hooks/useAnalysisQueue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const RISK_COLORS: Record<string, string> = {
  critical: "#DC2626",
  high: "#EA580C",
  medium: "#D97706",
  low: "#16A34A",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();
  const { jobs, isProcessing, submitFiles, duplicateDialog, handleDuplicateAction } = useAnalysisQueue();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const { data: realAnalyses = [] } = useRealAnalyses();

  // Only show real (live) analyses — no demo/seed data
  const allAnalyses = useMemo(() => {
    return realAnalyses;
  }, [realAnalyses]);

  const mergedGroups = useMemo(() => {
    const groups = new Map<string, number>();
    for (const f of uploadFiles) {
      if (!f.companyName) continue;
      const key = `${f.companyName.toLowerCase().trim()}::${f.reportYear}`;
      groups.set(key, (groups.get(key) || 0) + 1);
    }
    return groups;
  }, [uploadFiles]);

  const getMergeCount = (companyName: string, reportYear: string) => {
    if (!companyName) return 0;
    return mergedGroups.get(`${companyName.toLowerCase().trim()}::${reportYear}`) || 0;
  };

  const handleAnalyze = async () => {
    await submitFiles(uploadFiles);
    setUploadFiles([]);
  };

  const onDuplicateAction = (proceed: boolean) => {
    if (!proceed && duplicateDialog) {
      navigate(`/analysis/${duplicateDialog.analysisId}`);
    }
    handleDuplicateAction(proceed);
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Enforce max 3 files total
    const remaining = 3 - uploadFiles.length;
    if (remaining <= 0) {
      toast.error("You can upload up to 3 files per analysis. Please remove some files first.");
      return;
    }
    const filesToAdd = acceptedFiles.slice(0, remaining);
    if (acceptedFiles.length > remaining) {
      toast.error(`Only ${remaining} more file${remaining === 1 ? "" : "s"} allowed. Extra files were ignored.`);
    }

    const filesWithHash = await Promise.all(
      filesToAdd.map(async (file) => ({
        file,
        companyName: "",
        reportYear: "2024",
        hash: await computeFileHash(file),
      })),
    );

    setUploadFiles((prev) => [...prev, ...filesWithHash]);
  }, [uploadFiles.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 3,
    maxSize: 25 * 1024 * 1024,
    onDropRejected: (rejections) => {
      const tooMany = rejections.some(r => r.errors.some(e => e.code === "too-many-files"));
      const tooLarge = rejections.some(r => r.errors.some(e => e.code === "file-too-large"));
      const wrongType = rejections.some(r => r.errors.some(e => e.code === "file-invalid-type"));
      if (wrongType) toast.error("Only PDF files are accepted. Please upload .pdf files only.");
      else if (tooMany) toast.error("You can upload up to 3 files per analysis. Please remove some files and try again.");
      else if (tooLarge) toast.error("Each file must be under 25 MB. Try compressing your PDF with a tool like iLovePDF or SmallPDF before uploading.");
    },
  });

  // Stats and charts use ONLY real analyses (user_id IS NOT NULL)
  const stats = useMemo(() => {
    const totalReports = realAnalyses.length;
    const companyNames = new Set(realAnalyses.map((a) => a.company_name.toLowerCase()));
    const totalCompanies = companyNames.size;
    const highRisk = realAnalyses.filter(
      (a) => a.overall_risk_level === "critical" || a.overall_risk_level === "high",
    ).length;
    const avgScore =
      totalReports > 0 ? Math.round(realAnalyses.reduce((s, a) => s + a.overall_risk_score, 0) / totalReports) : 0;
    return { totalReports, totalCompanies, highRisk, avgScore };
  }, [realAnalyses]);

  const riskDistribution = useMemo(() => {
    const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    realAnalyses.forEach((a) => {
      counts[a.overall_risk_level] = (counts[a.overall_risk_level] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [realAnalyses]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Admin Badge */}
      {isAdmin && (
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg w-fit">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="font-nav text-xs tracking-wider text-primary uppercase">Admin</span>
        </div>
      )}
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Reports", value: stats.totalReports, icon: FileText, color: "text-foreground" },
          { label: "Companies Tracked", value: stats.totalCompanies, icon: Building2, color: "text-foreground" },
          { label: "High Risk Findings", value: stats.highRisk, icon: AlertTriangle, color: "text-destructive" },
          { label: "Avg Risk Score", value: stats.avgScore, icon: BarChart3, color: "text-risk-high" },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="bg-card rounded-lg p-5 border border-border shadow-sm border-t-[3px] border-t-primary animate-float-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
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
          <div
            {...getRootProps()}
            className={`bg-card rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-all hover:border-primary ${isDragActive ? "border-primary bg-primary/5" : "border-border"}`}
          >
            <input {...getInputProps()} />
            <Upload className="h-10 w-10 text-primary mx-auto mb-3" />
            <p className="font-body text-foreground font-bold mb-1">
              {isDragActive ? "Drop PDF reports here..." : "Drag and drop your PDFs here, or click to browse"}
            </p>
            <p className="font-body text-sm text-muted-foreground">
              PDF files only • Max 25MB per file • Up to 3 files per analysis
            </p>
          </div>

          {/* Progress */}
          {jobs.length > 0 && (
            <div className="space-y-3">
              {jobs.map((job) => (
                <AnalysisProgress key={job.key} stage={job.stage} companyName={job.companyName} />
              ))}
            </div>
          )}

          {uploadFiles.length > 0 && (
            <div className="bg-card rounded-lg border border-border p-4 space-y-3">
              {uploadFiles.map((uf, i) => {
                const mergeCount = getMergeCount(uf.companyName, uf.reportYear);
                return (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-3 bg-muted rounded-md"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm font-bold truncate">{uf.file.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="font-body text-xs text-muted-foreground">
                          {(uf.file.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                        {mergeCount > 1 && (
                          <span className="flex items-center gap-0.5 text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                            <Files className="h-3 w-3" />
                            {mergeCount} merged for {uf.companyName} {uf.reportYear}
                          </span>
                        )}
                      </div>
                    </div>
                    <Input
                      placeholder="Company Name"
                      value={uf.companyName}
                      onChange={(e) => {
                        const copy = [...uploadFiles];
                        copy[i].companyName = e.target.value;
                        setUploadFiles(copy);
                      }}
                      className="w-full sm:w-40 text-sm font-body"
                    />
                    <Select
                      value={uf.reportYear}
                      onValueChange={(v) => {
                        const copy = [...uploadFiles];
                        copy[i].reportYear = v;
                        setUploadFiles(copy);
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-24 text-sm font-body">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map((y) => (
                          <SelectItem key={y} value={String(y)}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
              <div className="flex items-center justify-between text-xs font-body text-muted-foreground px-1">
                <span>
                  {uploadFiles.length} file{uploadFiles.length !== 1 ? "s" : ""} selected
                </span>
                <span>Total: {(uploadFiles.reduce((s, f) => s + f.file.size, 0) / 1024 / 1024).toFixed(1)} MB</span>
              </div>
              <Button
                className="w-full font-body font-bold"
                disabled={uploadFiles.some((f) => !f.companyName) || isProcessing}
                onClick={handleAnalyze}
              >
                {isProcessing
                  ? "ANALYZING..."
                  : uploadFiles.length > 1
                    ? `ANALYZE ${uploadFiles.length} REPORTS (MERGED)`
                    : "ANALYZE REPORT"}
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
                      <th className="font-nav text-[11px] tracking-wider text-left p-3 hidden md:table-cell">STATUS</th>
                      <th className="font-nav text-[11px] tracking-wider text-left p-3 hidden lg:table-cell">SOURCE</th>
                      <th className="font-nav text-[11px] tracking-wider text-left p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const totalPages = Math.max(1, Math.ceil(allAnalyses.length / PAGE_SIZE));
                      const safePage = Math.min(currentPage, totalPages);
                      const start = (safePage - 1) * PAGE_SIZE;
                      const pageItems = allAnalyses.slice(start, start + PAGE_SIZE);
                      return pageItems.map((analysis, i) => (
                        <tr
                          key={analysis.id}
                          className={`border-t border-border hover:bg-muted/50 cursor-pointer transition-colors ${i % 2 === 1 ? "bg-muted/30" : ""}`}
                          onClick={() => navigate(`/analysis/${analysis.id}`)}
                        >
                          <td className="p-3 font-body text-sm font-bold">{analysis.company_name}</td>
                          <td className="p-3 font-body text-sm text-muted-foreground hidden sm:table-cell">
                            {analysis.report_year}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${getRiskBgColor(analysis.overall_risk_level)}`}
                            >
                              {analysis.overall_risk_level}
                            </span>
                          </td>
                          <td className="p-3 font-display text-lg hidden md:table-cell">
                            {analysis.overall_risk_score}
                          </td>
                          <td className="p-3 hidden md:table-cell">
                            {(analysis as any).verified ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-risk-low-bg text-risk-low">
                                <CheckCircle2 className="h-3 w-3" /> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-muted text-muted-foreground">
                                <XCircle className="h-3 w-3" /> Unverified
                              </span>
                            )}
                          </td>
                          <td className="p-3 hidden lg:table-cell">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                              ⚡ Live
                            </span>
                          </td>
                          <td className="p-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="font-nav text-[11px] tracking-wider text-secondary"
                            >
                              VIEW
                            </Button>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {allAnalyses.length > PAGE_SIZE &&
                (() => {
                  const totalPages = Math.max(1, Math.ceil(allAnalyses.length / PAGE_SIZE));
                  const safePage = Math.min(currentPage, totalPages);
                  return (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
                      <span className="font-body text-xs text-muted-foreground">
                        {allAnalyses.length} total analyses
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={safePage <= 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentPage((p) => Math.max(1, p - 1));
                          }}
                          className="font-nav text-[11px] tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground border-none h-7 px-3"
                        >
                          <ChevronLeft className="h-3 w-3 mr-1" /> Previous
                        </Button>
                        <span className="font-body text-xs text-muted-foreground px-2">
                          Page {safePage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={safePage >= totalPages}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentPage((p) => Math.min(totalPages, p + 1));
                          }}
                          className="font-nav text-[11px] tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground border-none h-7 px-3"
                        >
                          Next <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  );
                })()}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-card rounded-lg border border-border p-5">
          <h3 className="font-display text-lg mb-4">RISK DISTRIBUTION</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  strokeWidth={2}
                >
                  {riskDistribution.map((entry) => (
                    <Cell key={entry.name} fill={RISK_COLORS[entry.name] || "#6B7280"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {riskDistribution.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: RISK_COLORS[entry.name] || "#6B7280" }}
                />
                <span className="font-body text-xs capitalize text-muted-foreground">
                  {entry.name} ({entry.value})
                </span>
              </div>
            ))}
          </div>
          <RiskScoreLegend className="mt-5 pt-4 border-t border-border" />
        </div>
      </div>
      <Dialog
        open={!!duplicateDialog}
        onOpenChange={(open) => {
          if (!open) onDuplicateAction(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              {duplicateDialog?.type === "hash" ? "Duplicate PDF Detected" : "Existing Analysis Found"}
            </DialogTitle>
            <DialogDescription className="font-body text-muted-foreground pt-2">
              {duplicateDialog?.type === "hash" ? (
                <>
                  This exact PDF was already analyzed by <strong>{duplicateDialog.uploaderEmail}</strong> on{" "}
                  <strong>{duplicateDialog.date}</strong>.
                  <br />
                  Company: <strong>{duplicateDialog.companyName}</strong>
                  {duplicateDialog.score !== null && (
                    <>
                      , Score: <strong>{duplicateDialog.score}</strong>
                    </>
                  )}
                  .
                </>
              ) : (
                <>
                  An analysis for <strong>{duplicateDialog?.companyName}</strong> ({duplicateDialog?.reportYear})
                  already exists, uploaded by <strong>{duplicateDialog?.uploaderEmail}</strong> on{" "}
                  <strong>{duplicateDialog?.date}</strong>. Would you like to view it?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => onDuplicateAction(false)}>
              View Existing Analysis
            </Button>
            <Button onClick={() => onDuplicateAction(true)}>Upload Anyway</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
