
-- Create verification_requests table
CREATE TABLE public.verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES public.analysis_results(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL,
  note text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view all requests
CREATE POLICY "Authenticated users can view verification requests"
ON public.verification_requests FOR SELECT TO authenticated
USING (true);

-- Users can insert own requests
CREATE POLICY "Users can insert own verification requests"
ON public.verification_requests FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = requester_id);

-- Admins can update any request
CREATE POLICY "Admins can update verification requests"
ON public.verification_requests FOR UPDATE TO authenticated
USING (has_role((SELECT auth.uid()), 'admin'::app_role));
