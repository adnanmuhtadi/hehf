-- Audit log for admins signing in as a host ("view as host").
-- Rows are written only by the impersonate-host edge function (service role).
CREATE TABLE public.admin_impersonation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  host_user_id uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  user_agent text,
  ip_address text
);

ALTER TABLE public.admin_impersonation_log ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.admin_impersonation_log TO authenticated;
GRANT ALL ON public.admin_impersonation_log TO service_role;

-- Admins can read the log. No INSERT/UPDATE/DELETE policies: clients cannot
-- write or tamper with it, only the service role can.
CREATE POLICY "Admins can view impersonation log"
ON public.admin_impersonation_log FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_admin_impersonation_log_started
  ON public.admin_impersonation_log (started_at DESC);
CREATE INDEX idx_admin_impersonation_log_host
  ON public.admin_impersonation_log (host_user_id, started_at DESC);

-- Signing in as a host goes through Supabase Auth, which stamps the host's
-- auth.users.last_sign_in_at. The impersonate-host function calls this right
-- after, to put the host's real last sign-in back, so "Last Login" in Host
-- Management only ever reflects the host's own sign-ins.
-- Only the service role (the edge function) can call it.
CREATE OR REPLACE FUNCTION public.restore_host_last_sign_in(_user_id uuid, _last_sign_in_at timestamptz)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $$
  UPDATE auth.users SET last_sign_in_at = _last_sign_in_at WHERE id = _user_id;
$$;

REVOKE EXECUTE ON FUNCTION public.restore_host_last_sign_in(uuid, timestamptz) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.restore_host_last_sign_in(uuid, timestamptz) TO service_role;
