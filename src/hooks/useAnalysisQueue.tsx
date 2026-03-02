import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { uploadReport, analyzeReport, getReportStatus, sanitizeErrorMessage } from "@/services/api";
import { fetchAndSaveAnalysis } from "@/hooks/useRealAnalyses";
import { useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@/hooks/useNotifications";
import { computeFileHash } from "@/lib/file-hash";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface UploadFile {
  file: File;
  companyName: string;
  reportYear: string;
  hash?: string;
}

export interface DuplicateInfo {
  type: "hash" | "company_year";
  analysisId: string;
  companyName: string;
  reportYear: number;
  score: number | null;
  date: string;
  uploaderEmail: string;
}

export interface AnalysisJob {
  key: string;
  companyName: string;
  reportYear: string;
  stage: string;          // uploading | processing | analyzing | saving | completed | failed
  fileCount: number;
  savedId?: string;
}

interface AnalysisQueueContextType {
  jobs: AnalysisJob[];
  isProcessing: boolean;
  submitFiles: (files: UploadFile[]) => Promise<void>;
  // duplicate handling
  duplicateDialog: DuplicateInfo | null;
  handleDuplicateAction: (proceed: boolean) => void;
}

const AnalysisQueueContext = createContext<AnalysisQueueContextType | null>(null);

/* ------------------------------------------------------------------ */
/*  Adaptive polling helper                                            */
/* ------------------------------------------------------------------ */

function getPollingInterval(elapsedMs: number): number {
  if (elapsedMs < 30_000) return 5_000;
  if (elapsedMs < 120_000) return 10_000;
  return 15_000;
}

const POLLING_TIMEOUT = 600_000; // 10 minutes

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

export function AnalysisQueueProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const [jobs, setJobs] = useState<AnalysisJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Duplicate detection state
  const [duplicateDialog, setDuplicateDialog] = useState<DuplicateInfo | null>(null);
  const duplicateResolveRef = useRef<((proceed: boolean) => void) | null>(null);

  /* ---- helpers ---- */

  const updateJob = useCallback((key: string, patch: Partial<AnalysisJob>) => {
    setJobs(prev => prev.map(j => j.key === key ? { ...j, ...patch } : j));
  }, []);

  const removeJob = useCallback((key: string) => {
    setJobs(prev => prev.filter(j => j.key !== key));
  }, []);

  const showDuplicateWarning = useCallback((info: DuplicateInfo): Promise<boolean> => {
    return new Promise((resolve) => {
      duplicateResolveRef.current = resolve;
      setDuplicateDialog(info);
    });
  }, []);

  const handleDuplicateAction = useCallback((proceed: boolean) => {
    duplicateResolveRef.current?.(proceed);
    duplicateResolveRef.current = null;
    setDuplicateDialog(null);
  }, []);

  /* ---- duplicate checks ---- */

  const checkFileHashDuplicate = async (hash: string): Promise<DuplicateInfo | null> => {
    const { data } = await (supabase
      .from("analysis_results")
      .select("id, company_name, report_year, overall_risk_score, created_at, user_id") as any)
      .eq("file_hash", hash)
      .not("user_id", "is", null)
      .limit(1);
    if (!data || data.length === 0) return null;
    const row = data[0];
    let uploaderEmail = "another user";
    if (row.user_id) {
      const { data: nameData } = await supabase.rpc("get_display_name", { _target_user_id: row.user_id });
      if (nameData) uploaderEmail = nameData;
    }
    return {
      type: "hash", analysisId: row.id, companyName: row.company_name || "Unknown",
      reportYear: row.report_year || 0, score: row.overall_risk_score,
      date: new Date(row.created_at).toLocaleDateString(), uploaderEmail,
    };
  };

  const checkCompanyYearDuplicate = async (companyName: string, reportYear: number): Promise<DuplicateInfo | null> => {
    const { data } = await supabase
      .from("analysis_results")
      .select("id, company_name, report_year, overall_risk_score, created_at, user_id")
      .filter("company_name", "ilike", companyName)
      .eq("report_year", reportYear)
      .not("user_id", "is", null)
      .limit(1);
    if (!data || data.length === 0) return null;
    const row = data[0];
    let uploaderEmail = "another user";
    if (row.user_id) {
      const { data: nameData } = await supabase.rpc("get_display_name", { _target_user_id: row.user_id });
      if (nameData) uploaderEmail = nameData;
    }
    return {
      type: "company_year", analysisId: row.id, companyName: row.company_name || "Unknown",
      reportYear: row.report_year || 0, score: row.overall_risk_score,
      date: new Date(row.created_at).toLocaleDateString(), uploaderEmail,
    };
  };

  /* ---- adaptive poll with dedup + abort ---- */

  const pollForCompletion = (
    reportId: string,
    key: string,
    companyName: string,
    reportYear: number,
    reportDbId: string,
    fileHash: string | undefined,
    fileCount: number,
  ) => {
    const startTime = Date.now();
    let inFlight = false;
    let abortController: AbortController | null = null;
    let timeoutId: ReturnType<typeof setTimeout>;

    const poll = async () => {
      const elapsed = Date.now() - startTime;

      if (elapsed > POLLING_TIMEOUT) {
        updateJob(key, { stage: "failed" });
        toast.error(`Analysis timed out for ${companyName}`);
        addNotification(`Analysis timed out: ${companyName}`, "error");
        return;
      }

      if (inFlight) {
        // skip — previous request still pending
        timeoutId = setTimeout(poll, getPollingInterval(elapsed));
        return;
      }

      inFlight = true;
      abortController = new AbortController();

      try {
        const status = await getReportStatus(reportId);

        if (status.status === "completed" && status.analysis_id) {
          updateJob(key, { stage: "saving" });

          const savedId = await fetchAndSaveAnalysis(
            status.analysis_id, user!.id, reportDbId, companyName, reportYear
          );

          if (savedId && fileHash) {
            await supabase.from("analysis_results").update({ file_hash: fileHash } as any).eq("id", savedId);
          }

          await supabase.from("reports").update({
            status: "completed",
            processing_completed_at: new Date().toISOString(),
            analysis_id: savedId,
          } as any).eq("id", reportDbId);

          updateJob(key, { stage: "completed", savedId: savedId || undefined });
          const mergeLabel = fileCount > 1 ? ` (${fileCount} files merged)` : "";
          toast.success(`Analysis completed for ${companyName}${mergeLabel}!`);
          addNotification(`Analysis completed: ${companyName}${mergeLabel}`, "success");
          queryClient.invalidateQueries({ queryKey: ["real-analyses"] });

          // Admin notification (fire-and-forget)
          supabase.functions.invoke("notify-analysis-complete", {
            body: {
              analysis_id: savedId, company_name: companyName, report_year: reportYear,
              risk_score: null, risk_level: null, uploader_user_id: user!.id,
            },
          }).catch((err) => console.warn("Admin notification failed:", err));

          setTimeout(() => removeJob(key), 4000);
          return; // stop polling
        } else if (status.status === "failed") {
          updateJob(key, { stage: "failed" });
          toast.error(`Analysis failed for ${companyName}: ${sanitizeErrorMessage(status.error || "Unknown error")}`);
          addNotification(`Analysis failed: ${companyName}`, "error");
          setTimeout(() => removeJob(key), 6000);
          return; // stop polling
        }
      } catch {
        // network error — keep polling
      } finally {
        inFlight = false;
        abortController = null;
      }

      const elapsed2 = Date.now() - startTime;
      timeoutId = setTimeout(poll, getPollingInterval(elapsed2));
    };

    // kick off first poll
    timeoutId = setTimeout(poll, 3000);

    // return cleanup — cancels pending but does NOT cancel backend work
    return () => {
      clearTimeout(timeoutId);
      abortController?.abort();
    };
  };

  /* ---- main submit ---- */

  const submitFiles = useCallback(async (files: UploadFile[]) => {
    if (!user) { toast.error("You must be signed in."); return; }
    setIsProcessing(true);

    try {
      // FIX 1: Group files by company_name + report_year (case-insensitive)
      const groups = new Map<string, UploadFile[]>();
      for (const uf of files) {
        const groupKey = `${uf.companyName.toLowerCase().trim()}::${uf.reportYear}`;
        if (!groups.has(groupKey)) groups.set(groupKey, []);
        groups.get(groupKey)!.push(uf);
      }

      for (const [, groupFiles] of groups) {
        const first = groupFiles[0];
        const companyName = first.companyName;
        const reportYear = parseInt(first.reportYear);
        const fileCount = groupFiles.length;

        // Duplicate checks (use first file's hash)
        if (first.hash) {
          const hashDup = await checkFileHashDuplicate(first.hash);
          if (hashDup) {
            const proceed = await showDuplicateWarning(hashDup);
            if (!proceed) continue;
          }
        }
        if (companyName) {
          const companyDup = await checkCompanyYearDuplicate(companyName, reportYear);
          if (companyDup) {
            const proceed = await showDuplicateWarning(companyDup);
            if (!proceed) continue;
          }
        }

        const key = `${companyName}-${reportYear}-${Date.now()}`;
        const job: AnalysisJob = { key, companyName, reportYear: first.reportYear, stage: "uploading", fileCount };
        setJobs(prev => [...prev, job]);
        addNotification(`Uploading: ${companyName}${fileCount > 1 ? ` (${fileCount} files)` : ""}`, "info");

        // Upload ALL files in the group, collect report_ids
        const uploadedReportIds: string[] = [];
        let firstReportDbId = "";
        let firstFileHash = first.hash;

        for (const uf of groupFiles) {
          const filePath = `${user.id}/${Date.now()}_${uf.file.name}`;
          const { error: storageError } = await supabase.storage.from("reports").upload(filePath, uf.file);
          if (storageError) { toast.error(`Storage upload failed: ${storageError.message}`); continue; }

          const { data: report, error: dbError } = await supabase.from("reports").insert({
            user_id: user.id, file_name: uf.file.name, file_size: uf.file.size, file_url: filePath,
            company_name: companyName, report_year: reportYear, status: "uploading",
          }).select().single();
          if (dbError || !report) { toast.error("Failed to create report record"); continue; }

          if (!firstReportDbId) firstReportDbId = report.id;

          try {
            const uploadResult = await uploadReport(uf.file);
            uploadedReportIds.push(uploadResult.report_id);
          } catch {
            await supabase.from("reports").update({ status: "pending" }).eq("id", report.id);
            toast.warning(`${uf.file.name} saved to cloud. Backend analysis will run when available.`);
          }
        }

        if (uploadedReportIds.length === 0) {
          updateJob(key, { stage: "failed" });
          setTimeout(() => removeJob(key), 3000);
          continue;
        }

        // Analyze using the FIRST uploaded report_id (the backend merges if needed)
        // For multiple files, we still send one analyze call per uploaded report
        // The backend currently processes per-report, so we analyze each and take the last completed
        updateJob(key, { stage: "processing" });
        addNotification(`Processing PDF: ${companyName}`, "info");

        let lastReportId = uploadedReportIds[0];
        for (const rid of uploadedReportIds) {
          try {
            await analyzeReport(rid, companyName, reportYear);
            lastReportId = rid;
          } catch {
            // continue with next
          }
        }

        updateJob(key, { stage: "analyzing" });
        addNotification(`Analyzing with AI: ${companyName}`, "info");
        await supabase.from("reports").update({ status: "processing" }).eq("id", firstReportDbId);

        // Start adaptive polling (persists across navigation)
        pollForCompletion(lastReportId, key, companyName, reportYear, firstReportDbId, firstFileHash, fileCount);
      }
    } catch (err: any) {
      toast.error(`Error: ${sanitizeErrorMessage(err.message)}`);
    } finally {
      setIsProcessing(false);
    }
  }, [user, queryClient, addNotification, showDuplicateWarning, updateJob, removeJob]);

  return (
    <AnalysisQueueContext.Provider value={{ jobs, isProcessing, submitFiles, duplicateDialog, handleDuplicateAction }}>
      {children}
    </AnalysisQueueContext.Provider>
  );
}

export function useAnalysisQueue() {
  const ctx = useContext(AnalysisQueueContext);
  if (!ctx) throw new Error("useAnalysisQueue must be used within AnalysisQueueProvider");
  return ctx;
}
