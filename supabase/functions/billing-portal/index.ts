import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BILLING_DISABLED = Deno.env.get('BILLING_DISABLED') === 'true';
const PAYMENT_PROVIDER = Deno.env.get('PAYMENT_PROVIDER') || 'mercadopago';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get user from request
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    console.log('[billing-portal] User:', user.id, 'Provider:', PAYMENT_PROVIDER);

    // If billing disabled or mock, return internal portal URL
    if (BILLING_DISABLED || PAYMENT_PROVIDER === 'mock') {
      const origin = req.headers.get('origin') || '';
      return new Response(JSON.stringify({
        ok: true,
        url: `${origin}/dashboard#subscription`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // For Stripe (future implementation)
    if (PAYMENT_PROVIDER === 'stripe') {
      // TODO: Implement Stripe portal when Stripe is configured
      throw new Error('Stripe portal not yet implemented');
    }

    // For MercadoPago, redirect to internal management page
    const origin = req.headers.get('origin') || '';
    return new Response(JSON.stringify({
      ok: true,
      url: `${origin}/dashboard#subscription`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('[billing-portal] Error:', error);
    
    return new Response(JSON.stringify({ 
      ok: false,
      message: error.message || 'Error al acceder al portal'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
