-- Create verification requests table
CREATE TABLE public.verification_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    profession TEXT NOT NULL,
    license_number TEXT,
    years_experience INTEGER,
    education TEXT,
    certifications TEXT[],
    document_urls TEXT[],
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create professionals table to store verified status
CREATE TABLE public.professionals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    profession TEXT NOT NULL,
    location TEXT,
    description TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verification_date TIMESTAMP WITH TIME ZONE,
    rating DECIMAL(2,1) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    availability TEXT DEFAULT 'available',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

-- Create policies for verification_requests
CREATE POLICY "Users can view their own verification requests" 
ON public.verification_requests 
FOR SELECT 
USING (professional_id = auth.uid());

CREATE POLICY "Users can create their own verification requests" 
ON public.verification_requests 
FOR INSERT 
WITH CHECK (professional_id = auth.uid());

CREATE POLICY "Users can update their pending verification requests" 
ON public.verification_requests 
FOR UPDATE 
USING (professional_id = auth.uid() AND status = 'pending');

-- Create policies for professionals
CREATE POLICY "Professionals are viewable by everyone" 
ON public.professionals 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own professional profile" 
ON public.professionals 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own professional profile" 
ON public.professionals 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_verification_requests_updated_at
    BEFORE UPDATE ON public.verification_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_professionals_updated_at
    BEFORE UPDATE ON public.professionals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public) VALUES ('verification-docs', 'verification-docs', false);

-- Create storage policies for verification documents
CREATE POLICY "Users can upload their own verification documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'verification-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own verification documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'verification-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Admins can view all verification documents (we'll handle admin roles later)
CREATE POLICY "Admins can view all verification documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'verification-docs');