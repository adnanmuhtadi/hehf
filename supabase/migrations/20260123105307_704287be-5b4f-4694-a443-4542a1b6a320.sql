-- Rename the 'ignored' value to 'declined' in the booking_response enum
ALTER TYPE public.booking_response RENAME VALUE 'ignored' TO 'declined';

-- Update any existing records that have 'ignored' (they should now be 'declined')
-- This is handled automatically by the rename above