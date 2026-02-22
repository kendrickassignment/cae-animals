
-- 1. Storage bucket DELETE policy for reports
CREATE POLICY "Users can delete own reports"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'reports' AND (select auth.uid())::text = (storage.foldername(name))[1]);

-- 2. RLS Performance: Replace auth.uid() with (select auth.uid()) in all policies

-- analysis_results
DROP POLICY IF EXISTS "Users can delete own analyses" ON public.analysis_results;
CREATE POLICY "Users can delete own analyses" ON public.analysis_results FOR DELETE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own analyses" ON public.analysis_results;
CREATE POLICY "Users can insert own analyses" ON public.analysis_results FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own analyses" ON public.analysis_results;
CREATE POLICY "Users can update own analyses" ON public.analysis_results FOR UPDATE USING ((select auth.uid()) = user_id);

-- companies
DROP POLICY IF EXISTS "Users can delete own companies" ON public.companies;
CREATE POLICY "Users can delete own companies" ON public.companies FOR DELETE USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own companies" ON public.companies;
CREATE POLICY "Users can insert own companies" ON public.companies FOR INSERT WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own companies" ON public.companies;
CREATE POLICY "Users can update own companies" ON public.companies FOR UPDATE USING (user_id = (select auth.uid()));

-- findings (subquery-based)
DROP POLICY IF EXISTS "Users can delete findings for own reports" ON public.findings;
CREATE POLICY "Users can delete findings for own reports" ON public.findings FOR DELETE
USING (EXISTS (SELECT 1 FROM reports WHERE reports.id = findings.report_id AND reports.user_id = (select auth.uid())));

DROP POLICY IF EXISTS "Users can insert findings for own reports" ON public.findings;
CREATE POLICY "Users can insert findings for own reports" ON public.findings FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM reports WHERE reports.id = findings.report_id AND reports.user_id = (select auth.uid())));

DROP POLICY IF EXISTS "Users can update findings for own reports" ON public.findings;
CREATE POLICY "Users can update findings for own reports" ON public.findings FOR UPDATE
USING (EXISTS (SELECT 1 FROM reports WHERE reports.id = findings.report_id AND reports.user_id = (select auth.uid())));

-- profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((select auth.uid()) = id);

-- reports
DROP POLICY IF EXISTS "Users can delete own reports" ON public.reports;
CREATE POLICY "Users can delete own reports" ON public.reports FOR DELETE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own reports" ON public.reports;
CREATE POLICY "Users can insert own reports" ON public.reports FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own reports" ON public.reports;
CREATE POLICY "Users can update own reports" ON public.reports FOR UPDATE USING ((select auth.uid()) = user_id);

-- user_roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING ((select auth.uid()) = user_id);
