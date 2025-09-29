-- Add reminder_sent column to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;