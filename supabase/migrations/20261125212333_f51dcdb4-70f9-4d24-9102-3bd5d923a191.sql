-- Hosts could set approved_at / approved_by on their own booking_hosts row
-- (the "Hosts can update their assignments" rule allows any column), which
-- let a host approve their own placement. This keeps those two columns
-- admin-only. Anything run by the server (no signed-in user) is unaffected.
CREATE OR REPLACE FUNCTION public.protect_booking_host_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.approved_at := NULL;
    NEW.approved_by := NULL;
  ELSE
    NEW.approved_at := OLD.approved_at;
    NEW.approved_by := OLD.approved_by;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_booking_host_approval ON public.booking_hosts;
CREATE TRIGGER protect_booking_host_approval
  BEFORE INSERT OR UPDATE ON public.booking_hosts
  FOR EACH ROW EXECUTE FUNCTION public.protect_booking_host_approval();