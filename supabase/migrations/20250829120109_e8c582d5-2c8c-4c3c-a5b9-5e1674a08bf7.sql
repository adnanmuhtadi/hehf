-- Add preferred_location column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN preferred_location TEXT;

-- Create index for better performance when filtering by location
CREATE INDEX idx_profiles_preferred_location ON public.profiles(preferred_location);