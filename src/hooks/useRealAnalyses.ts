import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getAnalysis } from "@/services/api";
import type { SeedAnalysis, SeedFinding } from "@/data/seed-data";

export interface RealAnalysis extends SeedAnalysis {
  llm_provider?: string;
  llm_model?: string;
  input_tokens?: number;
  output_tokens?: number;
  cost_estimate_usd?: number;
  analyzed_at?: string;
  isReal: true;
}

function mapBackendToAnalysis(row: any): RealAnalysis {
  const findings: SeedFinding[] = (row.findings || []).map((f: any, idx: number) => ({
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
    id: row.id,
    report_id: row.report_id || "",
    company_name: row.company_name || "Unknown Company",
    report_year: row.report_year || new Date().getFullYear(),
    overall_risk_level: row.overall_risk_level || "medium",
    overall_risk_score: row.overall_risk_score || 0,
    global_claim: row.global_claim || "",
    indonesia_mentioned: row.indonesia_mentioned ?? false,
    indonesia_status: row.indonesia_status || "silent",
    sea_countries_mentioned: row.sea_countries_mentioned || [],
    sea_countries_excluded: row.sea_countries_excluded || [],
    binding_language_count: row.binding_language_count || 0,
    hedging_language_count: row.hedging_language_count || 0,
    summary: row.summary || "",
    status: "completed",
    created_at: row.created_at || row.analyzed_at || new Date().toISOString(),
    findings,
    llm_provider: row.llm_provider,
    llm_model: row.llm_model,
    input_tokens: row.input_tokens,
    output_tokens: row.output_tokens,
    cost_estimate_usd: row.cost_estimate_usd,
    analyzed_at: row.analyzed_at,
    isReal: true,
  };
}

export function useRealAnalyses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["real-analyses", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("analysis_results")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(mapBackendToAnalysis);
    },
    enabled: !!user,
    staleTime: 30000,
  });
}

export async function fetchAndSaveAnalysis(
  backendAnalysisId: string,
  userId: string,
  reportId: string,
  companyName: string,
  reportYear: number,
): Promise<string | null> {
  try {
    const backendData = await getAnalysis(backendAnalysisId);

    const { data: inserted, error } = await supabase.from("analysis_results").insert({
      report_id: reportId,
      user_id: userId,
      company_name: companyName,
      report_year: reportYear,
      overall_risk_level: backendData.overall_risk_level || backendData.risk_level,
      overall_risk_score: backendData.overall_risk_score || backendData.risk_score,
      global_claim: backendData.global_claim,
      indonesia_mentioned: backendData.indonesia_mentioned,
      indonesia_status: backendData.indonesia_status,
      sea_countries_mentioned: backendData.sea_countries_mentioned || [],
      sea_countries_excluded: backendData.sea_countries_excluded || [],
      binding_language_count: backendData.binding_language_count || 0,
      hedging_language_count: backendData.hedging_language_count || 0,
      summary: backendData.summary,
      findings: backendData.findings || [],
      llm_provider: backendData.provider || backendData.llm_provider,
      llm_model: backendData.model || backendData.llm_model,
      input_tokens: backendData.input_tokens,
      output_tokens: backendData.output_tokens,
      cost_estimate_usd: backendData.cost_estimate_usd,
      analyzed_at: new Date().toISOString(),
    } as any).select().single();

    if (error) {
      console.error("Failed to save analysis to DB:", error);
      return null;
    }
    return (inserted as any)?.id || null;
  } catch (err) {
    console.error("Failed to fetch/save analysis:", err);
    return null;
  }
}

export { mapBackendToAnalysis };
