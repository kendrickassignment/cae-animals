
DROP POLICY IF EXISTS "Users can insert own analyses" ON analysis_results;
DROP POLICY IF EXISTS "Users can update own analyses" ON analysis_results;
DROP POLICY IF EXISTS "Users can delete own analyses" ON analysis_results;
DROP POLICY IF EXISTS "Admins can update any analysis" ON analysis_results;
DROP POLICY IF EXISTS "Admins can delete any analysis" ON analysis_results;

CREATE POLICY "Users can insert own analyses" ON analysis_results
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses" ON analysis_results
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" ON analysis_results
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any analysis" ON analysis_results
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete any analysis" ON analysis_results
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'));
