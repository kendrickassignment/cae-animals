
-- Fix findings INSERT policy: only allow inserting findings for reports you own
DROP POLICY IF EXISTS "Authenticated users can insert findings" ON public.findings;
CREATE POLICY "Users can insert findings for own reports"
  ON public.findings FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id = report_id AND reports.user_id = auth.uid()
    )
  );
