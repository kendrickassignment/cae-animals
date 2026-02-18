import { useState, useMemo } from "react";
import { seedCompanies, getRiskBgColor, getRiskColor } from "@/data/seed-data";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Companies() {
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");

  const filtered = useMemo(() => {
    return seedCompanies.filter(c => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (industryFilter !== "all" && c.industry !== industryFilter) return false;
      if (riskFilter !== "all" && c.latest_risk_level !== riskFilter) return false;
      return true;
    });
  }, [search, industryFilter, riskFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-4xl text-foreground">COMPANIES TRACKED</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies..." className="pl-9 font-body" />
        </div>
        <select value={industryFilter} onChange={e => setIndustryFilter(e.target.value)} className="font-body text-sm bg-card border border-border rounded-lg px-3 py-2">
          <option value="all">All Industries</option>
          <option value="food_service">Food Service</option>
          <option value="hospitality">Hospitality</option>
          <option value="retail">Retail</option>
        </select>
        <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="font-body text-sm bg-card border border-border rounded-lg px-3 py-2">
          <option value="all">All Risk Levels</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Company Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((company, i) => (
          <div
            key={company.id}
            className="bg-card rounded-lg border border-border shadow-sm overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all duration-affa cursor-pointer animate-float-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`h-1 ${company.latest_risk_level === "critical" ? "bg-risk-critical" : company.latest_risk_level === "high" ? "bg-risk-high" : company.latest_risk_level === "medium" ? "bg-risk-medium" : "bg-risk-low"}`} />
            <div className="p-5">
              <h3 className="font-display text-xl mb-2">{company.name}</h3>
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
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="font-body text-muted-foreground">No companies match your filters.</p>
        </div>
      )}
    </div>
  );
}
