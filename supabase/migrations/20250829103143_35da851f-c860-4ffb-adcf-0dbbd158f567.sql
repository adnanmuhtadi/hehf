-- Fix search path security warnings for all functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.email),
    COALESCE((new.raw_user_meta_data ->> 'role')::user_role, 'host')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_host_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    rating = (
      SELECT AVG(rating)::DECIMAL(3,2) 
      FROM public.host_ratings 
      WHERE host_id = NEW.host_id
    ),
    rating_count = (
      SELECT COUNT(*) 
      FROM public.host_ratings 
      WHERE host_id = NEW.host_id
    )
  WHERE user_id = NEW.host_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;