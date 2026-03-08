import { useDropzone } from "react-dropzone";
import { Upload, Files, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { computeFileHash } from "@/lib/file-hash";
import { useAnalysisQueue, type UploadFile } from "@/hooks/useAnalysisQueue";
import AnalysisProgress from "@/components/AnalysisProgress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

export default function UploadPage() {
  const navigate = useNavigate();
  const { jobs, isProcessing, submitFiles, duplicateDialog, handleDuplicateAction } = useAnalysisQueue();
  const [files, setFiles] = useState<UploadFile[]>([]);

  const onDrop = useCallback(async (accepted: File[]) => {
    // Reject ALL if total would exceed 3
    const total = files.length + accepted.length;
    if (total > 3) {
      toast.warning("⚠️ Upload limit exceeded", {
        description: `You tried to add ${accepted.length} file${accepted.length !== 1 ? "s" : ""}, but only ${3 - files.length} slot${3 - files.length !== 1 ? "s" : ""} remaining. Maximum 3 files per analysis. Please remove existing files first.`,
        duration: 6000,
      });
      return;
    }

    // Reject ALL if any file exceeds 25MB
    const oversized = accepted.filter(f => f.size > 25 * 1024 * 1024);
    if (oversized.length > 0) {
      toast.warning("⚠️ File too large", {
        description: `"${oversized[0].name}" is ${(oversized[0].size / 1024 / 1024).toFixed(1)} MB. Each file must be under 25 MB. Try compressing with iLovePDF or SmallPDF.`,
        duration: 6000,
      });
      return;
    }

    // Reject ALL if any file is not PDF
    const nonPdf = accepted.filter(f => f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf"));
    if (nonPdf.length > 0) {
      toast.warning("⚠️ Invalid file type", {
        description: `"${nonPdf[0].name}" is not a PDF. Only PDF files are accepted.`,
        duration: 6000,
      });
      return;
    }

    const newFiles = await Promise.all(
      accepted.map(async (f) => {
        const hash = await computeFileHash(f);
        return { file: f, companyName: "", reportYear: "2024", hash };
      })
    );
    setFiles((prev) => [...prev, ...newFiles]);
  }, [files.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: 25 * 1024 * 1024,
    onDropRejected: (rejections) => {
      const wrongType = rejections.some(r => r.errors.some(e => e.code === "file-invalid-type"));
      const tooLarge = rejections.some(r => r.errors.some(e => e.code === "file-too-large"));
      if (wrongType) {
        toast.warning("⚠️ Invalid file type", {
          description: "Only PDF files are accepted. Please upload .pdf files only.",
          duration: 6000,
        });
      } else if (tooLarge) {
        toast.warning("⚠️ File too large", {
          description: "Each file must be under 25 MB. Try compressing your PDF with iLovePDF or SmallPDF.",
          duration: 6000,
        });
      }
    },
  });

  // Compute merged group info for visual indicator
  const mergedGroups = useMemo(() => {
    const groups = new Map<string, number>();
    for (const f of files) {
      if (!f.companyName) continue;
      const key = `${f.companyName.toLowerCase().trim()}::${f.reportYear}`;
      groups.set(key, (groups.get(key) || 0) + 1);
    }
    return groups;
  }, [files]);

  const getMergeCount = (companyName: string, reportYear: string) => {
    if (!companyName) return 0;
    return mergedGroups.get(`${companyName.toLowerCase().trim()}::${reportYear}`) || 0;
  };

  const handleAnalyze = async () => {
    await submitFiles(files);
    setFiles([]);
  };

  // Handle duplicate dialog navigation
  const onDuplicateAction = (proceed: boolean) => {
    if (!proceed && duplicateDialog) {
      navigate(`/analysis/${duplicateDialog.analysisId}`);
    }
    handleDuplicateAction(proceed);
  };

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <h1 className="font-display text-4xl text-foreground">NEW ANALYSIS</h1>
      <p className="font-body text-muted-foreground -mt-4">Upload a sustainability report and let CAE do the heavy reading for you.</p>

      <div
        {...getRootProps()}
        className={`bg-card rounded-lg border-2 border-dashed p-12 text-center cursor-pointer transition-all hover:border-primary ${isDragActive ? "border-primary bg-primary/5" : "border-border"}`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
        <p className="font-body text-foreground font-bold text-lg mb-1">Drag and drop your PDFs here, or click to browse</p>
        <p className="font-body text-sm text-muted-foreground">PDF files only • Max 25MB per file • Up to 3 files</p>
      </div>

      {/* Progress indicators from global queue */}
      {jobs.length > 0 && (
        <div className="space-y-3">
          {jobs.map((job) => (
            <AnalysisProgress key={job.key} stage={job.stage} companyName={job.companyName} />
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-4 space-y-3">
          {files.map((uf, i) => {
            const mergeCount = getMergeCount(uf.companyName, uf.reportYear);
            return (
              <div key={i} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-3 bg-muted rounded-md">
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-bold truncate">{uf.file.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="font-body text-xs text-muted-foreground">{(uf.file.size / 1024 / 1024).toFixed(1)} MB</p>
                    {mergeCount > 1 && (
                      <span className="flex items-center gap-0.5 text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                        <Files className="h-3 w-3" />
                        {mergeCount} merged for {uf.companyName} {uf.reportYear}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive transition-colors shrink-0" title="Remove file">
                  <X className="h-4 w-4" />
                </button>
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
            );
          })}
          <div className="flex items-center justify-between text-xs font-body text-muted-foreground px-1">
            <span>{files.length} file{files.length !== 1 ? "s" : ""} selected</span>
            <span>Total: {(files.reduce((s, f) => s + f.file.size, 0) / 1024 / 1024).toFixed(1)} MB</span>
          </div>
          <Button className="w-full font-body font-bold" disabled={files.some(f => !f.companyName) || isProcessing} onClick={handleAnalyze}>
            {isProcessing ? "ANALYZING..." : files.length > 1 ? `ANALYZE ${files.length} REPORTS (MERGED)` : "ANALYZE REPORT"}
          </Button>
        </div>
      )}

      {/* Duplicate detection dialog */}
      <Dialog open={!!duplicateDialog} onOpenChange={(open) => { if (!open) onDuplicateAction(false); }}>
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
                  {duplicateDialog.score !== null && <>, Score: <strong>{duplicateDialog.score}</strong></>}.
                </>
              ) : (
                <>
                  An analysis for <strong>{duplicateDialog?.companyName}</strong> ({duplicateDialog?.reportYear}) already exists,
                  uploaded by <strong>{duplicateDialog?.uploaderEmail}</strong> on <strong>{duplicateDialog?.date}</strong>.
                  Would you like to view it?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => onDuplicateAction(false)}>
              View Existing Analysis
            </Button>
            <Button onClick={() => onDuplicateAction(true)}>
              Upload Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
