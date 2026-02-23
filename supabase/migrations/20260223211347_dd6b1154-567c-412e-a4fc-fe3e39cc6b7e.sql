
DROP POLICY "Authenticated users can view all analyses" ON public.analysis_results;

CREATE POLICY "Users can view own, verified, seed, or admin sees all"
ON public.analysis_results
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR verified = true
  OR user_id IS NULL
  OR public.has_role(auth.uid(), 'admin')
);
