-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the review reminder function to run daily at 10:00 AM
SELECT cron.schedule(
  'daily-review-reminders',
  '0 10 * * *', -- Every day at 10:00 AM
  $$
  SELECT
    net.http_post(
        url:='https://rolitmcxydholgsxpvwa.supabase.co/functions/v1/send-review-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvbGl0bWN4eWRob2xnc3hwdndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NDk0MzIsImV4cCI6MjA3MzIyNTQzMn0.A8lUa6pBn1aW_b9n_9BXFmH19fiKcQioG1bfzObZWsQ"}'::jsonb,
        body:='{"source": "cron"}'::jsonb
    ) as request_id;
  $$
);