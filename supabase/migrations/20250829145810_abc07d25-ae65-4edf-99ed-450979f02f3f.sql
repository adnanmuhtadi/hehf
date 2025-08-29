-- Remove the duration column from bookings table as it's no longer needed
-- The nights are now calculated automatically from arrival and departure dates
ALTER TABLE public.bookings 
DROP COLUMN IF EXISTS duration;