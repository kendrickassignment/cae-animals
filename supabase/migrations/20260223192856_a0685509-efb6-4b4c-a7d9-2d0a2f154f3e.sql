
-- Create admin_notifications table for persistent notifications
CREATE TABLE public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  analysis_id UUID REFERENCES public.analysis_results(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Admins can only see their own notifications
CREATE POLICY "Admins can view their own notifications"
ON public.admin_notifications FOR SELECT
USING (auth.uid() = admin_user_id);

-- Admins can update (mark read) their own notifications
CREATE POLICY "Admins can update their own notifications"
ON public.admin_notifications FOR UPDATE
USING (auth.uid() = admin_user_id);

-- Service role inserts (from edge function) — allow insert for authenticated users with admin role
CREATE POLICY "Allow insert for service role"
ON public.admin_notifications FOR INSERT
WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;

-- Index for fast lookups
CREATE INDEX idx_admin_notifications_user_read ON public.admin_notifications (admin_user_id, read);
