
-- Add missing columns to analysis_results
ALTER TABLE public.analysis_results
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS report_year integer,
  ADD COLUMN IF NOT EXISTS findings jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS llm_provider text,
  ADD COLUMN IF NOT EXISTS llm_model text,
  ADD COLUMN IF NOT EXISTS input_tokens integer,
  ADD COLUMN IF NOT EXISTS output_tokens integer,
  ADD COLUMN IF NOT EXISTS cost_estimate_usd numeric,
  ADD COLUMN IF NOT EXISTS analyzed_at timestamptz;

-- Add analysis_id to reports if not exists
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS analysis_id uuid;

-- Drop old permissive policies on analysis_results and replace with user-scoped ones
DROP POLICY IF EXISTS "Authenticated users can insert analysis" ON public.analysis_results;
DROP POLICY IF EXISTS "Authenticated users can view analysis" ON public.analysis_results;

CREATE POLICY "Users can view own analyses"
  ON public.analysis_results FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own analyses"
  ON public.analysis_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses"
  ON public.analysis_results FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses"
  ON public.analysis_results FOR DELETE
  USING (auth.uid() = user_id);
