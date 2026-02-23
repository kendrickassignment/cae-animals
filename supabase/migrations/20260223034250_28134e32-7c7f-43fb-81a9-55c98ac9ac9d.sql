
-- Create admin-only verification RPC function
CREATE OR REPLACE FUNCTION public.set_analysis_verification(
  _analysis_id UUID,
  _verified BOOLEAN
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can verify analyses';
  END IF;

  -- Update verification status
  UPDATE public.analysis_results
  SET 
    verified = _verified,
    verified_by = CASE WHEN _verified THEN auth.uid() ELSE NULL END,
    verified_at = CASE WHEN _verified THEN now() ELSE NULL END
  WHERE id = _analysis_id;
END;
$$;

-- Grant execute to authenticated users (function checks admin role internally)
GRANT EXECUTE ON FUNCTION public.set_analysis_verification TO authenticated;
