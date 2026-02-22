import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, ChevronDown, ChevronRight, Download, Copy, FileDown, Loader2, History, TrendingUp, TrendingDown, Minus, CheckCircle2, Flag, ShieldAlert, FileText, ExternalLink, Shield, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { seedAnalyses, getRiskBgColor, getIndonesiaStatusLabel, getIndonesiaStatusColor, getFindingTypeLabel } from "@/data/seed-data";
import type { SeedAnalysis } from "@/data/seed-data";
import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRealAnalyses } from "@/hooks/useRealAnalyses";
import { getAnalysis } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { exportAnalysisPdf } from "@/lib/export-pdf";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAnalysisFlags } from "@/hooks/useAnalysisFlags";

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
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const queryClient = useQueryClient();
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [flagReason, setFlagReason] = useState("");
  const [showFlagForm, setShowFlagForm] = useState(false);
  const [showVerifyRequestForm, setShowVerifyRequestForm] = useState(false);
  const [verifyRequestNote, setVerifyRequestNote] = useState("");

  // Try seed data first
  const seedAnalysis = useMemo(() => seedAnalyses.find(a => a.id === id), [id]);

  // Try Supabase for real analyses
  const { data: realAnalyses } = useRealAnalyses();
  const supabaseAnalysis = useMemo(() => realAnalyses?.find(a => a.id === id), [realAnalyses, id]);

  // Fetch directly from DB — always enabled for non-seed data to get fresh verified/flag state
  const { data: directAnalysis, isLoading } = useQuery({
    queryKey: ["analysis-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analysis_results")
        .select("*")
        .eq("id", id!)
        .single();
      if (error || !data) return null;
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
    enabled: !seedAnalysis && !!id,
  });

  const analysis: SeedAnalysis | null | undefined = seedAnalysis || supabaseAnalysis || directAnalysis;
  const isSeedData = ["a1", "a2", "a3", "a4", "a5"].includes(analysis?.id || "");

  // ===== TRUST FEATURES DATA =====

  // 1. Upload Attribution — fetch uploader profile + report metadata
  const analysisUserId = useMemo(() => {
    if (isSeedData) return null;
    return (supabaseAnalysis as any)?.user_id || (directAnalysis as any)?.user_id || null;
  }, [supabaseAnalysis, directAnalysis, isSeedData]);

  const { data: uploaderProfile } = useQuery({
    queryKey: ["uploader-profile", analysisUserId],
    queryFn: async () => {
      if (!analysisUserId) return null;
      const { data } = await supabase.from("profiles").select("full_name").eq("id", analysisUserId).single();
      return data;
    },
    enabled: !!analysisUserId,
  });

  // 2. Verified badge — use directAnalysis which refetches after invalidation
  const rawDbRow = useMemo(() => {
    if (isSeedData) return null;
    // Prefer directAnalysis since it's keyed by ["analysis-detail", id] and gets invalidated
    return (directAnalysis as any) || (supabaseAnalysis as any) || null;
  }, [supabaseAnalysis, directAnalysis, isSeedData]);

  const isVerified = rawDbRow?.verified === true;
  const verifyMutation = useMutation({
    mutationFn: async (verified: boolean) => {
      const { error } = await supabase
        .from("analysis_results")
        .update({
          verified,
          verified_by: verified ? user?.id : null,
          verified_at: verified ? new Date().toISOString() : null,
        } as any)
        .eq("id", id!);
      if (error) throw error;
    },
    onSuccess: (_, verified) => {
      toast.success(verified ? "Analysis marked as verified" : "Verification removed");
      queryClient.invalidateQueries({ queryKey: ["analysis-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["real-analyses"] });
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ["analysis-detail", id] });
    },
    onError: () => toast.error("Failed to update verification status"),
  });

  // 3. Flags
  const { activeFlags, userHasFlagged, flagCount, showWarning, submitFlag, dismissAllFlags } = useAnalysisFlags(isSeedData ? undefined : id);

  // Verification request status
  const { data: existingVerifyRequest } = useQuery({
    queryKey: ["verification-request", id, user?.id],
    queryFn: async () => {
      if (!id || !user) return null;
      const { data } = await supabase
        .from("verification_requests")
        .select("*")
        .eq("analysis_id", id)
        .eq("requester_id", user.id)
        .eq("status", "pending")
        .maybeSingle();
      return data;
    },
    enabled: !!id && !!user && !isSeedData && !isVerified,
  });

  const verifyRequestMutation = useMutation({
    mutationFn: async (note: string) => {
      const { error } = await supabase.functions.invoke("send-verification-request", {
        body: {
          analysis_id: id,
          note: note || null,
          company_name: analysis?.company_name,
          report_year: analysis?.report_year,
          risk_score: analysis?.overall_risk_score,
          analysis_url: `${window.location.origin}/analysis/${id}`,
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Verification request sent!");
      setShowVerifyRequestForm(false);
      setVerifyRequestNote("");
      queryClient.invalidateQueries({ queryKey: ["verification-request", id, user?.id] });
    },
    onError: () => toast.error("Failed to send verification request"),
  });

  // 4. Source Document — fetch report record
  const reportId = analysis?.report_id;
  const { data: sourceReport } = useQuery({
    queryKey: ["source-report", reportId],
    queryFn: async () => {
      if (!reportId) return null;
      const { data } = await supabase.from("reports").select("file_name, file_size, page_count, file_url, user_id").eq("id", reportId).single();
      return data;
    },
    enabled: !!reportId && !isSeedData,
  });

  // 5. AI Confidence
  const documentConfidence = rawDbRow?.document_confidence || null;
  const documentConfidenceReason = rawDbRow?.document_confidence_reason || null;

  // ===== COMPANY HISTORY =====
  const { data: companyHistory = [] } = useQuery({
    queryKey: ["company-history", analysis?.company_name],
    queryFn: async () => {
      if (!analysis?.company_name) return [];
      const { data, error } = await supabase
        .from("analysis_results")
        .select("id, company_name, report_year, overall_risk_level, overall_risk_score, summary, created_at, user_id, findings")
        .ilike("company_name", analysis.company_name)
        .neq("id", analysis.id)
        .order("created_at", { ascending: true });
      if (error) return [];
      return (data || []).map((row: any) => ({
        id: row.id,
        company_name: row.company_name,
        report_year: row.report_year,
        overall_risk_level: row.overall_risk_level || "medium",
        overall_risk_score: row.overall_risk_score || 0,
        summary: row.summary || "",
        created_at: row.created_at,
        user_id: row.user_id,
        findings_count: Array.isArray(row.findings) ? row.findings.length : 0,
        top_findings: Array.isArray(row.findings) ? row.findings.slice(0, 3).map((f: any) => f.title || "Untitled") : [],
      }));
    },
    enabled: !!analysis?.company_name && !isSeedData,
  });

  const seedHistory = useMemo(() => {
    if (!analysis) return [];
    return seedAnalyses
      .filter(s => s.company_name.toLowerCase() === analysis.company_name.toLowerCase() && s.id !== analysis.id)
      .map(s => ({
        id: s.id, company_name: s.company_name, report_year: s.report_year,
        overall_risk_level: s.overall_risk_level, overall_risk_score: s.overall_risk_score,
        summary: s.summary, created_at: s.created_at, user_id: null as string | null,
        findings_count: s.findings.length, top_findings: s.findings.slice(0, 3).map(f => f.title),
      }));
  }, [analysis]);

  const previousAnalyses = useMemo(() => {
    const dbIds = new Set(companyHistory.map(a => a.id));
    const combined = [...companyHistory, ...seedHistory.filter(s => !dbIds.has(s.id))];
    return combined.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [companyHistory, seedHistory]);

  // ===== DERIVED =====
  const filteredFindings = useMemo(() => {
    if (!analysis) return [];
    return typeFilter === "all" ? analysis.findings : analysis.findings.filter(f => f.finding_type === typeFilter);
  }, [analysis, typeFilter]);

  const evasionBreakdown = useMemo(() => {
    if (!analysis) return [];
    return EVASION_TYPES.map(type => ({
      type, label: getFindingTypeLabel(type),
      count: analysis.findings.filter(f => f.finding_type === type).length,
      detected: analysis.findings.some(f => f.finding_type === type),
    }));
  }, [analysis]);

  // ===== HANDLERS =====
  const handleDownloadSource = async () => {
    if (!sourceReport?.file_url) return;
    try {
      const { data } = await supabase.storage.from("reports").createSignedUrl(sourceReport.file_url, 300);
      if (data?.signedUrl) window.open(data.signedUrl, "_blank");
      else toast.error("Could not generate download link");
    } catch { toast.error("Download failed"); }
  };

  const handleSubmitFlag = () => {
    if (!flagReason.trim()) { toast.error("Please provide a reason"); return; }
    submitFlag.mutate(flagReason.trim());
    setFlagReason("");
    setShowFlagForm(false);
  };

  // ===== RENDER =====
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

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-nav text-xs tracking-wider transition-colors">
        <ArrowLeft className="h-4 w-4" /> BACK TO DASHBOARD
      </button>

      {/* FLAG WARNING BANNER */}
      {!isSeedData && showWarning && (
        <div className="bg-risk-medium-bg rounded-lg p-4 border border-risk-medium/30 flex gap-3 items-start">
          <ShieldAlert className="h-5 w-5 text-risk-medium shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-body text-sm font-bold text-risk-medium">
              ⚠ This analysis has been flagged as suspicious by {flagCount} team member{flagCount !== 1 ? "s" : ""}
            </p>
            <p className="font-body text-xs text-risk-medium/80 mt-1">
              Review findings carefully. Flagged reasons: {activeFlags.map(f => f.reason).join("; ")}
            </p>
          </div>
          {isAdmin && (
            <Button size="sm" variant="outline" className="shrink-0 text-xs font-body border-risk-medium text-risk-medium" onClick={() => dismissAllFlags.mutate()}>
              Dismiss All
            </Button>
          )}
        </div>
      )}

      {/* AI CONFIDENCE WARNING */}
      {!isSeedData && documentConfidence === "low" && (
        <div className="bg-risk-critical-bg rounded-lg p-4 border border-risk-critical/30 flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 text-risk-critical shrink-0 mt-0.5" />
          <div>
            <p className="font-body text-sm font-bold text-risk-critical">
              LOW CONFIDENCE — This document may not be a genuine sustainability report
            </p>
            {documentConfidenceReason && (
              <p className="font-body text-xs text-risk-critical/80 mt-1">{documentConfidenceReason}</p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-4xl text-foreground">{analysis.company_name}</h1>
            {/* VERIFIED BADGE */}
            {!isSeedData && isVerified && (
              <Tooltip>
                <TooltipTrigger>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-risk-low-bg text-risk-low">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                  </span>
                </TooltipTrigger>
                <TooltipContent><p className="font-body text-xs">This analysis has been verified by an admin</p></TooltipContent>
              </Tooltip>
            )}
            {!isSeedData && !isVerified && (
              <>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-muted text-muted-foreground">
                  <Shield className="h-3.5 w-3.5" /> Unverified
                </span>
                {existingVerifyRequest ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary/20 text-secondary">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Verification Requested ✓
                  </span>
                ) : (
                  <button
                    onClick={() => setShowVerifyRequestForm(!showVerifyRequestForm)}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Send className="h-3 w-3" /> Request Verification
                  </button>
                )}
              </>
            )}
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary/20 text-secondary font-body">{analysis.report_year}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${getRiskBgColor(analysis.overall_risk_level)}`}>{analysis.overall_risk_level}</span>
            {/* AI CONFIDENCE BADGE */}
            {!isSeedData && documentConfidence && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                documentConfidence === "high" ? "bg-risk-low-bg text-risk-low" :
                documentConfidence === "medium" ? "bg-risk-medium-bg text-risk-medium" :
                "bg-risk-critical-bg text-risk-critical"
              }`}>
                AI Confidence: {documentConfidence.toUpperCase()}
              </span>
            )}
          </div>
          {/* UPLOAD ATTRIBUTION */}
          {!isSeedData && (
            <p className="font-body text-xs text-muted-foreground mt-2">
              Uploaded by <strong>{uploaderProfile?.full_name || "Team Member"}</strong>
              {" · "}
              {new Date(analysis.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
          {isSeedData && (
            <p className="font-body text-xs text-muted-foreground mt-2">Demo data · Seed analysis</p>
          )}
        </div>
        <div className="relative w-24 h-24 shrink-0">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
            <circle cx="50" cy="50" r="40" fill="none" stroke={analysis.overall_risk_score >= 80 ? "#DC2626" : analysis.overall_risk_score >= 60 ? "#EA580C" : analysis.overall_risk_score >= 40 ? "#D97706" : "#16A34A"} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${analysis.overall_risk_score * 2.51} 251`} className="transition-all duration-[800ms]" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-display text-2xl">{analysis.overall_risk_score}</span>
        </div>
      </div>

      {/* Admin Verify + Flag Actions */}
      {!isSeedData && (
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <Button
              size="sm"
              variant={isVerified ? "outline" : "default"}
              className="font-body text-xs font-bold"
              onClick={() => verifyMutation.mutate(!isVerified)}
              disabled={verifyMutation.isPending}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              {isVerified ? "Remove Verification" : "Mark as Verified"}
            </Button>
          )}
          {!userHasFlagged && (
            <Button
              size="sm"
              variant="outline"
              className="font-body text-xs font-bold border-risk-medium text-risk-medium hover:bg-risk-medium-bg"
              onClick={() => setShowFlagForm(!showFlagForm)}
            >
              <Flag className="h-3.5 w-3.5 mr-1.5" /> Flag as Suspicious
            </Button>
          )}
          {userHasFlagged && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-risk-medium-bg text-risk-medium">
              <Flag className="h-3 w-3" /> You flagged this
            </span>
          )}
        </div>
      )}

      {/* Flag Form */}
      {showFlagForm && (
        <div className="bg-card rounded-lg p-4 border border-risk-medium/30 space-y-3 animate-fade-in">
          <p className="font-body text-sm font-bold text-foreground">Why is this analysis suspicious?</p>
          <textarea
            value={flagReason}
            onChange={e => setFlagReason(e.target.value)}
            placeholder="e.g., This doesn't look like a real sustainability report, data appears fabricated..."
            className="w-full bg-muted border border-border rounded-md p-3 font-body text-sm resize-none h-20"
          />
          <div className="flex gap-2">
            <Button size="sm" className="font-body text-xs font-bold" onClick={handleSubmitFlag} disabled={submitFlag.isPending}>
              Submit Flag
            </Button>
            <Button size="sm" variant="ghost" className="font-body text-xs" onClick={() => { setShowFlagForm(false); setFlagReason(""); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Verification Request Form */}
      {showVerifyRequestForm && (
        <div className="bg-card rounded-lg p-4 border border-primary/30 space-y-3 animate-fade-in">
          <p className="font-body text-sm font-bold text-foreground">Request admin verification</p>
          <textarea
            value={verifyRequestNote}
            onChange={e => setVerifyRequestNote(e.target.value)}
            placeholder="Optional note for the admin (e.g., why this should be prioritized)..."
            className="w-full bg-muted border border-border rounded-md p-3 font-body text-sm resize-none h-20"
          />
          <div className="flex gap-2">
            <Button size="sm" className="font-body text-xs font-bold" onClick={() => verifyRequestMutation.mutate(verifyRequestNote)} disabled={verifyRequestMutation.isPending}>
              <Send className="h-3.5 w-3.5 mr-1.5" /> Send Request
            </Button>
            <Button size="sm" variant="ghost" className="font-body text-xs" onClick={() => { setShowVerifyRequestForm(false); setVerifyRequestNote(""); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Executive Summary */}
      <div className={`bg-card rounded-lg p-6 border border-border border-l-4 ${analysis.overall_risk_level === "critical" ? "border-l-risk-critical" : analysis.overall_risk_level === "high" ? "border-l-risk-high" : analysis.overall_risk_level === "medium" ? "border-l-risk-medium" : "border-l-risk-low"}`}>
        <h3 className="font-display text-lg mb-3">EXECUTIVE SUMMARY</h3>
        <p className="font-body text-sm text-muted-foreground leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Source Document */}
      {!isSeedData && sourceReport && (
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg">SOURCE DOCUMENT</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">File Name</p>
              <p className="font-body text-sm font-bold truncate">{sourceReport.file_name}</p>
            </div>
            <div>
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">File Size</p>
              <p className="font-body text-sm font-bold">{sourceReport.file_size ? `${(sourceReport.file_size / 1024 / 1024).toFixed(1)} MB` : "Unknown"}</p>
            </div>
            <div>
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">Page Count</p>
              <p className="font-body text-sm font-bold">{sourceReport.page_count || "Unknown"}</p>
            </div>
            <div>
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">Uploaded By</p>
              <p className="font-body text-sm font-bold">{uploaderProfile?.full_name || "Team Member"}</p>
            </div>
          </div>
          {sourceReport.file_url && (
            <Button size="sm" variant="outline" className="font-body text-xs font-bold" onClick={handleDownloadSource}>
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Download Original PDF
            </Button>
          )}
        </div>
      )}

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

      {/* Previous Analyses */}
      {previousAnalyses.length > 0 && (
        <div className="bg-card rounded-lg p-6 border border-border border-t-4 border-t-secondary">
          <div className="flex items-center gap-3 mb-4">
            <History className="h-5 w-5 text-secondary" />
            <h3 className="font-display text-lg">PREVIOUS ANALYSES — {analysis.company_name.toUpperCase()}</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary/20 text-secondary">{previousAnalyses.length}</span>
          </div>
          <p className="font-body text-xs text-muted-foreground mb-4">
            All team analyses for this company, ordered chronologically. Compare changes over time.
          </p>
          <div className="space-y-3">
            {previousAnalyses.map((prev) => {
              const scoreDiff = analysis.overall_risk_score - prev.overall_risk_score;
              return (
                <div key={prev.id} className="bg-muted/40 rounded-lg p-4 border border-border hover:bg-muted/60 cursor-pointer transition-colors" onClick={() => navigate(`/analysis/${prev.id}`)}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-display text-2xl">{prev.overall_risk_score}</span>
                      {scoreDiff > 0 ? (
                        <span className="flex items-center gap-0.5 text-risk-critical text-xs font-bold"><TrendingUp className="h-3.5 w-3.5" /> +{scoreDiff}</span>
                      ) : scoreDiff < 0 ? (
                        <span className="flex items-center gap-0.5 text-risk-low text-xs font-bold"><TrendingDown className="h-3.5 w-3.5" /> {scoreDiff}</span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-muted-foreground text-xs font-bold"><Minus className="h-3.5 w-3.5" /> 0</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary/20 text-secondary">{prev.report_year}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getRiskBgColor(prev.overall_risk_level)}`}>{prev.overall_risk_level}</span>
                        <span className="font-body text-[10px] text-muted-foreground">
                          {new Date(prev.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </span>
                        <span className="font-body text-[10px] text-muted-foreground">• {prev.findings_count} finding{prev.findings_count !== 1 ? "s" : ""}</span>
                        {prev.user_id && <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary font-bold">Team Member</span>}
                        {!prev.user_id && <span className="px-2 py-0.5 rounded-full text-[10px] bg-risk-low-bg text-risk-low font-bold">Demo</span>}
                      </div>
                      {prev.top_findings.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {prev.top_findings.map((title, fi) => (
                            <span key={fi} className="px-2 py-0.5 rounded text-[10px] bg-muted text-muted-foreground truncate max-w-[200px]">{title}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
