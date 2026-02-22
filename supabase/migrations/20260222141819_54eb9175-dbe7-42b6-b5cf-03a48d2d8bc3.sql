-- Allow users to update findings for their own reports
CREATE POLICY "Users can update findings for own reports"
  ON public.findings FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id = report_id AND reports.user_id = auth.uid()
    )
  );

-- Allow users to delete findings for their own reports
CREATE POLICY "Users can delete findings for own reports"
  ON public.findings FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id = report_id AND reports.user_id = auth.uid()
    )
  );