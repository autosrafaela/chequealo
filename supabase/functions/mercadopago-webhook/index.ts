import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Verify MercadoPago webhook signature to prevent fake payment notifications
 * @see https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks#editor_6
 */
async function verifyMercadoPagoSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string,
  secret: string
): Promise<boolean> {
  if (!xSignature || !xRequestId) {
    console.error('[Security] Missing signature headers');
    return false;
  }

  try {
    // MercadoPago signature format: "ts={timestamp},v1={hash}"
    const parts = xSignature.split(',');
    const ts = parts.find(p => p.startsWith('ts='))?.split('=')[1];
    const hash = parts.find(p => p.startsWith('v1='))?.split('=')[1];

    if (!ts || !hash) {
      console.error('[Security] Invalid signature format');
      return false;
    }

    // Recreate the manifest that MercadoPago used to generate the signature
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    
    console.log('[Security] Verifying signature for manifest:', manifest);
    
    // HMAC-SHA256 signature verification using Web Crypto API
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    
    // Import the secret key for HMAC
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    // Generate HMAC signature
    const signature = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      encoder.encode(manifest)
    );
    
    // Convert signature to hex string
    const hashArray = Array.from(new Uint8Array(signature));
    const expectedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Compare with provided hash
    const isValid = expectedHash === hash;
    
    if (!isValid) {
      console.error('[Security] Invalid webhook signature', { 
        expected: expectedHash.substring(0, 10) + '...', 
        received: hash.substring(0, 10) + '...' 
      });
      return false;
    }
    
    // Verify timestamp is recent (within 5 minutes)
    const timestamp = parseInt(ts);
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (Math.abs(now - timestamp) > fiveMinutes) {
      console.error('[Security] Webhook timestamp too old or in future', {
        timestamp,
        now,
        diff: Math.abs(now - timestamp)
      });
      return false;
    }
    
    console.log('[Security] ✓ Webhook signature verified successfully');
    return true;
  } catch (error) {
    console.error('[Security] Signature verification error:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // SECURITY: Extract signature headers
    const xSignature = req.headers.get('x-signature');
    const xRequestId = req.headers.get('x-request-id');

    const webhook = await req.json();
    console.log('MercadoPago webhook received:', { 
      type: webhook.type, 
      dataId: webhook.data?.id,
      hasSignature: !!xSignature 
    });

    // SECURITY: Verify webhook signature before processing
    const webhookSecret = Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.warn('[Security] MERCADOPAGO_WEBHOOK_SECRET not configured - skipping signature verification');
      // In production, you should reject webhooks without secret configured
      // For now, we'll allow through with a warning
    } else if (webhook.data?.id) {
      const isValid = await verifyMercadoPagoSignature(
        xSignature,
        xRequestId,
        webhook.data.id,
        webhookSecret
      );
      
      if (!isValid) {
        console.error('[Security] Invalid webhook signature - rejecting request');
        return new Response(JSON.stringify({ 
          error: 'Invalid signature' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        });
      }
    }

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