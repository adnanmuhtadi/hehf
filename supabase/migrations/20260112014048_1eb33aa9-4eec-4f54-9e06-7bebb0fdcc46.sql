-- Drop the policy that depends on preferred_location
DROP POLICY IF EXISTS "Hosts can view bookings in their preferred location" ON public.bookings;

-- Add the new column for multiple locations
ALTER TABLE public.profiles 
ADD COLUMN preferred_locations text[] DEFAULT '{}';

-- Migrate existing data
UPDATE public.profiles 
SET preferred_locations = ARRAY[preferred_location]
WHERE preferred_location IS NOT NULL;

-- Drop old column
ALTER TABLE public.profiles 
DROP COLUMN preferred_location;

-- Recreate the policy using the new array column
CREATE POLICY "Hosts can view bookings in their preferred location" 
ON public.bookings 
FOR SELECT 
USING (EXISTS (
  SELECT 1
  FROM profiles
  WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'host'::user_role
    AND profiles.is_active = true
    AND array_length(profiles.preferred_locations, 1) > 0
    AND bookings.location = ANY(profiles.preferred_locations)
));