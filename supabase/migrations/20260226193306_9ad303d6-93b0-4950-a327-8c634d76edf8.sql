
-- 1. PROFILES: RLS is already enabled. Drop and recreate SELECT policies.
-- Current: "Users can view own profile" (id = auth.uid()) and "Admins can view all profiles" (has_role admin)
-- These are already correct per the RLS dump. No changes needed for profiles.

-- 2. REPORTS: Replace overly permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view all reports" ON public.reports;

CREATE POLICY "Users can view own, verified-linked, seed, or admin sees all"
  ON public.reports FOR SELECT TO authenticated
  USING (
    (user_id = (SELECT auth.uid()))
    OR (user_id IS NULL)
    OR (EXISTS (
      SELECT 1 FROM public.analysis_results ar
      WHERE ar.report_id = reports.id
      AND ar.verified = true
    ))
    OR has_role((SELECT auth.uid()), 'admin'::app_role)
  );

-- 3. ANALYSIS_FLAGS: Replace overly permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view all flags" ON public.analysis_flags;

CREATE POLICY "Users can view own flags or admin sees all"
  ON public.analysis_flags FOR SELECT TO authenticated
  USING (
    (user_id = (SELECT auth.uid()))
    OR has_role((SELECT auth.uid()), 'admin'::app_role)
  );
