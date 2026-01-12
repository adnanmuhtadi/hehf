-- Create a function to notify hosts when a new booking is created in their preferred location
CREATE OR REPLACE FUNCTION public.notify_hosts_new_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  host_record RECORD;
BEGIN
  -- Find all active hosts whose preferred locations match the booking location
  FOR host_record IN 
    SELECT user_id, full_name 
    FROM public.profiles 
    WHERE role = 'host' 
      AND is_active = true 
      AND array_length(preferred_locations, 1) > 0
      AND NEW.location = ANY(preferred_locations)
  LOOP
    -- Create a notification for each matching host
    INSERT INTO public.notifications (user_id, title, message, type, booking_id)
    VALUES (
      host_record.user_id,
      'New Booking Available',
      'A new booking (' || NEW.booking_reference || ') is available in ' || NEW.location || ' for ' || NEW.number_of_students || ' students from ' || NEW.country_of_students || '.',
      'booking',
      NEW.id
    );
  END LOOP;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to call the function when a new booking is inserted
CREATE TRIGGER on_new_booking_notify_hosts
AFTER INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.notify_hosts_new_booking();