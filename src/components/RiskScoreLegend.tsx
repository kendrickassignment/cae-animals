import { cn } from "@/lib/utils";

const RISK_TIERS = [
  { min: 0, max: 30, label: "Low", desc: "The company is fairly transparent.", color: "bg-risk-low", dot: "🟢" },
  { min: 31, max: 55, label: "Moderate", desc: "There are some gaps that need attention.", color: "bg-risk-medium", dot: "🟡" },
  { min: 56, max: 79, label: "High", desc: "There are significant patterns of avoidance.", color: "bg-risk-high", dot: "🟠" },
  { min: 80, max: 100, label: "Critical", desc: "Strong indications of greenwashing.", color: "bg-risk-critical", dot: "🔴" },
];

interface RiskScoreLegendProps {
  activeScore?: number;
  className?: string;
}

export default function RiskScoreLegend({ activeScore, className }: RiskScoreLegendProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="font-nav text-[10px] tracking-wider text-muted-foreground mb-1.5">RISK SCORE GUIDE</p>
      {RISK_TIERS.map((tier) => {
        const isActive = activeScore !== undefined && activeScore >= tier.min && activeScore <= tier.max;
        return (
          <div
            key={tier.label}
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded text-xs font-body transition-colors",
              isActive ? "bg-muted border border-primary/30" : "opacity-70"
            )}
          >
            <span className="text-sm">{tier.dot}</span>
            <span className="font-bold w-10">{tier.min}–{tier.max}</span>
            <span className="font-bold">{tier.label}</span>
            <span className="text-muted-foreground hidden sm:inline">— {tier.desc}</span>
          </div>
        );
      })}
    </div>
  );
}
