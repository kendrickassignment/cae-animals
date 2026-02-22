
CREATE TABLE public.contact_rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address text NOT NULL,
  submitted_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_rate_limits ENABLE ROW LEVEL SECURITY;

-- Edge function uses service role, so no public policies needed.
-- Create index for efficient lookups
CREATE INDEX idx_contact_rate_limits_ip_time ON public.contact_rate_limits (ip_address, submitted_at DESC);
