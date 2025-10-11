import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// SECURITY: Input validation schema for returnUrl (optional)
const portalRequestSchema = z.object({
  returnUrl: z.string()
    .url({ message: 'Invalid returnUrl format - must be a valid URL' })
    .max(2048, { message: 'returnUrl exceeds maximum length' })
    .optional()
    .refine(
      (url) => {
        if (!url) return true;
        // Whitelist allowed domains
        const allowedDomains = [
          'chequealo.lovable.app',
          'chequealo.ar',
          'www.chequealo.ar',
          'localhost',
          '127.0.0.1'
        ];
        try {
          const urlObj = new URL(url);
          return allowedDomains.some(domain => 
            urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
          );
        } catch {
          return false;
        }
      },
      { message: 'returnUrl domain not allowed' }
    )
}).optional();

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

    // SECURITY: Validate request body if present (optional for this endpoint)
    let validatedData: { returnUrl?: string } = {};
    try {
      const rawBody = await req.text();
      if (rawBody && rawBody.length > 0) {
        const jsonBody = JSON.parse(rawBody);
        const validationResult = portalRequestSchema.safeParse(jsonBody);
        
        if (!validationResult.success) {
          console.error('[billing-portal] Validation failed:', validationResult.error.errors);
          return new Response(JSON.stringify({
            ok: false,
            message: 'Invalid request parameters',
            errors: validationResult.error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message
            }))
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }
        
        validatedData = validationResult.data || {};
      }
    } catch (parseError) {
      // Body is optional for this endpoint, so ignore parse errors
      console.log('[billing-portal] No body or invalid JSON - continuing without parameters');
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
