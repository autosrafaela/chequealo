-- Fix infinite recursion in professionals table policies
-- The issue is that the public viewing policy creates a circular reference with contact_requests

-- First, drop the problematic policy
DROP POLICY IF EXISTS "Professionals public data viewable by all" ON public.professionals;

-- Create a simpler policy for public viewing that doesn't cause recursion
-- This policy allows anyone to view non-blocked professionals without checking contact_requests
CREATE POLICY "Public can view active professionals"
ON public.professionals
FOR SELECT
USING (
  NOT is_blocked
);

-- Keep the admin and owner policies as they are safe
-- Admin policy already exists: "Admins can view all professionals data"
-- Owner policy already exists: "Users can view own professional profile"

-- Ensure the professionals_public_safe view has proper access
GRANT SELECT ON public.professionals_public_safe TO anon, authenticated;
GRANT SELECT ON public.professionals_public TO anon, authenticated;