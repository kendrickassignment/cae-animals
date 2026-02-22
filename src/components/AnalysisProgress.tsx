import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

const STAGES = [
  { key: "uploading", label: "Uploading PDF...", progress: 15 },
  { key: "processing", label: "Parsing PDF...", progress: 40 },
  { key: "analyzing", label: "Analyzing with AI...", progress: 70 },
  { key: "saving", label: "Saving results...", progress: 90 },
  { key: "completed", label: "Complete!", progress: 100 },
];

interface AnalysisProgressProps {
  stage: string;
  companyName: string;
}

export default function AnalysisProgress({ stage, companyName }: AnalysisProgressProps) {
  const current = STAGES.find(s => s.key === stage) || STAGES[0];

  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-center gap-3">
        {stage !== "completed" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        <div className="flex-1">
          <p className="font-body text-sm font-bold">{companyName}</p>
          <p className="font-body text-xs text-muted-foreground">{current.label}</p>
        </div>
      </div>
      <Progress value={current.progress} className="h-2" />
    </div>
  );
}
