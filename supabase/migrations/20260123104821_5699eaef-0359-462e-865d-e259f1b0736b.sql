-- Drop RLS policies on host_ratings first
DROP POLICY IF EXISTS "Admins can manage all ratings" ON public.host_ratings;
DROP POLICY IF EXISTS "Hosts can view their own ratings" ON public.host_ratings;

-- Drop the trigger that updates host ratings
DROP TRIGGER IF EXISTS update_host_rating_trigger ON public.host_ratings;

-- Drop the function that calculates host ratings
DROP FUNCTION IF EXISTS public.update_host_rating();

-- Drop the host_ratings table
DROP TABLE IF EXISTS public.host_ratings;

-- Remove rating columns from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS rating;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS rating_count;