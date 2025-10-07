-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  price numeric NOT NULL,
  currency text NOT NULL DEFAULT 'ARS',
  billing_interval text NOT NULL DEFAULT 'monthly',
  grace_period_days integer NOT NULL DEFAULT 90,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert default plan for professionals
INSERT INTO public.subscription_plans (name, price, currency, billing_interval, grace_period_days)
VALUES ('Profesional Mensual', 15000, 'ARS', 'monthly', 90);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  professional_id uuid NOT NULL,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  status text NOT NULL DEFAULT 'trial',
  trial_start_date timestamp with time zone NOT NULL DEFAULT now(),
  trial_end_date timestamp with time zone NOT NULL DEFAULT (now() + interval '90 days'),
  payment_reminder_sent boolean NOT NULL DEFAULT false,
  payment_data_required_date timestamp with time zone NOT NULL DEFAULT (now() + interval '75 days'),
  next_billing_date timestamp with time zone,
  mercadopago_subscription_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create payment methods table
CREATE TABLE public.payment_methods (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  mercadopago_payment_method_id text,
  card_last_four text,
  card_brand text,
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id),
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'ARS',
  status text NOT NULL DEFAULT 'pending',
  mercadopago_payment_id text,
  mercadopago_preference_id text,
  payment_date timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (readable by all)
CREATE POLICY "Subscription plans are viewable by everyone"
ON public.subscription_plans
FOR SELECT
USING (true);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions"
ON public.subscriptions
FOR SELECT
USING (user_id = auth.uid() OR professional_id IN (
  SELECT id FROM public.professionals WHERE user_id = auth.uid()
));

CREATE POLICY "Professionals can create their own subscription"
ON public.subscriptions
FOR INSERT
WITH CHECK (professional_id IN (
  SELECT id FROM public.professionals WHERE user_id = auth.uid()
) AND user_id = auth.uid());

CREATE POLICY "Users can update their own subscriptions"
ON public.subscriptions
FOR UPDATE
USING (user_id = auth.uid() OR professional_id IN (
  SELECT id FROM public.professionals WHERE user_id = auth.uid()
));

-- RLS Policies for payment_methods
CREATE POLICY "Users can view their own payment methods"
ON public.payment_methods
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own payment methods"
ON public.payment_methods
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own payment methods"
ON public.payment_methods
FOR UPDATE
USING (user_id = auth.uid());

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments"
ON public.payments
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own payments"
ON public.payments
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Create function to auto-create subscription when professional profile is created
CREATE OR REPLACE FUNCTION public.create_professional_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_plan_id uuid;
BEGIN
  -- Get the default plan ID
  SELECT id INTO default_plan_id 
  FROM public.subscription_plans 
  WHERE name = 'Profesional Mensual' 
  LIMIT 1;
  
  -- Create subscription for the new professional
  IF default_plan_id IS NOT NULL THEN
    INSERT INTO public.subscriptions (
      user_id,
      professional_id,
      plan_id,
      status,
      trial_start_date,
      trial_end_date,
      payment_data_required_date
    )
    VALUES (
      NEW.user_id,
      NEW.id,
      default_plan_id,
      'trial',
      now(),
      now() + interval '90 days',
      now() + interval '75 days'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create subscription when professional is created
CREATE TRIGGER create_subscription_on_professional_insert
  AFTER INSERT ON public.professionals
  FOR EACH ROW
  EXECUTE FUNCTION public.create_professional_subscription();

-- Create function to check subscription status
CREATE OR REPLACE FUNCTION public.check_subscription_status(professional_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  subscription_status text;
  trial_end_date timestamp with time zone;
BEGIN
  SELECT s.status, s.trial_end_date 
  INTO subscription_status, trial_end_date
  FROM public.subscriptions s
  JOIN public.professionals p ON s.professional_id = p.id
  WHERE p.user_id = professional_user_id
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  -- If no subscription found, return 'none'
  IF subscription_status IS NULL THEN
    RETURN 'none';
  END IF;
  
  -- Check if trial has expired
  IF subscription_status = 'trial' AND now() > trial_end_date THEN
    RETURN 'expired';
  END IF;
  
  RETURN subscription_status;
END;
$$;

-- Add updated_at trigger for all tables
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();