-- Booking flow fixes from the 26 Nov 2026 bug scan.
-- Safe to run more than once.

-- ---------------------------------------------------------------------------
-- 1. Host changes to their own booking_hosts row
--    * approval is cleared when the host changes their answer or student count
--      (before, it stuck, so pulling out then re-accepting showed "Approved")
--    * a host can't move their row to another booking
--    * a host can't say yes to a cancelled, completed or finished booking,
--      can't accept 0 students or more than the booking has,
--      and a disabled host can't change anything
--    Admins and the server (no signed-in user) are not affected.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_booking_host_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  b RECORD;
  host_active boolean;
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  SELECT is_active INTO host_active FROM public.profiles WHERE user_id = auth.uid();
  IF host_active IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Your account is paused. Please contact the HEHF team.'
      USING ERRCODE = 'check_violation';
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.approved_at := NULL;
    NEW.approved_by := NULL;
  ELSE
    NEW.booking_id := OLD.booking_id;
    NEW.host_id := OLD.host_id;
    IF NEW.response IS DISTINCT FROM OLD.response
       OR COALESCE(NEW.students_assigned, 0) IS DISTINCT FROM COALESCE(OLD.students_assigned, 0) THEN
      NEW.approved_at := NULL;
      NEW.approved_by := NULL;
    ELSE
      NEW.approved_at := OLD.approved_at;
      NEW.approved_by := OLD.approved_by;
    END IF;
  END IF;

  IF NEW.response = 'accepted' AND (
       TG_OP = 'INSERT'
       OR OLD.response IS DISTINCT FROM 'accepted'
       OR COALESCE(NEW.students_assigned, 0) IS DISTINCT FROM COALESCE(OLD.students_assigned, 0)
     ) THEN
    SELECT status, departure_date, number_of_students INTO b
      FROM public.bookings WHERE id = NEW.booking_id;
    IF b.status IN ('cancelled', 'completed') THEN
      RAISE EXCEPTION 'This booking is % and can no longer be accepted.', b.status
        USING ERRCODE = 'check_violation';
    END IF;
    IF b.departure_date < current_date THEN
      RAISE EXCEPTION 'This booking has already finished.'
        USING ERRCODE = 'check_violation';
    END IF;
    IF COALESCE(NEW.students_assigned, 0) < 1 THEN
      RAISE EXCEPTION 'Please enter at least 1 student.'
        USING ERRCODE = 'check_violation';
    END IF;
    IF b.number_of_students IS NOT NULL AND NEW.students_assigned > b.number_of_students THEN
      RAISE EXCEPTION 'This booking only has % student(s).', b.number_of_students
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_booking_host_approval ON public.booking_hosts;
CREATE TRIGGER protect_booking_host_approval
  BEFORE INSERT OR UPDATE ON public.booking_hosts
  FOR EACH ROW EXECUTE FUNCTION public.protect_booking_host_approval();
REVOKE EXECUTE ON FUNCTION public.protect_booking_host_approval() FROM PUBLIC, anon, authenticated;

-- Tidy rows that were left "approved" after the host pulled out.
UPDATE public.booking_hosts
   SET approved_at = NULL, approved_by = NULL
 WHERE approved_at IS NOT NULL AND response IS DISTINCT FROM 'accepted';

-- ---------------------------------------------------------------------------
-- 2. Tell admins (bell icon) when a host says yes, changes numbers or pulls out.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_admins_host_response()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref text;
  host_name text;
  msg text;
  was_accepted boolean := TG_OP = 'UPDATE' AND OLD.response = 'accepted';
