
-- Add user_id column to companies (nullable for seed/demo data)
ALTER TABLE public.companies ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can insert companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can update companies" ON public.companies;

-- SELECT: users can see their own companies OR shared/seed companies (null user_id)
CREATE POLICY "Users can view own or shared companies"
  ON public.companies FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

-- INSERT: user_id must match auth.uid()
CREATE POLICY "Users can insert own companies"
  ON public.companies FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE: only owner can update
CREATE POLICY "Users can update own companies"
  ON public.companies FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- DELETE: only owner can delete
CREATE POLICY "Users can delete own companies"
  ON public.companies FOR DELETE TO authenticated
  USING (user_id = auth.uid());
