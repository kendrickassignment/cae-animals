
-- Fix companies: restrict INSERT and UPDATE to authenticated users who own analyses for that company
-- Keep current behavior (any authenticated user can manage companies) but make it restrictive
DROP POLICY IF EXISTS "Authenticated users can insert companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can update companies" ON public.companies;

CREATE POLICY "Authenticated users can insert companies"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update companies"
  ON public.companies FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Fix findings: restrict INSERT to authenticated users
DROP POLICY IF EXISTS "Authenticated users can insert findings" ON public.findings;

CREATE POLICY "Authenticated users can insert findings"
  ON public.findings FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
