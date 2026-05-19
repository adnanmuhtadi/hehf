CREATE TYPE public.preferred_gender AS ENUM ('boys', 'girls', 'either');

ALTER TABLE public.profiles
  ADD COLUMN preferred_gender public.preferred_gender NOT NULL DEFAULT 'either';