BEGIN
  -- Only react to the host's own changes, not admin edits.
  IF auth.uid() IS NULL OR auth.uid() IS DISTINCT FROM NEW.host_id THEN
    RETURN NEW;
  END IF;

  SELECT booking_reference INTO ref FROM public.bookings WHERE id = NEW.booking_id;
  SELECT full_name INTO host_name FROM public.profiles WHERE user_id = NEW.host_id;

  IF NEW.response = 'accepted' AND NOT was_accepted THEN
    msg := COALESCE(host_name, 'A host') || ' can host ' || COALESCE(NEW.students_assigned, 0)
        || ' student(s) for booking ' || COALESCE(ref, '') || '.';
  ELSIF NEW.response = 'accepted' AND was_accepted
        AND COALESCE(NEW.students_assigned, 0) IS DISTINCT FROM COALESCE(OLD.students_assigned, 0) THEN
    msg := COALESCE(host_name, 'A host') || ' changed to ' || COALESCE(NEW.students_assigned, 0)
        || ' student(s) for booking ' || COALESCE(ref, '') || '.';
  ELSIF was_accepted AND NEW.response IS DISTINCT FROM 'accepted' THEN
    msg := COALESCE(host_name, 'A host') || ' can no longer host booking ' || COALESCE(ref, '') || '.';
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (user_id, title, message, type, booking_id)
  SELECT ur.user_id, 'Host response', msg, 'booking', NEW.booking_id
    FROM public.user_roles ur
   WHERE ur.role = 'admin'::app_role;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_admins_host_response ON public.booking_hosts;
CREATE TRIGGER notify_admins_host_response
  AFTER INSERT OR UPDATE ON public.booking_hosts
  FOR EACH ROW EXECUTE FUNCTION public.notify_admins_host_response();
REVOKE EXECUTE ON FUNCTION public.notify_admins_host_response() FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Tell accepted hosts (bell icon) when an admin changes a booking's dates
--    or location.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_hosts_booking_changed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.arrival_date IS NOT DISTINCT FROM OLD.arrival_date
     AND NEW.departure_date IS NOT DISTINCT FROM OLD.departure_date
     AND NEW.location IS NOT DISTINCT FROM OLD.location THEN
    RETURN NEW;
  END IF;
  IF NEW.status = 'cancelled' THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (user_id, title, message, type, booking_id)
  SELECT bh.host_id,
         'Booking changed',
         'Booking ' || NEW.booking_reference || ' has changed: now ' || NEW.location || ', '
           || to_char(NEW.arrival_date, 'DD Mon') || ' to ' || to_char(NEW.departure_date, 'DD Mon YYYY')
           || '. Please check you can still host.',
         'booking',
         NEW.id
    FROM public.booking_hosts bh
   WHERE bh.booking_id = NEW.id AND bh.response = 'accepted';

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_hosts_booking_changed ON public.bookings;
CREATE TRIGGER notify_hosts_booking_changed
  AFTER UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.notify_hosts_booking_changed();
REVOKE EXECUTE ON FUNCTION public.notify_hosts_booking_changed() FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Departure must be after arrival (existing rows are not re-checked).
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_departure_after_arrival') THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_departure_after_arrival
      CHECK (departure_date > arrival_date) NOT VALID;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 5. New-booking bell notification: match locations ignoring case and spaces.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_hosts_new_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, booking_id)
  SELECT p.user_id,
         'New Booking Available',
         'A new booking (' || NEW.booking_reference || ') is available in ' || NEW.location || ' for '
           || NEW.number_of_students || ' students from ' || NEW.country_of_students || '.',
         'booking',
         NEW.id
    FROM public.profiles p
   WHERE p.role = 'host'
     AND p.is_active = true
     AND EXISTS (
       SELECT 1 FROM unnest(COALESCE(p.preferred_locations, '{}')) loc
        WHERE lower(trim(loc)) = lower(trim(NEW.location))
     );
  RETURN NEW;
END;
$function$;

-- ---------------------------------------------------------------------------
-- 6. Sign-ups: never trust the role a sign-up asks for, and only accounts made
--    by an admin (through our server functions) start active. Someone who
--    signs up on their own gets a paused host account that can see nothing.
--    Existing accounts are not touched.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role, is_active)
  VALUES (
    new.id,
    lower(trim(new.email)),
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.email),
    'host',
    COALESCE((new.raw_app_meta_data ->> 'created_by_admin')::boolean, false)
  );
  RETURN new;
END;
$$;
