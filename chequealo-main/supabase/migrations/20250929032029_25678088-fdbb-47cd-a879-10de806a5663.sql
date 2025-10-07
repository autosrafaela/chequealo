-- Vamos a arreglar las policies recursivas
-- Primero eliminar las policies problemáticas y recrearlas correctamente

-- PROFESSIONALS TABLE - Fixing infinite recursion
DROP POLICY IF EXISTS "Contact info restricted access" ON public.professionals;
DROP POLICY IF EXISTS "Public professional info viewable by everyone" ON public.professionals;
DROP POLICY IF EXISTS "Users can view their own professional profile" ON public.professionals;
DROP POLICY IF EXISTS "Admins can view all professionals" ON public.professionals;

-- Crear nuevas policies sin recursión
CREATE POLICY "Public professionals viewable by all" 
ON public.professionals 
FOR SELECT 
USING (NOT is_blocked);

CREATE POLICY "Users can view own professional profile" 
ON public.professionals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all professionals data" 
ON public.professionals 
FOR SELECT 
USING (
  ((auth.jwt() ->> 'email'::text) = 'autosrafaela@gmail.com'::text) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- CONTACT REQUESTS - Fix recursion
DROP POLICY IF EXISTS "Professionals can view their requests" ON public.contact_requests;
DROP POLICY IF EXISTS "Professionals can update their requests status" ON public.contact_requests;

-- Crear policies sin recursión usando joins directos
CREATE POLICY "Professionals view own requests" 
ON public.contact_requests 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.professionals p 
    WHERE p.id = contact_requests.professional_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Professionals update own requests" 
ON public.contact_requests 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.professionals p 
    WHERE p.id = contact_requests.professional_id 
    AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.professionals p 
    WHERE p.id = contact_requests.professional_id 
    AND p.user_id = auth.uid()
  )
);