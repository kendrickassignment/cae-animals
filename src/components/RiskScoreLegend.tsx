import { cn } from "@/lib/utils";

const RISK_TIERS = [
  { min: 0, max: 30, label: "Low", desc: "The company is fairly transparent.", dot: "🟢" },
  { min: 31, max: 55, label: "Moderate", desc: "There are some gaps that need attention.", dot: "🟡" },
  { min: 56, max: 79, label: "High", desc: "There are significant patterns of avoidance.", dot: "🟠" },
  { min: 80, max: 100, label: "Critical", desc: "Strong indications of greenwashing.", dot: "🔴" },
];

interface RiskScoreLegendProps {
  activeScore?: number;
  className?: string;
}

export default function RiskScoreLegend({ activeScore, className }: RiskScoreLegendProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="font-nav text-[10px] tracking-wider text-muted-foreground mb-2">RISK SCORE GUIDE</p>
      <table className="w-full text-xs font-body">
        <tbody>
          {RISK_TIERS.map((tier) => {
            const isActive = activeScore !== undefined && activeScore >= tier.min && activeScore <= tier.max;
            return (
              <tr
                key={tier.label}
                className={cn(
                  "transition-colors",
                  isActive ? "bg-muted rounded" : ""
                )}
              >
                <td className="py-1.5 px-1 w-6 text-center">{tier.dot}</td>
                <td className="py-1.5 px-1 font-mono w-12 text-muted-foreground">{tier.min}–{tier.max}</td>
                <td className="py-1.5 px-1 font-bold w-16">{tier.label}</td>
                <td className="py-1.5 px-1 text-muted-foreground">— {tier.desc}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
