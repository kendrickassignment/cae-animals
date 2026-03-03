import { useDropzone } from "react-dropzone";
import { Upload, Files } from "lucide-react";
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
    const newFiles = await Promise.all(
      accepted.map(async (f) => {
        const hash = await computeFileHash(f);
        return { file: f, companyName: "", reportYear: "2024", hash };
      })
    );
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "application/pdf": [".pdf"] }, maxFiles: 30 });

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

      <div
        {...getRootProps()}
        className={`bg-card rounded-lg border-2 border-dashed p-12 text-center cursor-pointer transition-all hover:border-primary ${isDragActive ? "border-primary bg-primary/5" : "border-border"}`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
        <p className="font-body text-foreground font-bold text-lg mb-1">Drop PDF reports here or click to upload</p>
        <p className="font-body text-sm text-muted-foreground">Accepts .pdf files (up to 30 at once, max 50MB each)</p>
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
          <Button className="w-full font-body font-bold" disabled={files.some(f => !f.companyName) || isProcessing} onClick={handleAnalyze}>
            {isProcessing ? "ANALYZING..." : "START ANALYSIS"}
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
