-- Add shared_bed_capacity and single_bed_capacity columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN shared_bed_capacity integer DEFAULT 0,
ADD COLUMN single_bed_capacity integer DEFAULT 0;

-- Migrate existing max_students_capacity data to single_bed_capacity (as default)
UPDATE public.profiles 
SET single_bed_capacity = COALESCE(max_students_capacity, 0)
WHERE max_students_capacity IS NOT NULL AND max_students_capacity > 0;