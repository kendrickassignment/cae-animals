import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { seedCompanies, seedAnalyses, getRiskBgColor, getRiskColor } from "@/data/seed-data";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { fuzzyMatch } from "@/lib/fuzzy-search";
import { useRealAnalyses } from "@/hooks/useRealAnalyses";
import type { SeedCompany } from "@/data/seed-data";

export default function Companies() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");

  const { data: realAnalyses = [] } = useRealAnalyses();

  // Build company list: real analyses create dynamic companies, merged with seed
  const allCompanies = useMemo(() => {
    const realCompanyMap = new Map<string, SeedCompany>();
    realAnalyses.forEach(a => {
      const key = a.company_name.toLowerCase();
      const existing = realCompanyMap.get(key);
      if (!existing || a.overall_risk_score > existing.latest_risk_score) {
        realCompanyMap.set(key, {
          id: `real-${a.id}`,
          name: a.company_name,
          industry: "other",
          headquarters_country: "Unknown",
          latest_risk_level: a.overall_risk_level,
          latest_risk_score: a.overall_risk_score,
          total_reports_analyzed: realAnalyses.filter(r => r.company_name.toLowerCase() === key).length,
          last_audited_at: a.created_at,
        });
      }
    });

    // Merge: real data overrides seed for same company name
    const realCompanyNames = new Set(realCompanyMap.keys());
    const filteredSeed = seedCompanies.filter(c => !realCompanyNames.has(c.name.toLowerCase()));
    return [...Array.from(realCompanyMap.values()), ...filteredSeed];
  }, [realAnalyses]);

  // Build analysis lookup for navigation
  const getCompanyAnalysisId = (companyName: string) => {
    // Prefer real analysis
    const real = realAnalyses.find(a => a.company_name.toLowerCase() === companyName.toLowerCase());
    if (real) return real.id;
    const seed = seedAnalyses.find(a => a.company_name === companyName);
    return seed?.id;
  };

  const industries = useMemo(() => {
    const set = new Set(allCompanies.map(c => c.industry));
    return Array.from(set);
  }, [allCompanies]);

  const filtered = useMemo(() => {
    return allCompanies.filter(c => {
      if (search && !fuzzyMatch(search, `${c.name} ${c.industry} ${c.headquarters_country}`)) return false;
      if (industryFilter !== "all" && c.industry !== industryFilter) return false;
      if (riskFilter !== "all" && c.latest_risk_level !== riskFilter) return false;
      return true;
    });
  }, [search, industryFilter, riskFilter, allCompanies]);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-4xl text-foreground">COMPANIES TRACKED</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies..." className="pl-9 font-body" />
        </div>
        <select value={industryFilter} onChange={e => setIndustryFilter(e.target.value)} className="font-body text-sm bg-card border border-border rounded-lg px-3 py-2">
          <option value="all">All Industries</option>
          {industries.map(ind => (
            <option key={ind} value={ind}>{ind.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>
          ))}
        </select>
        <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="font-body text-sm bg-card border border-border rounded-lg px-3 py-2">
          <option value="all">All Risk Levels</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((company, i) => {
          const analysisId = getCompanyAnalysisId(company.name);
          const isReal = company.id.startsWith("real-");
          return (
            <div
              key={company.id}
              onClick={() => analysisId && navigate(`/analysis/${analysisId}`)}
              className="bg-card rounded-lg border border-border shadow-sm overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer animate-float-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`h-1 ${company.latest_risk_level === "critical" ? "bg-risk-critical" : company.latest_risk_level === "high" ? "bg-risk-high" : company.latest_risk_level === "medium" ? "bg-risk-medium" : "bg-risk-low"}`} />
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <h3 className="font-display text-xl mb-2">{company.name}</h3>
                  {isReal && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">LIVE</span>}
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-secondary text-secondary mb-3">
                  {company.industry.replace(/_/g, " ").toUpperCase()}
                </span>
                <div className="flex items-end justify-between mt-2">
                  <div>
                    <span className={`font-display text-4xl ${getRiskColor(company.latest_risk_level)}`}>{company.latest_risk_score}</span>
                    <p className="font-body text-xs text-muted-foreground mt-1">Risk Score</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${getRiskBgColor(company.latest_risk_level)}`}>
                    {company.latest_risk_level}
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-border space-y-1">
                  <p className="font-body text-xs text-muted-foreground">Reports Analyzed: {company.total_reports_analyzed}</p>
                  <p className="font-body text-xs text-muted-foreground">Last Audited: {new Date(company.last_audited_at).toLocaleDateString()}</p>
                </div>
                <p className="mt-3 font-nav text-[11px] tracking-wider text-primary hover:underline">View Analysis →</p>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="font-body text-muted-foreground">No companies match your filters.</p>
        </div>
      )}
    </div>
  );
}
