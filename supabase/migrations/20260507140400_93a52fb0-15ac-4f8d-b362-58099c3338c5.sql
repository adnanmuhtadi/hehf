CREATE OR REPLACE FUNCTION public.get_hosts_last_sign_in()
RETURNS TABLE(user_id uuid, last_sign_in_at timestamptz)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT u.id, u.last_sign_in_at
  FROM auth.users u
  JOIN public.profiles p ON p.user_id = u.id
  WHERE p.role = 'host';
END;
$$;