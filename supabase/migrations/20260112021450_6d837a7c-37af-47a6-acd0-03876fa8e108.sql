-- Add rate per student per night and max students capacity to profiles
ALTER TABLE public.profiles
ADD COLUMN rate_per_student_per_night DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN max_students_capacity INTEGER DEFAULT 0;