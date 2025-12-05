-- Enable pg_net extension if not exists
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Remove existing cron job if exists
SELECT cron.unschedule('calculate-weekly-rankings') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'calculate-weekly-rankings'
);

-- Schedule weekly rankings calculation every Monday at 6:00 AM UTC
SELECT cron.schedule(
  'calculate-weekly-rankings',
  '0 6 * * 1',
  $$
  SELECT
    net.http_post(
        url:='https://rolitmcxydholgsxpvwa.supabase.co/functions/v1/calculate-weekly-rankings',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvbGl0bWN4eWRob2xnc3hwdndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NDk0MzIsImV4cCI6MjA3MzIyNTQzMn0.A8lUa6pBn1aW_b9n_9BXFmH19fiKcQioG1bfzObZWsQ"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);