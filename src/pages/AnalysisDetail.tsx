import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, ChevronDown, ChevronRight, Download, Copy, FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { seedAnalyses, getRiskBgColor, getIndonesiaStatusLabel, getIndonesiaStatusColor, getFindingTypeLabel } from "@/data/seed-data";
import type { SeedAnalysis } from "@/data/seed-data";
import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRealAnalyses } from "@/hooks/useRealAnalyses";
import { getAnalysis } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { exportAnalysisPdf } from "@/lib/export-pdf";

const EVASION_TYPES = ["hedging_language", "geographic_exclusion", "strategic_silence", "franchise_firewall", "availability_clause", "timeline_deferral", "silent_delisting", "corporate_ghosting", "commitment_downgrade"];

function exportFindingsCsv(analysis: SeedAnalysis) {
  const headers = ["finding_type", "severity", "title", "description", "exact_quote", "page_number", "section", "country_affected"];
  const rows = analysis.findings.map(f => headers.map(h => {
    const val = (f as any)[h] ?? "";
    return `"${String(val).replace(/"/g, '""')}"`;
  }).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `CAE_${analysis.company_name.replace(/[^a-zA-Z0-9]/g, "_")}_findings.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("CSV exported!");
}

export default function AnalysisDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("all");

  // Try seed data first
  const seedAnalysis = useMemo(() => seedAnalyses.find(a => a.id === id), [id]);

  // Try Supabase for real analyses
  const { data: realAnalyses } = useRealAnalyses();
  const supabaseAnalysis = useMemo(() => realAnalyses?.find(a => a.id === id), [realAnalyses, id]);

  // If not found in either, try fetching directly from Supabase by ID
  const { data: directAnalysis, isLoading } = useQuery({
    queryKey: ["analysis-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analysis_results")
        .select("*")
        .eq("id", id!)
        .single();
      if (error || !data) return null;
      // Map to SeedAnalysis shape
      const findings = ((data as any).findings || []).map((f: any, idx: number) => ({
        id: f.id || `rf-${idx}`,
        finding_type: f.finding_type || f.type || "other",
        severity: f.severity || "medium",
        title: f.title || "Untitled Finding",
        description: f.description || "",
        exact_quote: f.exact_quote || f.quote || "",
        page_number: f.page_number || 0,
        section: f.section || null,
        paragraph: f.paragraph || null,
        country_affected: f.country_affected || null,
      }));
      return {
        ...data,
        company_name: (data as any).company_name || "Unknown Company",
        report_year: (data as any).report_year || new Date().getFullYear(),
        overall_risk_level: data.overall_risk_level || "medium",
        overall_risk_score: data.overall_risk_score || 0,
        global_claim: data.global_claim || "",
        indonesia_mentioned: data.indonesia_mentioned ?? false,
        indonesia_status: data.indonesia_status || "silent",
        sea_countries_mentioned: data.sea_countries_mentioned || [],
        sea_countries_excluded: data.sea_countries_excluded || [],
        binding_language_count: data.binding_language_count || 0,
        hedging_language_count: data.hedging_language_count || 0,
        summary: data.summary || "",
        status: "completed",
        created_at: data.created_at,
        findings,
        report_id: data.report_id || "",
      } as SeedAnalysis;
    },
    enabled: !seedAnalysis && !supabaseAnalysis && !!id,
  });

  const analysis: SeedAnalysis | null | undefined = seedAnalysis || supabaseAnalysis || directAnalysis;

  const filteredFindings = useMemo(() => {
    if (!analysis) return [];
    return typeFilter === "all" ? analysis.findings : analysis.findings.filter(f => f.finding_type === typeFilter);
  }, [analysis, typeFilter]);

  const evasionBreakdown = useMemo(() => {
    if (!analysis) return [];
    return EVASION_TYPES.map(type => ({
      type,
      label: getFindingTypeLabel(type),
      count: analysis.findings.filter(f => f.finding_type === type).length,
      detected: analysis.findings.some(f => f.finding_type === type),
    }));
  }, [analysis]);

  if (isLoading) return (
    <div className="text-center py-20 animate-fade-in">
      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
      <p className="font-body text-muted-foreground">Loading analysis...</p>
    </div>
  );

  if (!analysis) return (
    <div className="text-center py-20 animate-fade-in">
      <p className="font-body text-muted-foreground mb-4">This analysis will be available once the backend is connected.</p>
      <Button onClick={() => navigate("/dashboard")} className="font-body font-bold text-sm">
        <ArrowLeft className="h-4 w-4 mr-2" /> BACK TO DASHBOARD
      </Button>
    </div>
  );

  const copySum = () => { navigator.clipboard.writeText(analysis.summary); toast.success("Summary copied to clipboard"); };
  const isSeedData = ["a1", "a2", "a3", "a4", "a5"].includes(analysis.id);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-nav text-xs tracking-wider transition-colors">
        <ArrowLeft className="h-4 w-4" /> BACK TO DASHBOARD
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="font-display text-4xl text-foreground">{analysis.company_name}</h1>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary/20 text-secondary font-body">{analysis.report_year}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${getRiskBgColor(analysis.overall_risk_level)}`}>{analysis.overall_risk_level}</span>
          </div>
        </div>
        <div className="relative w-24 h-24 shrink-0">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
            <circle cx="50" cy="50" r="40" fill="none" stroke={analysis.overall_risk_score >= 80 ? "#DC2626" : analysis.overall_risk_score >= 60 ? "#EA580C" : analysis.overall_risk_score >= 40 ? "#D97706" : "#16A34A"} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${analysis.overall_risk_score * 2.51} 251`} className="transition-all duration-[800ms]" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-display text-2xl">{analysis.overall_risk_score}</span>
        </div>
      </div>

      {/* Executive Summary */}
      <div className={`bg-card rounded-lg p-6 border border-border border-l-4 ${analysis.overall_risk_level === "critical" ? "border-l-risk-critical" : analysis.overall_risk_level === "high" ? "border-l-risk-high" : analysis.overall_risk_level === "medium" ? "border-l-risk-medium" : "border-l-risk-low"}`}>
        <h3 className="font-display text-lg mb-3">EXECUTIVE SUMMARY</h3>
        <p className="font-body text-sm text-muted-foreground leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Indonesia Status */}
      <div className="bg-card rounded-lg p-6 border border-border border-t-4 border-t-primary">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🇮🇩</span>
            <h3 className="font-display text-lg">INDONESIA STATUS</h3>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase ${getIndonesiaStatusColor(analysis.indonesia_status)}`}>
            {getIndonesiaStatusLabel(analysis.indonesia_status)}
          </span>
        </div>
        {!analysis.indonesia_mentioned && (
          <div className="mt-4 bg-risk-medium-bg rounded-lg p-4 flex gap-3 items-start">
            <AlertTriangle className="h-5 w-5 text-risk-medium shrink-0 mt-0.5" />
            <p className="font-body text-sm text-risk-medium">
              Indonesia was NOT mentioned anywhere in this report despite the company's "Global" commitment. This strategic silence is itself a red flag.
            </p>
          </div>
        )}
        <p className="mt-3 font-body text-sm text-muted-foreground">
          Indonesia mentioned in report: <strong>{analysis.indonesia_mentioned ? "YES" : "NO"}</strong>
        </p>
      </div>

      {/* Claim vs Reality */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg p-6 border border-border border-l-4 border-l-risk-low">
          <h3 className="font-display text-lg mb-3 text-risk-low">THE CLAIM</h3>
          <blockquote className="font-body text-sm italic text-muted-foreground leading-relaxed border-l-2 border-risk-low/30 pl-4">
            "{analysis.global_claim}"
          </blockquote>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border border-l-4 border-l-risk-critical">
          <h3 className="font-display text-lg mb-3 text-risk-critical">THE REALITY</h3>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            {analysis.findings[0]?.description || "No findings available."}
          </p>
        </div>
      </div>

      {/* Evasion Patterns */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <h3 className="font-display text-lg mb-4">EVASION PATTERNS DETECTED</h3>
        <div className="space-y-2">
          {evasionBreakdown.map(ep => (
            <div key={ep.type} className={`flex items-center justify-between p-3 rounded-md ${ep.detected ? "bg-muted" : "bg-muted/30 opacity-50"}`}>
              <span className={`font-nav text-xs tracking-wider ${ep.detected ? "text-foreground" : "text-muted-foreground"}`}>{ep.label.toUpperCase()}</span>
              {ep.detected ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-risk-critical-bg text-risk-critical">DETECTED ({ep.count})</span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-muted text-muted-foreground">NOT DETECTED</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Language Analysis */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <h3 className="font-display text-lg mb-4">LANGUAGE ANALYSIS</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <span className="font-display text-3xl text-risk-low">{analysis.binding_language_count}</span>
            <p className="font-body text-xs text-muted-foreground mt-1">Binding Commitments</p>
          </div>
          <div className="text-center">
            <span className="font-display text-3xl text-risk-critical">{analysis.hedging_language_count}</span>
            <p className="font-body text-xs text-muted-foreground mt-1">Hedging Phrases</p>
          </div>
        </div>
        <div className="h-12">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[{ binding: analysis.binding_language_count, hedging: analysis.hedging_language_count }]} layout="vertical">
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" hide />
              <Bar dataKey="binding" stackId="a" fill="#16A34A" radius={[6, 0, 0, 6]} />
              <Bar dataKey="hedging" stackId="a" fill="#DC2626" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Findings */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="font-display text-xl">ALL FINDINGS ({analysis.findings.length})</h3>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="font-body text-sm bg-card border border-border rounded-md px-3 py-1.5">
            <option value="all">All Types</option>
            {EVASION_TYPES.map(t => <option key={t} value={t}>{getFindingTypeLabel(t)}</option>)}
            <option value="binding_commitment">Binding Commitment</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-3">
          {filteredFindings.map(finding => (
            <div key={finding.id} className="bg-card rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setExpandedFinding(expandedFinding === finding.id ? null : finding.id)}
                className="w-full flex items-center gap-2 sm:gap-3 p-3 sm:p-4 text-left hover:bg-muted/30 transition-colors flex-wrap"
              >
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getRiskBgColor(finding.severity)}`}>
                  {finding.severity}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-secondary text-secondary">{getFindingTypeLabel(finding.finding_type)}</span>
                <span className="flex-1 font-body text-sm font-bold truncate">{finding.title}</span>
                {finding.page_number > 0 && <span className="font-mono text-xs text-muted-foreground shrink-0">p.{finding.page_number}</span>}
                {finding.country_affected && <span className="px-2 py-0.5 rounded-full text-[10px] bg-muted text-muted-foreground shrink-0">{finding.country_affected}</span>}
                {expandedFinding === finding.id ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
              </button>
              {expandedFinding === finding.id && (
                <div className="px-4 pb-4 space-y-3 animate-fade-in">
                  <p className="font-body text-sm text-muted-foreground">{finding.description}</p>
                  {finding.exact_quote && (
                    <div className="bg-muted rounded-lg p-4 border-l-4 border-l-primary">
                      <p className="font-nav text-[10px] tracking-widest text-muted-foreground mb-2">EVIDENCE</p>
                      <p className="font-mono text-sm italic text-foreground">"{finding.exact_quote}"</p>
                      <p className="font-body text-xs text-muted-foreground mt-2">
                        {finding.page_number > 0 ? `Page ${finding.page_number}` : ""}{finding.section && ` — Section: ${finding.section}`}{finding.paragraph && ` — ${finding.paragraph}`}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Export */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="font-body font-bold text-sm w-full sm:w-auto" onClick={() => exportFindingsCsv(analysis)}><Download className="h-4 w-4 mr-2" /> EXPORT CSV</Button>
        <Button variant="outline" className="font-body font-bold text-sm border-2 w-full sm:w-auto" onClick={copySum}><Copy className="h-4 w-4 mr-2" /> COPY SUMMARY</Button>
        <Button variant="outline" className="font-body font-bold text-sm border-2 w-full sm:w-auto" onClick={() => { exportAnalysisPdf(analysis); toast.success("PDF downloaded!"); }}><FileDown className="h-4 w-4 mr-2" /> DOWNLOAD PDF</Button>
      </div>
    </div>
  );
}
