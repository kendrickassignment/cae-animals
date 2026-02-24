
DROP POLICY IF EXISTS "Allow insert for admins" ON public.admin_notifications;

CREATE POLICY "No client-side inserts"
ON public.admin_notifications FOR INSERT
WITH CHECK (false);
