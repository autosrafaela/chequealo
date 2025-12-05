-- Add banking information fields to professionals table
ALTER TABLE public.professionals 
ADD COLUMN IF NOT EXISTS cbu_cvu text,
ADD COLUMN IF NOT EXISTS bank_holder_name text;

-- Add comment for clarity
COMMENT ON COLUMN public.professionals.cbu_cvu IS 'CBU or CVU for bank transfers (22 digits)';
COMMENT ON COLUMN public.professionals.bank_holder_name IS 'Account holder name for verification';

-- Create combo_reservations table to track combo bookings and pending payouts
CREATE TABLE IF NOT EXISTS public.combo_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  combo_id uuid REFERENCES public.combos(id) ON DELETE SET NULL,
  professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_name text NOT NULL,
  user_email text NOT NULL,
  user_phone text,
  combo_title text NOT NULL,
  deposit_amount numeric NOT NULL,
  total_price numeric NOT NULL,
  mercadopago_payment_id text,
  mercadopago_preference_id text,
  payment_status text NOT NULL DEFAULT 'pending',
  payout_status text NOT NULL DEFAULT 'pending',
  payout_date timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.combo_reservations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Professionals can view their reservations"
ON public.combo_reservations FOR SELECT
USING (professional_id IN (
  SELECT id FROM public.professionals WHERE user_id = auth.uid()
));

CREATE POLICY "Users can view their own reservations"
ON public.combo_reservations FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all reservations"
ON public.combo_reservations FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert reservations"
ON public.combo_reservations FOR INSERT
WITH CHECK (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_combo_reservations_professional ON public.combo_reservations(professional_id);
CREATE INDEX IF NOT EXISTS idx_combo_reservations_payment_status ON public.combo_reservations(payment_status);
CREATE INDEX IF NOT EXISTS idx_combo_reservations_payout_status ON public.combo_reservations(payout_status);

-- Trigger for updated_at
CREATE TRIGGER update_combo_reservations_updated_at
BEFORE UPDATE ON public.combo_reservations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();