import { useContext } from "react";
import { AnalysisQueueContext, AnalysisJob } from "@/hooks/useAnalysisQueue";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Files, RotateCcw, Upload } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const STAGE_PROGRESS: Record<string, number> = {
  uploading: 15,
  processing: 40,
  analyzing: 70,
  saving: 90,
  completed: 100,
  failed: 0,
};

const STAGE_LABEL: Record<string, string> = {
  uploading: "Uploading…",
  processing: "Parsing PDF…",
  analyzing: "Analyzing with AI…",
  saving: "Saving results…",
  completed: "Complete!",
  failed: "Failed",
};

function JobCard({ job }: { job: AnalysisJob }) {
  const navigate = useNavigate();
  const progress = STAGE_PROGRESS[job.stage] ?? 0;
  const isTerminal = job.stage === "completed" || job.stage === "failed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`bg-card border border-border rounded-lg p-3 shadow-lg ${
        job.stage === "completed" ? "cursor-pointer hover:border-primary/50" : ""
      } transition-colors`}
      onClick={() => {
        if (job.savedId) navigate(`/analysis/${job.savedId}`);
      }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        {job.stage === "completed" ? (
          <CheckCircle className="h-4 w-4 text-primary shrink-0" />
        ) : job.stage === "failed" ? (
          <XCircle className="h-4 w-4 text-destructive shrink-0" />
        ) : (
          <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
        )}
        <span className="font-body text-sm font-bold truncate">{job.companyName}</span>
        {job.fileCount > 1 && (
          <span className="flex items-center gap-0.5 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0">
            <Files className="h-3 w-3" />
            {job.fileCount} merged
          </span>
        )}
      </div>
      <p className="font-body text-xs text-muted-foreground mb-1.5">
        {STAGE_LABEL[job.stage] ?? job.stage}
        {job.fileCount > 1 && job.stage !== "completed" && job.stage !== "failed" ? ` (${job.fileCount} files merged)` : ""}
      </p>
      {!isTerminal && <Progress value={progress} className="h-1.5" />}
      {job.stage === "failed" && (
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
            onClick={(e) => { e.stopPropagation(); navigate("/upload"); }}
          >
            <Upload className="h-3 w-3" />
            Re-upload
          </Button>
        </div>
      )}
    </motion.div>
  );
}

export default function FloatingAnalysisProgress() {
  const ctx = useContext(AnalysisQueueContext);
  if (!ctx) return null;
  const { jobs } = ctx;

  const visibleJobs = jobs.filter((j) => j.stage !== "completed");

  if (visibleJobs.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 space-y-2">
      <AnimatePresence>
        {visibleJobs.map(job => (
          <JobCard key={job.key} job={job} />
        ))}
      </AnimatePresence>
    </div>
  );
}
