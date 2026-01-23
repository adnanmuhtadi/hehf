-- Create enum for bed types
CREATE TYPE public.bed_type AS ENUM ('single_beds_only', 'shared_beds');

-- Add bed_type column to bookings table
ALTER TABLE public.bookings 
ADD COLUMN bed_type public.bed_type DEFAULT 'single_beds_only';