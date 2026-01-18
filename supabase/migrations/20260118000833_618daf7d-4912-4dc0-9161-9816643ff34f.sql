-- Delete all booking host assignments first (due to foreign key relationship)
DELETE FROM public.booking_hosts;

-- Delete all bookings
DELETE FROM public.bookings;