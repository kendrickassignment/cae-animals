
-- Fix companies SELECT policy: all authenticated users can view all records
DROP POLICY IF EXISTS "Users can view own or shared companies" ON public.companies;
CREATE POLICY "Authenticated users can view all companies"
  ON public.companies FOR SELECT TO authenticated
  USING (true);

-- Fix analysis_results SELECT policy: all authenticated users can view all records
DROP POLICY IF EXISTS "Users can view own analyses" ON public.analysis_results;
CREATE POLICY "Authenticated users can view all analyses"
  ON public.analysis_results FOR SELECT TO authenticated
  USING (true);

-- Fix reports SELECT policy: all authenticated users can view all records
DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
CREATE POLICY "Authenticated users can view all reports"
  ON public.reports FOR SELECT TO authenticated
  USING (true);
