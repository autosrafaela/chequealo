-- Add confirmation fields to transactions table
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS user_confirmed_completion BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS professional_confirmed_completion BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS confirmation_requested_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS both_confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS user_confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS professional_confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_transactions_confirmation_requested 
ON public.transactions(confirmation_requested_at) 
WHERE confirmation_requested_at IS NOT NULL;

-- Add index for status queries
CREATE INDEX IF NOT EXISTS idx_transactions_status_started 
ON public.transactions(status, started_at) 
WHERE status = 'in_progress';

-- Add comments
COMMENT ON COLUMN public.transactions.user_confirmed_completion IS 'Usuario confirma que el trabajo fue completado';
COMMENT ON COLUMN public.transactions.professional_confirmed_completion IS 'Profesional confirma que el trabajo fue completado';
COMMENT ON COLUMN public.transactions.confirmation_requested_at IS 'Fecha en que se solicitó la confirmación a ambas partes';
COMMENT ON COLUMN public.transactions.both_confirmed_at IS 'Fecha en que ambas partes confirmaron (match)';
COMMENT ON COLUMN public.transactions.user_confirmed_at IS 'Fecha de confirmación del usuario';
COMMENT ON COLUMN public.transactions.professional_confirmed_at IS 'Fecha de confirmación del profesional';