-- Add RLS policy to allow hosts to view bookings in their preferred location
CREATE POLICY "Hosts can view bookings in their preferred location" 
ON public.bookings 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT user_id 
    FROM profiles 
    WHERE role = 'host' 
    AND is_active = true 
    AND preferred_location IS NOT NULL 
    AND location ILIKE '%' || preferred_location || '%'
  )
);