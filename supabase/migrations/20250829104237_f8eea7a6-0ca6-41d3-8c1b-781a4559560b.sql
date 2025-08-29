-- Fix the infinite recursion by properly dropping and recreating everything

-- First drop all policies that depend on the function
DROP POLICY IF EXISTS "Users can view their own profile and admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can manage booking hosts" ON public.booking_hosts;
DROP POLICY IF EXISTS "Admins can manage all ratings" ON public.host_ratings;

-- Now drop the function
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.get_current_user_role();

-- Create new security definer function using auth.users metadata (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (raw_user_meta_data ->> 'role')::text = 'admin', 
      false
    )
    FROM auth.users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Recreate policies using the new approach
CREATE POLICY "Users can view their own profile and admins can view all" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins can manage all bookings" ON public.bookings
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage booking hosts" ON public.booking_hosts
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all ratings" ON public.host_ratings
  FOR ALL USING (public.is_admin());