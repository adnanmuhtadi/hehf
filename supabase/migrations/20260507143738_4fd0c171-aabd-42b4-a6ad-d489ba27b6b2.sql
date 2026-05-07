ALTER TABLE public.booking_hosts
  ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS approved_by uuid;

CREATE OR REPLACE FUNCTION public.notify_host_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref text;
BEGIN
  IF NEW.approved_at IS NOT NULL AND (OLD.approved_at IS NULL OR OLD.approved_at IS DISTINCT FROM NEW.approved_at) THEN
    SELECT booking_reference INTO ref FROM public.bookings WHERE id = NEW.booking_id;
    INSERT INTO public.notifications (user_id, title, message, type, booking_id)
    VALUES (
      NEW.host_id,
      'Acceptance approved',
      'Your acceptance for booking ' || COALESCE(ref, '') || ' has been approved by admin.',
      'booking',
      NEW.booking_id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_host_on_approval ON public.booking_hosts;
CREATE TRIGGER trg_notify_host_on_approval
AFTER UPDATE ON public.booking_hosts
FOR EACH ROW
EXECUTE FUNCTION public.notify_host_on_approval();