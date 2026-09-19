REVOKE EXECUTE ON FUNCTION public.log_booking_host_change() FROM anon, authenticated;

CREATE POLICY "Admins can add audit entries"
ON public.booking_host_audit FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));