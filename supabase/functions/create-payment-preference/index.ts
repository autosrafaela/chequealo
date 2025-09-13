import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentPreferenceRequest {
  subscriptionId: string;
  returnUrl?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
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

    const { subscriptionId, returnUrl }: PaymentPreferenceRequest = await req.json();

    // Get subscription details
    const { data: subscription, error: subError } = await supabaseClient
      .from('subscriptions')
      .select(`
        *,
        subscription_plans!inner(*),
        professionals!inner(full_name, email)
      `)
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .single();

    if (subError || !subscription) {
      throw new Error('Subscription not found');
    }

    // Create MercadoPago preference
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!accessToken) {
      throw new Error('MercadoPago access token not configured');
    }

    const preference = {
      items: [
        {
          title: `Suscripción ${subscription.subscription_plans.name}`,
          description: `Suscripción mensual para ${subscription.professionals.full_name}`,
          quantity: 1,
          currency_id: subscription.subscription_plans.currency,
          unit_price: parseFloat(subscription.subscription_plans.price)
        }
      ],
      payer: {
        name: subscription.professionals.full_name,
        email: subscription.professionals.email
      },
      back_urls: {
        success: returnUrl || `${req.headers.get('origin')}/dashboard?payment=success`,
        failure: returnUrl || `${req.headers.get('origin')}/dashboard?payment=failure`,
        pending: returnUrl || `${req.headers.get('origin')}/dashboard?payment=pending`
      },
      auto_return: "approved",
      external_reference: subscriptionId,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook`,
      expires: false,
      date_of_expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    console.log('Creating MercadoPago preference:', preference);

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
      console.error('MercadoPago API error:', errorText);
      throw new Error(`MercadoPago API error: ${mpResponse.status}`);
    }

    const mpData = await mpResponse.json();
    console.log('MercadoPago preference created:', mpData);

    // Store payment record
    const { error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        subscription_id: subscriptionId,
        user_id: user.id,
        amount: subscription.subscription_plans.price,
        currency: subscription.subscription_plans.currency,
        status: 'pending',
        mercadopago_preference_id: mpData.id
      });

    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
    }

    return new Response(JSON.stringify({
      preferenceId: mpData.id,
      initPoint: mpData.init_point,
      sandboxInitPoint: mpData.sandbox_init_point
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error creating payment preference:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});