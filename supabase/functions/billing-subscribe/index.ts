import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Config from environment or defaults
const BILLING_DISABLED = Deno.env.get('BILLING_DISABLED') === 'true';
const PAYMENT_PROVIDER = Deno.env.get('PAYMENT_PROVIDER') || 'mercadopago';
const TRIAL_DAYS = parseInt(Deno.env.get('TRIAL_DAYS') || '90');

// SECURITY: Input validation schema
const subscribeRequestSchema = z.object({
  plan_id: z.string()
    .uuid({ message: 'Invalid plan_id format - must be a valid UUID' })
    .max(36, { message: 'plan_id exceeds maximum length' }),
  return_url: z.string()
    .url({ message: 'Invalid return_url format - must be a valid URL' })
    .max(2048, { message: 'return_url exceeds maximum length' })
    .optional()
    .refine(
      (url) => {
        if (!url) return true;
        // Whitelist allowed domains for return URLs
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
      { message: 'return_url domain not allowed' }
    )
});

type SubscribeRequest = z.infer<typeof subscribeRequestSchema>;

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

    // SECURITY: Validate and parse request body
    const rawBody = await req.json();
    const validationResult = subscribeRequestSchema.safeParse(rawBody);
    
    if (!validationResult.success) {
      console.error('[billing-subscribe] Validation failed:', validationResult.error.errors);
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

    const { plan_id, return_url } = validationResult.data;

    console.log('[billing-subscribe] User:', user.id, 'Plan:', plan_id);

    // Get professional profile
    const { data: professional, error: profError } = await supabaseClient
      .from('professionals')
      .select('id, full_name, email')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profError || !professional) {
      throw new Error('Professional profile not found');
    }

    // Get plan details
    const { data: plan, error: planError } = await supabaseClient
      .from('subscription_plans')
      .select('*')
      .eq('id', plan_id)
      .single();

    if (planError || !plan) {
      throw new Error('Plan not found');
    }

    // Check for existing subscription
    const { data: existingSub } = await supabaseClient
      .from('subscriptions')
      .select('id, status')
      .eq('professional_id', professional.id)
      .maybeSingle();

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + TRIAL_DAYS);

    const paymentRequiredDate = new Date();
    paymentRequiredDate.setDate(paymentRequiredDate.getDate() + (TRIAL_DAYS - 15));

    // If billing is disabled or provider is mock, create trial subscription
    if (BILLING_DISABLED || PAYMENT_PROVIDER === 'mock') {
      console.log('[billing-subscribe] Billing disabled or mock mode, creating trial subscription');

      if (existingSub) {
        // Update existing subscription
        const { error: updateError } = await supabaseClient
          .from('subscriptions')
          .update({
            plan_id: plan_id,
            selected_plan_id: plan_id,
            status: 'trialing',
            trial_end_date: trialEndDate.toISOString(),
            payment_data_required_date: paymentRequiredDate.toISOString()
          })
          .eq('id', existingSub.id);

        if (updateError) throw updateError;
      } else {
        // Create new subscription
        const { error: insertError } = await supabaseClient
          .from('subscriptions')
          .insert({
            user_id: user.id,
            professional_id: professional.id,
            plan_id: plan_id,
            selected_plan_id: plan_id,
            status: 'trialing',
            trial_start_date: new Date().toISOString(),
            trial_end_date: trialEndDate.toISOString(),
            payment_data_required_date: paymentRequiredDate.toISOString()
          });

        if (insertError) throw insertError;
      }

      return new Response(JSON.stringify({
        ok: true,
        mode: 'trial',
        message: 'Prueba iniciada correctamente',
        trial_days: TRIAL_DAYS
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Real payment provider (MercadoPago)
    if (PAYMENT_PROVIDER === 'mercadopago') {
      const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
      if (!accessToken) {
        throw new Error('MercadoPago access token not configured');
      }

      // Create or update subscription record
      let subscriptionId = existingSub?.id;
      
      if (!subscriptionId) {
        const { data: newSub, error: subError } = await supabaseClient
          .from('subscriptions')
          .insert({
            user_id: user.id,
            professional_id: professional.id,
            plan_id: plan_id,
            selected_plan_id: plan_id,
            status: 'trialing',
            trial_start_date: new Date().toISOString(),
            trial_end_date: trialEndDate.toISOString(),
            payment_data_required_date: paymentRequiredDate.toISOString()
          })
          .select()
          .single();

        if (subError) throw subError;
        subscriptionId = newSub.id;
      } else {
        await supabaseClient
          .from('subscriptions')
          .update({ selected_plan_id: plan_id })
          .eq('id', subscriptionId);
      }

      // Create MercadoPago preference
      const preference = {
        items: [{
          title: `Suscripción ${plan.name}`,
          description: `Suscripción mensual para ${professional.full_name}`,
          quantity: 1,
          currency_id: plan.currency,
          unit_price: parseFloat(plan.price)
        }],
        payer: {
          name: professional.full_name,
          email: professional.email
        },
        back_urls: {
          success: return_url || `${req.headers.get('origin')}/dashboard?payment=success`,
          failure: return_url || `${req.headers.get('origin')}/dashboard?payment=failure`,
          pending: return_url || `${req.headers.get('origin')}/dashboard?payment=pending`
        },
        auto_return: "approved",
        external_reference: subscriptionId,
        notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook`
      };

      const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preference)
      });

      if (!mpResponse.ok) {
        const errorText = await mpResponse.text();
        console.error('[billing-subscribe] MercadoPago error:', errorText);
        throw new Error('Error al crear preferencia de pago');
      }

      const mpData = await mpResponse.json();

      return new Response(JSON.stringify({
        ok: true,
        checkout_url: mpData.init_point,
        init_point: mpData.init_point
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    throw new Error('Payment provider not supported');

  } catch (error: any) {
    console.error('[billing-subscribe] Error:', error);
    
    return new Response(JSON.stringify({ 
      ok: false,
      message: error.message || 'Error al procesar suscripción'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
