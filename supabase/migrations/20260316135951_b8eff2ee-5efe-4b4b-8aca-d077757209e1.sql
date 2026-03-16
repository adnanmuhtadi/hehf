
-- Fix: Require host role for self-assignment
DROP POLICY IF EXISTS "Hosts can insert their own assignments" ON public.booking_hosts;

CREATE POLICY "Hosts can insert their own assignments"
  ON public.booking_hosts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    host_id = auth.uid() 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
        AND role = 'host'::user_role 
        AND is_active = true
    )
  );
