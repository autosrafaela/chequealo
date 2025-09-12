-- Create table for transactions/jobs to track completed work
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id uuid NOT NULL,
  user_id uuid NOT NULL,
  contact_request_id uuid,
  service_type text,
  amount decimal(10,2),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for user ratings (professionals rating clients)
CREATE TABLE public.user_ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id uuid NOT NULL,
  user_id uuid NOT NULL,
  transaction_id uuid NOT NULL,
  communication_rating integer NOT NULL CHECK (communication_rating >= 1 AND communication_rating <= 5),
  punctuality_rating integer NOT NULL CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  payment_rating integer NOT NULL CHECK (payment_rating >= 1 AND payment_rating <= 5),
  overall_rating integer NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(professional_id, user_id, transaction_id)
);

-- Add verification token to reviews for completed transactions only
ALTER TABLE public.reviews ADD COLUMN transaction_id uuid;
ALTER TABLE public.reviews ADD COLUMN verification_token text;
ALTER TABLE public.reviews ADD COLUMN is_transaction_verified boolean NOT NULL DEFAULT false;

-- Enable RLS on new tables
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;

-- Policies for transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (user_id = auth.uid() OR professional_id IN (
  SELECT id FROM professionals WHERE user_id = auth.uid()
));

CREATE POLICY "Professionals can update their transactions" 
ON public.transactions 
FOR UPDATE 
USING (professional_id IN (
  SELECT id FROM professionals WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Policies for user_ratings
CREATE POLICY "Professionals can create user ratings" 
ON public.user_ratings 
FOR INSERT 
WITH CHECK (professional_id IN (
  SELECT id FROM professionals WHERE user_id = auth.uid()
));

CREATE POLICY "Professionals can view ratings they created" 
ON public.user_ratings 
FOR SELECT 
USING (professional_id IN (
  SELECT id FROM professionals WHERE user_id = auth.uid()
));

CREATE POLICY "Users can view their ratings" 
ON public.user_ratings 
FOR SELECT 
USING (user_id = auth.uid());

-- Add triggers for updated_at columns
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_ratings_updated_at
  BEFORE UPDATE ON public.user_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate user overall rating
CREATE OR REPLACE FUNCTION public.update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- This would update a user_stats table when implemented
  -- For now, just return the trigger result
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for user rating updates
CREATE TRIGGER update_user_rating_on_change
  AFTER INSERT OR UPDATE OR DELETE ON public.user_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_rating();