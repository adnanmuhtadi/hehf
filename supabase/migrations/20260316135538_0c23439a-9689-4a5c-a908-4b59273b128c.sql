
-- ============================================
-- FIX 1: CRITICAL - Privilege escalation vulnerability
-- Replace the self-update policy to restrict columns users can edit
-- ============================================

-- Drop the existing overly-permissive self-update policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create a restricted self-update policy using a SECURITY DEFINER function
CREATE OR REPLACE FUNCTION public.update_own_profile(
  _full_name text DEFAULT NULL,
  _address text DEFAULT NULL,
  _phone text DEFAULT NULL,
  _pets text DEFAULT NULL,
  _single_bed_capacity integer DEFAULT NULL,
  _shared_bed_capacity integer DEFAULT NULL,
  _preferred_locations text[] DEFAULT NULL,
  _handbook_downloaded boolean DEFAULT NULL,
  _has_completed_tour boolean DEFAULT NULL,
  _must_reset_password boolean DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles SET
    full_name = COALESCE(_full_name, full_name),
    address = COALESCE(_address, address),
    pets = COALESCE(_pets, pets),
    single_bed_capacity = COALESCE(_single_bed_capacity, single_bed_capacity),
    shared_bed_capacity = COALESCE(_shared_bed_capacity, shared_bed_capacity),
    preferred_locations = COALESCE(_preferred_locations, preferred_locations),
    handbook_downloaded = COALESCE(_handbook_downloaded, handbook_downloaded),
    has_completed_tour = COALESCE(_has_completed_tour, has_completed_tour),
    must_reset_password = COALESCE(_must_reset_password, must_reset_password),
    updated_at = now()
  WHERE user_id = auth.uid();
END;
$$;

-- Re-create self-update policy but ONLY for safe columns
-- This policy now only allows updates where role and is_active remain unchanged
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
  );

-- ============================================
-- FIX 2: Change public-scoped policies to authenticated
-- ============================================

-- Fix: bookings - Hosts can view all bookings
DROP POLICY IF EXISTS "Hosts can view all bookings" ON public.bookings;
CREATE POLICY "Hosts can view all bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'host'::user_role
      AND profiles.is_active = true
  ));

-- Fix: profiles - Admins can update all profiles
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix: host_location_bonuses - Admins can manage
DROP POLICY IF EXISTS "Admins can manage host location bonuses" ON public.host_location_bonuses;
CREATE POLICY "Admins can manage host location bonuses"
  ON public.host_location_bonuses
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix: host_location_bonuses - Hosts can view their own
DROP POLICY IF EXISTS "Hosts can view their own bonuses" ON public.host_location_bonuses;
CREATE POLICY "Hosts can view their own bonuses"
  ON public.host_location_bonuses
  FOR SELECT
  TO authenticated
  USING (host_id = auth.uid());

-- ============================================
-- FIX 3: Backfill missing user_roles entries (29 hosts)
-- ============================================
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, p.role::text::app_role
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles ur WHERE ur.user_id = p.user_id
)
ON CONFLICT (user_id, role) DO NOTHING;
