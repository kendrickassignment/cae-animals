
-- Add admin SELECT policy for profiles (admins can see all profiles with full names)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create RPC function that returns masked profile name for non-admins
CREATE OR REPLACE FUNCTION public.get_display_name(_target_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _name TEXT;
BEGIN
  SELECT full_name INTO _name FROM public.profiles WHERE id = _target_user_id;
  
  IF _name IS NULL THEN
    RETURN NULL;
  END IF;

  -- If caller is the user themselves or an admin, return full name
  IF auth.uid() = _target_user_id OR public.has_role(auth.uid(), 'admin') THEN
    RETURN _name;
  END IF;

  -- Otherwise return masked name (first 3 chars + "...")
  IF LENGTH(_name) > 3 THEN
    RETURN SUBSTRING(_name FROM 1 FOR 3) || '...';
  ELSE
    RETURN _name || '...';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_display_name TO authenticated;
