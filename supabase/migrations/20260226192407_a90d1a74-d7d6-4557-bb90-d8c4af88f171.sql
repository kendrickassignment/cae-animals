DROP POLICY IF EXISTS "Authenticated users can view verification requests" ON public.verification_requests;

CREATE POLICY "Users can view own or admin sees all"
  ON public.verification_requests
  FOR SELECT
  TO authenticated
  USING (
    requester_id = (SELECT auth.uid())
    OR has_role((SELECT auth.uid()), 'admin'::app_role)
  );