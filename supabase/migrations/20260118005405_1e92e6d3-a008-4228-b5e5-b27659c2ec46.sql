-- Create table for host location bonuses
CREATE TABLE public.host_location_bonuses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  location text NOT NULL,
  bonus_per_night numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(host_id, location)
);

-- Enable RLS
ALTER TABLE public.host_location_bonuses ENABLE ROW LEVEL SECURITY;

-- Admins can manage all bonuses
CREATE POLICY "Admins can manage host location bonuses"
ON public.host_location_bonuses
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Hosts can view their own bonuses
CREATE POLICY "Hosts can view their own bonuses"
ON public.host_location_bonuses
FOR SELECT
USING (host_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_host_location_bonuses_updated_at
BEFORE UPDATE ON public.host_location_bonuses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();