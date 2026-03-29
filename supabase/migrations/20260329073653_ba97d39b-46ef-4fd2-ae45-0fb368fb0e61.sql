
-- Fix: Set view to SECURITY INVOKER so it uses the querying user's permissions
ALTER VIEW public.analysis_results_safe SET (security_invoker = on);
