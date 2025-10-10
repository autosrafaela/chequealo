-- ============================================================================
-- SECURITY FIX #1: Hide Professional Contact Information
-- ============================================================================

-- Create a safe public view that excludes sensitive professional data
CREATE OR REPLACE VIEW professionals_public_safe AS
SELECT 
  id,
  user_id,
  full_name,
  profession,
  location,
  description,
  image_url,
  rating,
  review_count,
  availability,
  is_verified,
  verification_date,
  created_at,
  updated_at
  -- Explicitly EXCLUDED: email, phone, dni, latitude, longitude
FROM professionals
WHERE is_blocked = false;

-- Grant SELECT on the view to authenticated and anon users
GRANT SELECT ON professionals_public_safe TO authenticated, anon;

-- ============================================================================
-- SECURITY FIX #4: Protect Contact Access Logs
-- ============================================================================

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Admin can view contact access logs" ON contact_access_logs;

-- Only admins can view logs
CREATE POLICY "Admin can view contact access logs"
ON contact_access_logs
FOR SELECT
USING (
  (auth.jwt()->>'email' = 'autosrafaela@gmail.com') OR 
  has_role(auth.uid(), 'admin')
);

-- Prevent any direct INSERT/UPDATE/DELETE - only through log_contact_access()
CREATE POLICY "No direct insert on contact_access_logs"
ON contact_access_logs
FOR INSERT
WITH CHECK (false);

CREATE POLICY "No direct update on contact_access_logs"
ON contact_access_logs
FOR UPDATE
USING (false);

CREATE POLICY "No direct delete on contact_access_logs"
ON contact_access_logs
FOR DELETE
USING (false);

-- ============================================================================
-- SECURITY FIX #5: Create Safe Bookings View
-- ============================================================================

-- Create a view that masks sensitive client data for listing purposes
CREATE OR REPLACE VIEW bookings_public AS
SELECT 
  id,
  professional_id,
  user_id,
  service_id,
  booking_date,
  duration_minutes,
  status,
  total_amount,
  currency,
  created_at,
  updated_at,
  -- Mask sensitive client data
  LEFT(client_name, 1) || '***' as client_name_masked,
  LEFT(client_email, 3) || '***@***' as client_email_masked,
  'XXX-XXX-' || RIGHT(COALESCE(client_phone, 'XXXX'), 4) as client_phone_masked
  -- Explicitly EXCLUDED from public view: client_name, client_email, client_phone, notes
FROM bookings;

-- Grant SELECT on the view
GRANT SELECT ON bookings_public TO authenticated;

-- ============================================================================
-- SECURITY ENHANCEMENT: Add IP logging to contact_access_logs
-- ============================================================================

-- Add IP address column for security monitoring
ALTER TABLE contact_access_logs 
ADD COLUMN IF NOT EXISTS ip_address inet,
ADD COLUMN IF NOT EXISTS user_agent text,
ADD COLUMN IF NOT EXISTS action_result text DEFAULT 'success';

-- Create index for faster security audits
CREATE INDEX IF NOT EXISTS idx_contact_access_logs_accessed_by 
ON contact_access_logs(accessed_by, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_access_logs_professional 
ON contact_access_logs(professional_id, created_at DESC);

COMMENT ON VIEW professionals_public_safe IS 'Safe public view of professionals excluding sensitive contact information (email, phone, DNI, coordinates)';
COMMENT ON VIEW bookings_public IS 'Public view of bookings with masked client information for privacy protection';
COMMENT ON COLUMN contact_access_logs.ip_address IS 'IP address of the user accessing professional contact information';
COMMENT ON COLUMN contact_access_logs.action_result IS 'Result of the access attempt: success, blocked, rate_limited';