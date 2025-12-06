-- Update profiles policy to use has_role and require authentication
DROP POLICY IF EXISTS "Users can view their own profile and admins can view all" ON public.profiles;
CREATE POLICY "Users can view their own profile and admins can view all"
ON public.profiles
FOR SELECT
TO authenticated
USING ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::app_role));

-- Update bookings policy
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;
CREATE POLICY "Admins can manage all bookings"
ON public.bookings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Update booking_hosts policy
DROP POLICY IF EXISTS "Admins can manage booking hosts" ON public.booking_hosts;
CREATE POLICY "Admins can manage booking hosts"
ON public.booking_hosts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Update host_ratings policy
DROP POLICY IF EXISTS "Admins can manage all ratings" ON public.host_ratings;
CREATE POLICY "Admins can manage all ratings"
ON public.host_ratings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Now safely drop the old is_admin function and recreate it
DROP FUNCTION IF EXISTS public.is_admin();

-- Recreate is_admin using has_role for backward compatibility
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role)
$$;

-- Fix notifications INSERT policy
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "Authenticated users can create notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

-- Remove duplicate profile policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Fix hosts view and update policies to require authentication
DROP POLICY IF EXISTS "Hosts can view and update their assignments" ON public.booking_hosts;
CREATE POLICY "Hosts can view and update their assignments"
ON public.booking_hosts
FOR ALL
TO authenticated
USING (host_id = auth.uid())
WITH CHECK (host_id = auth.uid());

DROP POLICY IF EXISTS "Hosts can view assigned bookings" ON public.bookings;
CREATE POLICY "Hosts can view assigned bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM booking_hosts
  WHERE booking_hosts.booking_id = bookings.id
  AND booking_hosts.host_id = auth.uid()
));

DROP POLICY IF EXISTS "Hosts can view bookings in their preferred location" ON public.bookings;
CREATE POLICY "Hosts can view bookings in their preferred location"
ON public.bookings
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.user_id = auth.uid()
  AND profiles.role = 'host'::user_role
  AND profiles.is_active = true
  AND profiles.preferred_location IS NOT NULL
  AND bookings.location ILIKE '%' || profiles.preferred_location || '%'
));

DROP POLICY IF EXISTS "Hosts can view their own ratings" ON public.host_ratings;
CREATE POLICY "Hosts can view their own ratings"
ON public.host_ratings
FOR SELECT
TO authenticated
USING (host_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable insert for new users" ON public.profiles;
CREATE POLICY "Enable insert for new users"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);