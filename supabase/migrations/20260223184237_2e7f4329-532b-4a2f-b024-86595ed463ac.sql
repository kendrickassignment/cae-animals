
-- Allow admins to delete any analysis
CREATE POLICY "Admins can delete any analysis"
ON public.analysis_results
FOR DELETE
USING (has_role((SELECT auth.uid()), 'admin'::app_role));

-- Allow admins to update any analysis (for editing metadata)
CREATE POLICY "Admins can update any analysis"
ON public.analysis_results
FOR UPDATE
USING (has_role((SELECT auth.uid()), 'admin'::app_role));
