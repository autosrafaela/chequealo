-- Create bookings table for reservation system
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  service_id UUID REFERENCES public.professional_services(id),
  booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  notes TEXT,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  total_amount NUMERIC,
  currency TEXT DEFAULT 'ARS',
  booking_reference TEXT UNIQUE DEFAULT CONCAT('BK-', EXTRACT(EPOCH FROM now())::INTEGER),
  cancellation_reason TEXT,
  rescheduled_from UUID REFERENCES public.bookings(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create availability slots table
CREATE TABLE public.availability_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  slot_duration_minutes INTEGER NOT NULL DEFAULT 60,
  max_bookings_per_slot INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table for real-time chat
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'professional')),
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  content TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  contact_request_id UUID REFERENCES public.contact_requests(id),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_message_preview TEXT,
  unread_count_user INTEGER DEFAULT 0,
  unread_count_professional INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professional_id, user_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bookings
CREATE POLICY "Professionals can manage their bookings" ON public.bookings
  FOR ALL USING (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can cancel their bookings" ON public.bookings
  FOR UPDATE USING (user_id = auth.uid()) 
  WITH CHECK (user_id = auth.uid() AND status IN ('cancelled'));

-- RLS Policies for availability slots
CREATE POLICY "Anyone can view availability slots" ON public.availability_slots
  FOR SELECT USING (true);

CREATE POLICY "Professionals can manage their availability" ON public.availability_slots
  FOR ALL USING (
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for conversations
CREATE POLICY "Users can view their conversations" ON public.conversations
  FOR SELECT USING (
    user_id = auth.uid() OR 
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR 
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can update conversations" ON public.conversations
  FOR UPDATE USING (
    user_id = auth.uid() OR 
    professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM public.conversations 
      WHERE user_id = auth.uid() OR 
      professional_id IN (
        SELECT id FROM public.professionals WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT id FROM public.conversations 
      WHERE user_id = auth.uid() OR 
      professional_id IN (
        SELECT id FROM public.professionals WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own messages" ON public.messages
  FOR UPDATE USING (sender_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_bookings_professional_date ON public.bookings(professional_id, booking_date);
CREATE INDEX idx_bookings_user ON public.bookings(user_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_availability_professional ON public.availability_slots(professional_id);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at);
CREATE INDEX idx_conversations_participants ON public.conversations(professional_id, user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_availability_slots_updated_at
  BEFORE UPDATE ON public.availability_slots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update conversation last message
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations 
  SET 
    last_message_at = NEW.created_at,
    last_message_preview = CASE 
      WHEN NEW.message_type = 'text' THEN LEFT(NEW.content, 100)
      WHEN NEW.message_type = 'image' THEN '📷 Imagen'
      WHEN NEW.message_type = 'file' THEN '📎 ' || COALESCE(NEW.file_name, 'Archivo')
      ELSE NEW.content
    END,
    unread_count_user = CASE 
      WHEN NEW.sender_type = 'professional' THEN unread_count_user + 1 
      ELSE unread_count_user 
    END,
    unread_count_professional = CASE 
      WHEN NEW.sender_type = 'user' THEN unread_count_professional + 1 
      ELSE unread_count_professional 
    END,
    updated_at = now()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update conversation on new message
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_last_message();

-- Add booking limits to subscription plans
UPDATE public.subscription_plans 
SET 
  features = features || '["Hasta 20 reservas/mes"]'::jsonb
WHERE name = 'Plan Básico';

UPDATE public.subscription_plans 
SET 
  features = features || '["Reservas ilimitadas", "Chat básico"]'::jsonb
WHERE name = 'Plan Profesional' OR name = 'Profesional Mensual';

UPDATE public.subscription_plans 
SET 
  features = features || '["Reservas ilimitadas", "Chat avanzado con archivos", "Integración calendario"]'::jsonb
WHERE name = 'Plan Premium';

-- Add booking and chat limits to plans
ALTER TABLE public.subscription_plans 
ADD COLUMN max_monthly_bookings INTEGER DEFAULT -1,
ADD COLUMN can_receive_messages BOOLEAN DEFAULT true,
ADD COLUMN can_send_files BOOLEAN DEFAULT false,
ADD COLUMN calendar_integration BOOLEAN DEFAULT false;

-- Update plan limits
UPDATE public.subscription_plans 
SET 
  max_monthly_bookings = 20,
  can_receive_messages = true,
  can_send_files = false,
  calendar_integration = false
WHERE name = 'Plan Básico';

UPDATE public.subscription_plans 
SET 
  max_monthly_bookings = -1,
  can_receive_messages = true,
  can_send_files = false,
  calendar_integration = false
WHERE name = 'Plan Profesional' OR name = 'Profesional Mensual';

UPDATE public.subscription_plans 
SET 
  max_monthly_bookings = -1,
  can_receive_messages = true,
  can_send_files = true,
  calendar_integration = true
WHERE name = 'Plan Premium';