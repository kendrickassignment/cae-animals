import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { uploadReport, analyzeReport, getReportStatus, sanitizeErrorMessage } from "@/services/api";
import { fetchAndSaveAnalysis } from "@/hooks/useRealAnalyses";
import { useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@/hooks/useNotifications";
import { mergePdfFiles } from "@/lib/merge-pdf-files";

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
  groupKey: string;
  companyName: string;
  reportYear: string;
  stage: string; // uploading | processing | analyzing | saving | completed | failed
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

interface PersistedQueueJob {
  key: string;
  groupKey: string;
  companyName: string;
  reportYear: number;
  reportDbId: string;
  backendReportId: string;
  fileHash?: string;
  fileCount: number;
  userId: string;
}

export const AnalysisQueueContext = createContext<AnalysisQueueContextType | null>(null);

/* ------------------------------------------------------------------ */
/*  Adaptive polling helper                                            */
/* ------------------------------------------------------------------ */

const ACTIVE_QUEUE_JOBS_STORAGE_KEY = "cae_active_analysis_jobs_v2";
const POLLING_TIMEOUT = 300_000; // 5 minutes

function getPollingInterval(elapsedMs: number): number {
  if (elapsedMs < 30_000) return 5_000;
  if (elapsedMs < 120_000) return 10_000;
  return 15_000;
}

function normalizeGroupKey(companyName: string, reportYear: string | number): string {
  return `${companyName.trim().toLowerCase()}::${String(reportYear).trim()}`;
}

function sanitizeStorageFilename(filename: string): string {
  const ext = filename.toLowerCase().endsWith(".pdf") ? ".pdf" : "";
  const base = filename.replace(/\.pdf$/i, "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${base || "document"}${ext}`;
}

function readPersistedQueueJobs(): PersistedQueueJob[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACTIVE_QUEUE_JOBS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writePersistedQueueJobs(jobs: PersistedQueueJob[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_QUEUE_JOBS_STORAGE_KEY, JSON.stringify(jobs));
}

function upsertPersistedQueueJob(job: PersistedQueueJob) {
  const current = readPersistedQueueJobs();
  const idx = current.findIndex((j) => j.key === job.key);
  if (idx >= 0) current[idx] = job;
  else current.push(job);
  writePersistedQueueJobs(current);
}

function removePersistedQueueJob(key: string) {
  const current = readPersistedQueueJobs();
  writePersistedQueueJobs(current.filter((j) => j.key !== key));
}

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
  const pollCleanupMapRef = useRef<Map<string, () => void>>(new Map());
  const activeGroupKeysRef = useRef<Set<string>>(new Set());
  const isSubmittingRef = useRef(false);

  /* ---- helpers ---- */

  const updateJob = useCallback((key: string, patch: Partial<AnalysisJob>) => {
    setJobs((prev) => prev.map((j) => (j.key === key ? { ...j, ...patch } : j)));
  }, []);

  const removeJob = useCallback((key: string) => {
    pollCleanupMapRef.current.get(key)?.();
    pollCleanupMapRef.current.delete(key);
    removePersistedQueueJob(key);

    setJobs((prev) => {
      const target = prev.find((j) => j.key === key);
      if (target) {
        activeGroupKeysRef.current.delete(target.groupKey);
      }
      return prev.filter((j) => j.key !== key);
    });
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
      type: "hash",
      analysisId: row.id,
      companyName: row.company_name || "Unknown",
      reportYear: row.report_year || 0,
      score: row.overall_risk_score,
      date: new Date(row.created_at).toLocaleDateString(),
      uploaderEmail,
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
      type: "company_year",
      analysisId: row.id,
      companyName: row.company_name || "Unknown",
      reportYear: row.report_year || 0,
      score: row.overall_risk_score,
      date: new Date(row.created_at).toLocaleDateString(),
      uploaderEmail,
    };
  };

  /* ---- adaptive poll with dedup + abort ---- */

  const pollForCompletion = useCallback((
    reportId: string,
    key: string,
    companyName: string,
    reportYear: number,
    reportDbId: string,
    fileHash: string | undefined,
    fileCount: number,
    groupKey: string,
  ) => {
    const startTime = Date.now();
    let inFlight = false;
    let abortController: AbortController | null = null;
    let timeoutId: ReturnType<typeof setTimeout>;

    const poll = async () => {
      const elapsed = Date.now() - startTime;

      if (elapsed > POLLING_TIMEOUT) {
        pollCleanupMapRef.current.delete(key);
        removePersistedQueueJob(key);
        activeGroupKeysRef.current.delete(groupKey);
        updateJob(key, { stage: "failed" });
        toast.error(`Analysis timed out for ${companyName}`);
        addNotification(`Analysis timed out: ${companyName}`, "error");
        return;
      }

      if (inFlight) {
        timeoutId = setTimeout(poll, getPollingInterval(elapsed));
        return;
      }

      inFlight = true;
      abortController = new AbortController();

      try {
        const status = await getReportStatus(reportId, abortController.signal);

        if (status.status === "completed" && status.analysis_id) {
          updateJob(key, { stage: "saving" });

          const savedId = await fetchAndSaveAnalysis(
            status.analysis_id,
            user!.id,
            reportDbId,
            companyName,
            reportYear,
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

          supabase.functions.invoke("notify-analysis-complete", {
            body: {
              analysis_id: savedId,
              company_name: companyName,
              report_year: reportYear,
              risk_score: null,
              risk_level: null,
              uploader_user_id: user!.id,
            },
          }).catch((err) => console.warn("Admin notification failed:", err));

          removePersistedQueueJob(key);
          activeGroupKeysRef.current.delete(groupKey);
          setTimeout(() => removeJob(key), 4000);
          pollCleanupMapRef.current.delete(key);
          return;
        }

        if (status.status === "failed") {
          updateJob(key, { stage: "failed" });
          removePersistedQueueJob(key);
          activeGroupKeysRef.current.delete(groupKey);
          toast.error(`Analysis failed for ${companyName}: ${sanitizeErrorMessage(status.error || "Unknown error")}`);
          addNotification(`Analysis failed: ${companyName}`, "error");
          setTimeout(() => removeJob(key), 6000);
          pollCleanupMapRef.current.delete(key);
          return;
        }
      } catch {
        // keep polling on transient errors
      } finally {
        inFlight = false;
        abortController = null;
      }

      timeoutId = setTimeout(poll, getPollingInterval(Date.now() - startTime));
    };

    timeoutId = setTimeout(poll, 5000);

    // Cleanup cancels pending requests, but does NOT cancel backend processing.
    return () => {
      clearTimeout(timeoutId);
      abortController?.abort();
      pollCleanupMapRef.current.delete(key);
    };
  }, [addNotification, queryClient, removeJob, updateJob, user]);

  useEffect(() => {
    if (!user) return;

    const persistedJobs = readPersistedQueueJobs().filter((j) => j.userId === user.id);
    if (persistedJobs.length === 0) return;

    setJobs((prev) => {
      const existing = new Set(prev.map((j) => j.key));
      const resumed = persistedJobs
        .filter((j) => !existing.has(j.key))
        .map((j) => ({
          key: j.key,
          groupKey: j.groupKey,
          companyName: j.companyName,
          reportYear: String(j.reportYear),
          stage: "analyzing",
          fileCount: j.fileCount,
        } satisfies AnalysisJob));

      return resumed.length > 0 ? [...prev, ...resumed] : prev;
    });

    persistedJobs.forEach((job) => {
      if (pollCleanupMapRef.current.has(job.key)) return;
      activeGroupKeysRef.current.add(job.groupKey);

      const cleanup = pollForCompletion(
        job.backendReportId,
        job.key,
        job.companyName,
        job.reportYear,
        job.reportDbId,
        job.fileHash,
        job.fileCount,
        job.groupKey,
      );

      if (cleanup) {
        pollCleanupMapRef.current.set(job.key, cleanup);
      }
    });
  }, [user, pollForCompletion]);

  useEffect(() => {
    return () => {
      pollCleanupMapRef.current.forEach((cleanup) => cleanup());
      pollCleanupMapRef.current.clear();
    };
  }, []);

  /* ---- main submit ---- */

  const submitFiles = useCallback(async (files: UploadFile[]) => {
    if (!user) {
      toast.error("You must be signed in.");
      return;
    }

    if (files.length === 0) {
      toast.error("Please upload at least one PDF.");
      return;
    }

    if (isSubmittingRef.current) {
      toast.warning("An upload is already starting in the background.");
      return;
    }

    isSubmittingRef.current = true;
    setIsProcessing(true);

    try {
      const groups = new Map<string, UploadFile[]>();

      for (const uf of files) {
        const normalized = normalizeGroupKey(uf.companyName, uf.reportYear);
        if (!groups.has(normalized)) groups.set(normalized, []);
        groups.get(normalized)!.push(uf);
      }

      for (const [normalizedGroupKey, groupFiles] of groups) {
        const first = groupFiles[0];
        const companyName = first.companyName.trim();
        const reportYear = Number.parseInt(String(first.reportYear).trim(), 10) || new Date().getFullYear();
        const fileCount = groupFiles.length;

        if (activeGroupKeysRef.current.has(normalizedGroupKey)) {
          toast.warning(`${companyName} (${reportYear}) is already running in background.`);
          continue;
        }

        activeGroupKeysRef.current.add(normalizedGroupKey);
        let releaseGroupLock = true;

        try {
          // Duplicate checks
          if (fileCount === 1 && first.hash) {
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

          const key = `${normalizedGroupKey}-${Date.now()}`;
          const job: AnalysisJob = {
            key,
            groupKey: normalizedGroupKey,
            companyName,
            reportYear: String(reportYear),
            stage: "uploading",
            fileCount,
          };

          setJobs((prev) => [...prev, job]);

          const mergeLabel = fileCount > 1 ? ` (${fileCount} files merged)` : "";
          addNotification(`Uploading: ${companyName}${mergeLabel}`, "info");

          let analysisSourceFile: File;
          try {
            analysisSourceFile = await mergePdfFiles(groupFiles.map((gf) => gf.file), companyName, reportYear);
          } catch (mergeError: any) {
            updateJob(key, { stage: "failed" });
            toast.error(`Failed to merge PDFs for ${companyName}: ${sanitizeErrorMessage(mergeError?.message || "Invalid PDF")}`);
            addNotification(`Merge failed: ${companyName}`, "error");
            setTimeout(() => removeJob(key), 6000);
            continue;
          }

          const fileHashForRecord = fileCount === 1 ? first.hash : undefined;

          try {
            const timestamp = Date.now();
            const mergedPath = `${user.id}/${timestamp}_${sanitizeStorageFilename(analysisSourceFile.name)}`;

            // Keep original files downloadable when multiple docs are merged
            const originalFilesForBundle: Array<{ name: string; path: string; size: number }> = [];

            if (fileCount > 1) {
              for (let i = 0; i < groupFiles.length; i++) {
                const original = groupFiles[i];
                const originalPath = `${user.id}/originals/${timestamp}_${i + 1}_${sanitizeStorageFilename(original.file.name)}`;
                const { error: originalUploadError } = await supabase.storage.from("reports").upload(originalPath, original.file);

                if (!originalUploadError) {
                  originalFilesForBundle.push({ name: original.file.name, path: originalPath, size: original.file.size });
                }
              }
            }

            const { error: storageError } = await supabase.storage.from("reports").upload(mergedPath, analysisSourceFile);
            if (storageError) {
              throw new Error(`Storage upload failed: ${storageError.message}`);
            }

            const reportTypeValue = fileCount > 1
              ? JSON.stringify({ kind: "merged_bundle_v1", files: originalFilesForBundle })
              : "sustainability";

            const { data: report, error: dbError } = await supabase.from("reports").insert({
              user_id: user.id,
              file_name: analysisSourceFile.name,
              file_size: analysisSourceFile.size,
              file_url: mergedPath,
              company_name: companyName,
              report_year: reportYear,
              status: "uploading",
              report_type: reportTypeValue,
            }).select().single();

            if (dbError || !report) {
              throw new Error("Failed to create report record");
            }

            let uploadResult: { report_id: string };
            try {
              uploadResult = await uploadReport(analysisSourceFile);
            } catch {
              await supabase.from("reports").update({ status: "pending" }).eq("id", report.id);
              updateJob(key, { stage: "failed" });
              toast.warning(`${analysisSourceFile.name} saved to cloud. Backend analysis will run when available.`);
              addNotification(`${analysisSourceFile.name} queued for analysis`, "warning");
              setTimeout(() => removeJob(key), 6000);
              continue;
            }

            updateJob(key, { stage: "processing" });
            addNotification(`Processing PDF: ${companyName}${mergeLabel}`, "info");
            await supabase.from("reports").update({ status: "processing" }).eq("id", report.id);

            try {
              await analyzeReport(uploadResult.report_id, companyName, reportYear);
            } catch {
              await supabase.from("reports").update({ status: "pending" }).eq("id", report.id);
              updateJob(key, { stage: "failed" });
              toast.warning(`${analysisSourceFile.name} saved to cloud. Backend analysis will run when available.`);
              addNotification(`${analysisSourceFile.name} queued for analysis`, "warning");
              setTimeout(() => removeJob(key), 6000);
              continue;
            }

            updateJob(key, { stage: "analyzing" });
            addNotification(`Analyzing with AI: ${companyName}${mergeLabel}`, "info");

            upsertPersistedQueueJob({
              key,
              groupKey: normalizedGroupKey,
              companyName,
              reportYear,
              reportDbId: report.id,
              backendReportId: uploadResult.report_id,
              fileHash: fileHashForRecord,
              fileCount,
              userId: user.id,
            });

            const cleanup = pollForCompletion(
              uploadResult.report_id,
              key,
              companyName,
              reportYear,
              report.id,
              fileHashForRecord,
              fileCount,
              normalizedGroupKey,
            );

            if (cleanup) {
              releaseGroupLock = false;
              pollCleanupMapRef.current.set(key, cleanup);
            }
          } catch (groupError: any) {
            updateJob(key, { stage: "failed" });
            toast.error(`Error: ${sanitizeErrorMessage(groupError?.message || "Unknown error")}`);
            addNotification(`Analysis failed: ${companyName}`, "error");
            setTimeout(() => removeJob(key), 6000);
          }
        } finally {
          if (releaseGroupLock) {
            activeGroupKeysRef.current.delete(normalizedGroupKey);
          }
        }
      }
    } catch (err: any) {
      toast.error(`Error: ${sanitizeErrorMessage(err.message)}`);
    } finally {
      isSubmittingRef.current = false;
      setIsProcessing(false);
    }
  }, [
    user,
    addNotification,
    showDuplicateWarning,
    removeJob,
    updateJob,
    pollForCompletion,
  ]);

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
