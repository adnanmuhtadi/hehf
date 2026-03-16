
-- FIX 1: Split booking_hosts ALL policy into separate SELECT/UPDATE for hosts
DROP POLICY IF EXISTS "Hosts can view and update their assignments" ON public.booking_hosts;

CREATE POLICY "Hosts can view their assignments"
  ON public.booking_hosts
  FOR SELECT
  TO authenticated
  USING (host_id = auth.uid());

CREATE POLICY "Hosts can update their assignments"
  ON public.booking_hosts
  FOR UPDATE
  TO authenticated
  USING (host_id = auth.uid())
  WITH CHECK (host_id = auth.uid());

-- Hosts need INSERT to self-assign to available bookings (the current flow)
CREATE POLICY "Hosts can insert their own assignments"
  ON public.booking_hosts
  FOR INSERT
  TO authenticated
  WITH CHECK (host_id = auth.uid());

-- FIX 2: Add must_reset_password protection to self-update policy
DROP POLICY IF EXISTS "Users can update their own safe fields" ON public.profiles;

CREATE POLICY "Users can update their own safe fields"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id 
    AND role = (SELECT p.role FROM profiles p WHERE p.user_id = auth.uid())
    AND is_active = (SELECT p.is_active FROM profiles p WHERE p.user_id = auth.uid())
    AND rate_per_student_per_night = (SELECT p.rate_per_student_per_night FROM profiles p WHERE p.user_id = auth.uid())
    AND email = (SELECT p.email FROM profiles p WHERE p.user_id = auth.uid())
    AND phone = (SELECT p.phone FROM profiles p WHERE p.user_id = auth.uid())
    AND must_reset_password = (SELECT p.must_reset_password FROM profiles p WHERE p.user_id = auth.uid())
  );
