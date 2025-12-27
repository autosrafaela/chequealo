-- Create chat_quotes table for budget/quote system in chat
CREATE TABLE public.chat_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ARS',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_quotes ENABLE ROW LEVEL SECURITY;

-- Policies for chat_quotes
CREATE POLICY "Users can view quotes in their conversations"
ON public.chat_quotes
FOR SELECT
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.professionals 
    WHERE id = chat_quotes.professional_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Professionals can create quotes"
ON public.chat_quotes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.professionals 
    WHERE id = chat_quotes.professional_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update quote status (accept/reject)"
ON public.chat_quotes
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Add last_seen to profiles for online status
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT now();

-- Add phone to professionals for call button (if not exists)
-- Already exists in professionals table

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_quotes_conversation ON public.chat_quotes(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_quotes_status ON public.chat_quotes(status);

-- Trigger to update updated_at
CREATE TRIGGER update_chat_quotes_updated_at
BEFORE UPDATE ON public.chat_quotes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();