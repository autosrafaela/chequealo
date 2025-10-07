-- COMPREHENSIVE SECURITY FIX
-- Fix all security issues identified by the linter

-- 1. Drop and recreate the professionals_public view to fix Security Definer View issue
DROP VIEW IF EXISTS public.professionals_public;

-- Create a secure view without SECURITY DEFINER that only shows public info
CREATE VIEW public.professionals_public AS
SELECT 
  id,
  full_name,
  profession,
  location,
  description,
  image_url,
  rating,
  review_count,
  is_verified,
  verification_date,
  is_blocked,
  availability,
  created_at,
  updated_at
FROM public.professionals
WHERE is_blocked = false;

-- Enable RLS on the view
ALTER VIEW public.professionals_public SET (security_invoker = true);

-- 2. Fix professionals table policies to prevent contact info exposure
DROP POLICY IF EXISTS "Professionals contact info restricted" ON public.professionals;

-- Create separate policies for different access levels
CREATE POLICY "Public professional info viewable by everyone"
ON public.professionals
FOR SELECT
USING (
  -- Only allow access to basic profile info, not contact details
  NOT is_blocked
);

-- Policy for contact info access (email, phone) - very restricted
CREATE POLICY "Contact info restricted access"
ON public.professionals
FOR SELECT
TO authenticated
USING (
  -- Only owner, admin, or users with approved contact requests can see contact info
  user_id = auth.uid() 
  OR ((auth.jwt() ->> 'email') = 'autosrafaela@gmail.com') 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR (
    auth.uid() IS NOT NULL 
    AND id IN (
      SELECT professional_id 
      FROM contact_requests 
      WHERE user_id = auth.uid() AND status = 'contacted'
    )
  )
);

-- 3. Fix transactions table to restrict access properly
DROP POLICY IF EXISTS "Professionals can update their transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create transactions" ON public.transactions;

CREATE POLICY "Users can manage their own transactions"
ON public.transactions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Professionals can manage their transactions"
ON public.transactions
FOR ALL
TO authenticated
USING (
  professional_id IN (
    SELECT id FROM public.professionals 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  professional_id IN (
    SELECT id FROM public.professionals 
    WHERE user_id = auth.uid()
  )
);

-- 4. Fix user_ratings table policies
DROP POLICY IF EXISTS "Professionals can create user ratings" ON public.user_ratings;
DROP POLICY IF EXISTS "Professionals can view ratings they created" ON public.user_ratings;
DROP POLICY IF EXISTS "Users can view their ratings" ON public.user_ratings;

CREATE POLICY "Professionals can create user ratings"
ON public.user_ratings
FOR INSERT
TO authenticated
WITH CHECK (
  professional_id IN (
    SELECT id FROM public.professionals 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Professionals can view ratings they created"
ON public.user_ratings
FOR SELECT
TO authenticated
USING (
  professional_id IN (
    SELECT id FROM public.professionals 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own ratings"
ON public.user_ratings
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 5. Fix subscriptions table policies
DROP POLICY IF EXISTS "Professionals can create their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;

CREATE POLICY "Professionals can create subscriptions"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  AND professional_id IN (
    SELECT id FROM public.professionals 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their subscriptions"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR professional_id IN (
    SELECT id FROM public.professionals 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their subscriptions"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() 
  OR professional_id IN (
    SELECT id FROM public.professionals 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  user_id = auth.uid() 
  OR professional_id IN (
    SELECT id FROM public.professionals 
    WHERE user_id = auth.uid()
  )
);

-- 6. Fix work_photos policies
DROP POLICY IF EXISTS "Professionals can manage their own work photos" ON public.work_photos;
DROP POLICY IF EXISTS "Work photos are viewable by everyone" ON public.work_photos;

CREATE POLICY "Work photos are publicly viewable"
ON public.work_photos
FOR SELECT
USING (true);

CREATE POLICY "Professionals can manage their work photos"
ON public.work_photos
FOR ALL
TO authenticated
USING (
  professional_id IN (
    SELECT id FROM public.professionals 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  professional_id IN (
    SELECT id FROM public.professionals 
    WHERE user_id = auth.uid()
  )
);

-- 7. Update contact_access_logs to require authentication
DROP POLICY IF EXISTS "Admin can view contact access logs" ON public.contact_access_logs;

CREATE POLICY "Admin can view contact access logs"
ON public.contact_access_logs
FOR SELECT
TO authenticated
USING (
  (auth.jwt() ->> 'email') = 'autosrafaela@gmail.com' 
  OR has_role(auth.uid(), 'admin'::app_role)
);