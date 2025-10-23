-- Create a new view that includes contact information for public display
-- This is appropriate for a professional directory platform where professionals WANT to be contacted

CREATE OR REPLACE VIEW professionals_with_contact AS
SELECT 
  p.id,
  p.user_id,
  p.full_name,
  p.profession,
  p.location,
  p.description,
  p.image_url,
  p.rating,
  p.review_count,
  p.availability,
  p.is_verified,
  p.verification_date,
  p.created_at,
  p.updated_at,
  p.phone,
  p.email
FROM professionals p
WHERE p.is_blocked = false;

-- Grant access to this view for all authenticated users and anonymous users
GRANT SELECT ON professionals_with_contact TO authenticated, anon;