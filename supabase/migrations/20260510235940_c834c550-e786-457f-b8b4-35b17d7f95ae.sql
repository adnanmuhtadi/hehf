
-- 1. Tighten profiles INSERT policy to prevent role escalation
DROP POLICY IF EXISTS "Enable insert for new users" ON public.profiles;
CREATE POLICY "Enable insert for new users"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND role = 'host'::user_role);

-- 2. Restrict notifications INSERT to admins only (triggers use SECURITY DEFINER and bypass RLS)
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;
CREATE POLICY "Admins can create notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. Revoke EXECUTE from anon on SECURITY DEFINER functions (only authenticated users need them)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.update_own_profile(text, text, text, text, integer, integer, text[], boolean, boolean, boolean) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_hosts_last_sign_in() FROM anon, public;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_own_profile(text, text, text, text, integer, integer, text[], boolean, boolean, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_hosts_last_sign_in() TO authenticated;
