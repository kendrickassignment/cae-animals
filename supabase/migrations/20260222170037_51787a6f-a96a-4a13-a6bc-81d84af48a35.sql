
-- Add verified and document_confidence columns to analysis_results
ALTER TABLE public.analysis_results
  ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_by uuid DEFAULT null,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz DEFAULT null,
  ADD COLUMN IF NOT EXISTS document_confidence text DEFAULT null,
  ADD COLUMN IF NOT EXISTS document_confidence_reason text DEFAULT null;

-- Create analysis_flags table
CREATE TABLE public.analysis_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES public.analysis_results(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reason text NOT NULL,
  dismissed boolean NOT NULL DEFAULT false,
  dismissed_by uuid DEFAULT null,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Unique constraint: one flag per user per analysis
ALTER TABLE public.analysis_flags ADD CONSTRAINT unique_flag_per_user_analysis UNIQUE (analysis_id, user_id);

-- Enable RLS
ALTER TABLE public.analysis_flags ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view flags (shared research tool)
CREATE POLICY "Authenticated users can view all flags"
  ON public.analysis_flags FOR SELECT TO authenticated
  USING (true);

-- Users can create their own flags
CREATE POLICY "Users can flag analyses"
  ON public.analysis_flags FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Users can update (withdraw) their own flags
CREATE POLICY "Users can update own flags"
  ON public.analysis_flags FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id);

-- Admins can update any flag (dismiss)
CREATE POLICY "Admins can update any flag"
  ON public.analysis_flags FOR UPDATE TO authenticated
  USING (public.has_role((select auth.uid()), 'admin'));

-- Admins can delete flags
CREATE POLICY "Admins can delete flags"
  ON public.analysis_flags FOR DELETE TO authenticated
  USING (public.has_role((select auth.uid()), 'admin'));

-- Index for fast flag lookups
CREATE INDEX idx_analysis_flags_analysis_id ON public.analysis_flags(analysis_id);
