-- Add must_reset_password column to profiles
ALTER TABLE public.profiles 
ADD COLUMN must_reset_password boolean DEFAULT false;