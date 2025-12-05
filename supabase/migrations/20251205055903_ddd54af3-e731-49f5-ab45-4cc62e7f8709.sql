-- Create agenda_slots table for public availability blocks
CREATE TABLE public.agenda_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  block_type TEXT NOT NULL CHECK (block_type IN ('morning', 'afternoon', 'evening')),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'hold', 'booked')),
  hold_expires_at TIMESTAMP WITH TIME ZONE,
  hold_by_user_id UUID,
  booked_by_user_id UUID,
  booked_by_name TEXT,
  booked_by_email TEXT,
  booked_by_phone TEXT,
  booking_notes TEXT,
  deposit_amount NUMERIC DEFAULT 0,
  deposit_paid BOOLEAN DEFAULT false,
  mercadopago_preference_id TEXT,
  mercadopago_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professional_id, slot_date, block_type)
);

-- Enable RLS
ALTER TABLE public.agenda_slots ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Agenda slots are viewable by everyone"
  ON public.agenda_slots
  FOR SELECT
  USING (true);

CREATE POLICY "Professionals can manage their own slots"
  ON public.agenda_slots
  FOR ALL
  USING (professional_id IN (
    SELECT id FROM professionals WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update slots they hold or book"
  ON public.agenda_slots
  FOR UPDATE
  USING (
    hold_by_user_id = auth.uid() OR 
    booked_by_user_id = auth.uid()
  );

CREATE POLICY "Authenticated users can insert bookings"
  ON public.agenda_slots
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Indexes
CREATE INDEX idx_agenda_slots_professional_date ON public.agenda_slots(professional_id, slot_date);
CREATE INDEX idx_agenda_slots_status ON public.agenda_slots(status) WHERE status != 'available';
CREATE INDEX idx_agenda_slots_hold_expires ON public.agenda_slots(hold_expires_at) WHERE status = 'hold';

-- Trigger for updated_at
CREATE TRIGGER update_agenda_slots_updated_at
  BEFORE UPDATE ON public.agenda_slots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to release expired holds
CREATE OR REPLACE FUNCTION public.release_expired_agenda_holds()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.agenda_slots
  SET 
    status = 'available',
    hold_by_user_id = NULL,
    hold_expires_at = NULL,
    updated_at = now()
  WHERE status = 'hold' 
    AND hold_expires_at < now();
END;
$$;