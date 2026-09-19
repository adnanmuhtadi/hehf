CREATE TABLE public.booking_host_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  host_id uuid NOT NULL,
  action text NOT NULL,
  details text,
  performed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.booking_host_audit TO authenticated;
GRANT ALL ON public.booking_host_audit TO service_role;

ALTER TABLE public.booking_host_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view booking host audit"
ON public.booking_host_audit FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Hosts can view their own audit entries"
ON public.booking_host_audit FOR SELECT TO authenticated
USING (host_id = auth.uid());

CREATE INDEX idx_booking_host_audit_booking ON public.booking_host_audit(booking_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.log_booking_host_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  act text;
  det text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    act := 'assigned';
    det := 'Host assigned to booking (response: ' || COALESCE(NEW.response::text, 'pending') || ')';
    INSERT INTO public.booking_host_audit (booking_id, host_id, action, details, performed_by)
    VALUES (NEW.booking_id, NEW.host_id, act, det, auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.booking_host_audit (booking_id, host_id, action, details, performed_by)
    VALUES (OLD.booking_id, OLD.host_id, 'removed', 'Host assignment removed from booking', auth.uid());
    RETURN OLD;
  ELSE
    IF NEW.response IS DISTINCT FROM OLD.response THEN
      INSERT INTO public.booking_host_audit (booking_id, host_id, action, details, performed_by)
      VALUES (NEW.booking_id, NEW.host_id, 'response_changed',
        'Response changed from ' || COALESCE(OLD.response::text, 'pending') || ' to ' || COALESCE(NEW.response::text, 'pending'), auth.uid());
    END IF;
    IF NEW.approved_at IS DISTINCT FROM OLD.approved_at THEN
      INSERT INTO public.booking_host_audit (booking_id, host_id, action, details, performed_by)
      VALUES (NEW.booking_id, NEW.host_id,
        CASE WHEN NEW.approved_at IS NULL THEN 'approval_revoked' ELSE 'approved' END,
        CASE WHEN NEW.approved_at IS NULL THEN 'Approval revoked' ELSE 'Acceptance approved by admin' END,
        auth.uid());
    END IF;
    IF NEW.students_assigned IS DISTINCT FROM OLD.students_assigned THEN
      INSERT INTO public.booking_host_audit (booking_id, host_id, action, details, performed_by)
      VALUES (NEW.booking_id, NEW.host_id, 'students_changed',
        'Students assigned changed from ' || COALESCE(OLD.students_assigned, 0) || ' to ' || COALESCE(NEW.students_assigned, 0), auth.uid());
    END IF;
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER log_booking_host_change_trg
AFTER INSERT OR UPDATE OR DELETE ON public.booking_hosts
FOR EACH ROW EXECUTE FUNCTION public.log_booking_host_change();