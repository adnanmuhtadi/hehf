-- Drop the restrictive policy
DROP POLICY IF EXISTS "Hosts can view bookings in their preferred location" ON public.bookings;

-- Create a new policy that allows active hosts to view all bookings
CREATE POLICY "Hosts can view all bookings"
ON public.bookings
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'host'::user_role
      AND profiles.is_active = true
  )
);