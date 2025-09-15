-- Fix security definer view warning
ALTER VIEW public.professionals_public SET (security_invoker = on);