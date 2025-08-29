-- Fix infinite recursion in RLS policies by creating security definer functions

-- Drop the problematic policies first
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can manage booking hosts" ON public.booking_hosts;
DROP POLICY IF EXISTS "Admins can manage all ratings" ON public.host_ratings;

-- Create security definer functions to check user role without recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Recreate policies using the security definer functions
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin() OR auth.uid() = user_id);

CREATE POLICY "Admins can manage all bookings" ON public.bookings
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage booking hosts" ON public.booking_hosts
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all ratings" ON public.host_ratings
  FOR ALL USING (public.is_admin());