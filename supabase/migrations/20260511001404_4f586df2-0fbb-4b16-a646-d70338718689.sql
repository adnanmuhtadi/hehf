-- Remove _must_reset_password parameter from update_own_profile to prevent
-- hosts from clearing the admin-enforced password reset flag without actually
-- changing their password.
DROP FUNCTION IF EXISTS public.update_own_profile(text, text, text, text, integer, integer, text[], boolean, boolean, boolean);

CREATE OR REPLACE FUNCTION public.update_own_profile(
  _full_name text DEFAULT NULL,
  _address text DEFAULT NULL,
  _phone text DEFAULT NULL,
  _pets text DEFAULT NULL,
  _single_bed_capacity integer DEFAULT NULL,
  _shared_bed_capacity integer DEFAULT NULL,
  _preferred_locations text[] DEFAULT NULL,
  _handbook_downloaded boolean DEFAULT NULL,
  _has_completed_tour boolean DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    updated_at = now()
  WHERE user_id = auth.uid();
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.update_own_profile(text, text, text, text, integer, integer, text[], boolean, boolean) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.update_own_profile(text, text, text, text, integer, integer, text[], boolean, boolean) TO authenticated;

-- Clear the password reset flag automatically when a user changes their auth
-- password. The trigger on auth.users.encrypted_password ensures the flag can
-- only be cleared as a side effect of a real password change, not by an RPC.
CREATE OR REPLACE FUNCTION public.clear_must_reset_password_on_pw_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.encrypted_password IS DISTINCT FROM OLD.encrypted_password THEN
    UPDATE public.profiles
      SET must_reset_password = false,
          updated_at = now()
      WHERE user_id = NEW.id
        AND must_reset_password = true;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS clear_must_reset_password_trigger ON auth.users;
CREATE TRIGGER clear_must_reset_password_trigger
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.clear_must_reset_password_on_pw_change();