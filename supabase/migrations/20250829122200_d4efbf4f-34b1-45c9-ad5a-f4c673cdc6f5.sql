-- Drop the incorrect policy
DROP POLICY IF EXISTS "Hosts can view bookings in their preferred location" ON public.bookings;

-- Create the correct policy to allow hosts to view bookings in their preferred location
CREATE POLICY "Hosts can view bookings in their preferred location" 
ON public.bookings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE user_id = auth.uid()
    AND role = 'host' 
    AND is_active = true 
    AND preferred_location IS NOT NULL 
    AND bookings.location ILIKE '%' || profiles.preferred_location || '%'
  )
);