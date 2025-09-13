import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const webhook = await req.json();
    console.log('MercadoPago webhook received:', webhook);

    // Handle payment notification
    if (webhook.type === 'payment') {
      const paymentId = webhook.data.id;
      
      // Get payment details from MercadoPago
      const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
      if (!accessToken) {
        throw new Error('MercadoPago access token not configured');
      }

      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!mpResponse.ok) {
        throw new Error(`Failed to get payment details: ${mpResponse.status}`);
      }

      const paymentData = await mpResponse.json();
      console.log('Payment data from MercadoPago:', paymentData);

      const subscriptionId = paymentData.external_reference;
      
      if (subscriptionId) {
        // Update payment record
        const { error: updateError } = await supabaseClient
          .from('payments')
          .update({
            status: paymentData.status === 'approved' ? 'completed' : paymentData.status,
            mercadopago_payment_id: paymentId,
            payment_date: paymentData.status === 'approved' ? new Date().toISOString() : null
          })
          .eq('subscription_id', subscriptionId)
          .eq('mercadopago_preference_id', paymentData.order?.id);

        if (updateError) {
          console.error('Error updating payment:', updateError);
        }

        // If payment is approved, update subscription status
        if (paymentData.status === 'approved') {
          const { error: subError } = await supabaseClient
            .from('subscriptions')
            .update({
              status: 'active',
              next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
            })
            .eq('id', subscriptionId);

          if (subError) {
            console.error('Error updating subscription:', subError);
          } else {
            console.log('Subscription activated:', subscriptionId);

            // Create success notification
            const { data: subscription } = await supabaseClient
              .from('subscriptions')
              .select('user_id')
              .eq('id', subscriptionId)
              .single();

            if (subscription) {
              await supabaseClient
                .from('notifications')
                .insert({
                  user_id: subscription.user_id,
                  title: '¡Pago procesado exitosamente!',
                  message: 'Tu suscripción mensual ha sido activada. Ya podés comenzar a recibir solicitudes.',
                  type: 'success'
                });
            }
          }
        } else if (paymentData.status === 'rejected') {
          // Create failure notification
          const { data: subscription } = await supabaseClient
            .from('subscriptions')
            .select('user_id')
            .eq('id', subscriptionId)
            .single();

          if (subscription) {
            await supabaseClient
              .from('notifications')
              .insert({
                user_id: subscription.user_id,
                title: 'Pago rechazado',
                message: 'Tu pago no pudo ser procesado. Por favor, intentá nuevamente con otra tarjeta.',
                type: 'error'
              });
          }
        }
      }
    }

    return new Response(JSON.stringify({ status: 'ok' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});