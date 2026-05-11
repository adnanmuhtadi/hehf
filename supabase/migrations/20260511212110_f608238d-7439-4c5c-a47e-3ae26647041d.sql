CREATE TABLE public.email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NULL,
  recipient_email text NOT NULL,
  email_type text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL CHECK (status IN ('sent','failed')),
  error_message text NULL,
  sent_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_logs_booking_id ON public.email_logs(booking_id);
CREATE INDEX idx_email_logs_sent_at ON public.email_logs(sent_at DESC);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email logs"
  ON public.email_logs
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));