CREATE OR REPLACE FUNCTION public.prevent_overlapping_host_acceptance()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_arrival date;
  new_departure date;
  conflict_ref text;
BEGIN
  IF NEW.response IS DISTINCT FROM 'accepted' THEN
    RETURN NEW;
  END IF;

  SELECT arrival_date, departure_date
    INTO new_arrival, new_departure
  FROM public.bookings
  WHERE id = NEW.booking_id;

  IF new_arrival IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT b.booking_reference
    INTO conflict_ref
  FROM public.booking_hosts bh
  JOIN public.bookings b ON b.id = bh.booking_id
  WHERE bh.host_id = NEW.host_id
    AND bh.response = 'accepted'
    AND bh.booking_id <> NEW.booking_id
    AND b.status <> 'cancelled'
    AND b.arrival_date < new_departure
    AND b.departure_date > new_arrival
  LIMIT 1;

  IF conflict_ref IS NOT NULL THEN
    RAISE EXCEPTION 'You have already accepted booking % for overlapping dates. Decline it first before accepting another.', conflict_ref
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$function$;