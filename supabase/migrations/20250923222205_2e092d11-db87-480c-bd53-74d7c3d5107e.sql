-- Fix security issue: Restrict contact_requests access to authenticated users only
-- Drop existing policies
DROP POLICY IF EXISTS "Professionals can view their requests" ON public.contact_requests;
DROP POLICY IF EXISTS "Users can view their own requests" ON public.contact_requests;
DROP POLICY IF EXISTS "Professionals can update their requests status" ON public.contact_requests;
DROP POLICY IF EXISTS "Users can create contact requests" ON public.contact_requests;

-- Create new secure policies that only allow authenticated users
CREATE POLICY "Professionals can view their requests"
ON public.contact_requests
FOR SELECT
TO authenticated
USING (
  professional_id IN (
    SELECT id FROM public.professionals 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own requests"
ON public.contact_requests
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Professionals can update their requests status"
ON public.contact_requests
FOR UPDATE
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

CREATE POLICY "Users can create contact requests"
ON public.contact_requests
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Fix other tables with similar issues
-- Fix payment_methods table
DROP POLICY IF EXISTS "Users can view their own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can update their own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can create their own payment methods" ON public.payment_methods;

CREATE POLICY "Users can view their own payment methods"
ON public.payment_methods
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own payment methods"
ON public.payment_methods
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can create their own payment methods"
ON public.payment_methods
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Fix favorites table
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can add their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can remove their own favorites" ON public.favorites;

CREATE POLICY "Users can view their own favorites"
ON public.favorites
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can add their own favorites"
ON public.favorites
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their own favorites"
ON public.favorites
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Fix notifications table
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Fix payments table
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create their own payments" ON public.payments;

CREATE POLICY "Users can view their own payments"
ON public.payments
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own payments"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Fix verification_requests table
DROP POLICY IF EXISTS "Users can view their own verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Users can create their own verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Users can update their pending verification requests" ON public.verification_requests;

CREATE POLICY "Users can view their own verification requests"
ON public.verification_requests
FOR SELECT
TO authenticated
USING (
  professional_id IN (
    SELECT id FROM public.professionals 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own verification requests"
ON public.verification_requests
FOR INSERT
TO authenticated
WITH CHECK (
  professional_id IN (
    SELECT id FROM public.professionals 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their pending verification requests"
ON public.verification_requests
FOR UPDATE
TO authenticated
USING (
  professional_id IN (
    SELECT id FROM public.professionals 
    WHERE user_id = auth.uid()
  ) AND status = 'pending'
)
WITH CHECK (
  professional_id IN (
    SELECT id FROM public.professionals 
    WHERE user_id = auth.uid()
  ) AND status = 'pending'
);