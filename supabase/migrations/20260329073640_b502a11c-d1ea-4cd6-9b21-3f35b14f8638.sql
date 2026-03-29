
-- 1. Create a secure view that hides cost/token/LLM columns for non-admin users
CREATE OR REPLACE VIEW public.analysis_results_safe AS
SELECT
  id,
  report_id,
  company_name,
  report_year,
  overall_risk_level,
  overall_risk_score,
  global_claim,
  indonesia_mentioned,
  indonesia_status,
  sea_countries_mentioned,
  sea_countries_excluded,
  binding_language_count,
  hedging_language_count,
  summary,
  findings,
  created_at,
  user_id,
  analyzed_at,
  verified,
  verified_by,
  verified_at,
  file_hash,
  document_confidence,
  document_confidence_reason,
  -- Sensitive columns: only visible to the owner or admins
  CASE
    WHEN auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
    THEN llm_provider ELSE NULL
  END AS llm_provider,
  CASE
    WHEN auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
    THEN llm_model ELSE NULL
  END AS llm_model,
  CASE
    WHEN auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
    THEN input_tokens ELSE NULL
  END AS input_tokens,
  CASE
    WHEN auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
    THEN output_tokens ELSE NULL
  END AS output_tokens,
  CASE
    WHEN auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
    THEN cost_estimate_usd ELSE NULL
  END AS cost_estimate_usd
FROM public.analysis_results;

-- 2. Lock down contact_rate_limits: explicit deny for all client-side operations
CREATE POLICY "No client-side reads" ON public.contact_rate_limits
  FOR SELECT TO public USING (false);

CREATE POLICY "No client-side inserts" ON public.contact_rate_limits
  FOR INSERT TO public WITH CHECK (false);

CREATE POLICY "No client-side updates" ON public.contact_rate_limits
  FOR UPDATE TO public USING (false);

CREATE POLICY "No client-side deletes" ON public.contact_rate_limits
  FOR DELETE TO public USING (false);

-- 3. Lock down user_roles: explicit deny INSERT and DELETE
CREATE POLICY "No client-side inserts" ON public.user_roles
  FOR INSERT TO public WITH CHECK (false);

CREATE POLICY "No client-side deletes" ON public.user_roles
  FOR DELETE TO public USING (false);
