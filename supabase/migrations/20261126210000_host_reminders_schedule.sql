-- Runs the send-host-reminders function every morning at 08:00 UTC
-- (8am in winter, 9am in summer UK time).
-- Uses the public (anon) key, the same one the website uses. The function
-- never sends the same reminder twice, so calling it more often is harmless.
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule('send-host-reminders')
where exists (select 1 from cron.job where jobname = 'send-host-reminders');

select cron.schedule(
  'send-host-reminders',
  '0 8 * * *',
  $$
  select net.http_post(
    url := 'https://rivswwdjhwgnnqqlysjh.supabase.co/functions/v1/send-host-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpdnN3d2RqaHdnbm5xcWx5c2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjE2NTUsImV4cCI6MjA3MjAzNzY1NX0.TrPdyxPz8Ezb3FJQeKSZO_A8seP2sW86am352f3bLVA'
    ),
    body := '{}'::jsonb
  );
  $$
);
