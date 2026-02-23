
-- Fix the overly permissive INSERT policy
DROP POLICY "Allow insert for service role" ON public.admin_notifications;

-- Only allow inserts where the admin_user_id matches an actual admin
CREATE POLICY "Allow insert for admins"
ON public.admin_notifications FOR INSERT
WITH CHECK (public.has_role(admin_user_id, 'admin'));
