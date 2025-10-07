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

    // Get all subscriptions that need payment reminders or are expired
    const { data: subscriptions, error } = await supabaseClient
      .from('subscriptions')
      .select(`
        *,
        professionals!inner(user_id, full_name, email),
        subscription_plans!inner(*)
      `)
      .eq('status', 'trial');

    if (error) {
      throw new Error(`Error fetching subscriptions: ${error.message}`);
    }

    const now = new Date();
    let processedCount = 0;

    for (const subscription of subscriptions) {
      const trialEndDate = new Date(subscription.trial_end_date);
      const paymentRequiredDate = new Date(subscription.payment_data_required_date);
      const daysSinceStart = Math.floor((now.getTime() - new Date(subscription.trial_start_date).getTime()) / (1000 * 60 * 60 * 24));

      // Check if trial has expired
      if (now > trialEndDate) {
        await supabaseClient
          .from('subscriptions')
          .update({ status: 'expired' })
          .eq('id', subscription.id);

        // Create expiration notification
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: subscription.professionals.user_id,
            title: 'Período de prueba expirado',
            message: 'Tu período de prueba de 90 días ha finalizado. Para continuar recibiendo solicitudes, completá tu suscripción mensual.',
            type: 'warning',
            action_url: '/dashboard?tab=subscription'
          });

        processedCount++;
        console.log(`Subscription expired: ${subscription.id}`);
        continue;
      }

      // Check if payment reminder should be sent (at 60 days)
      if (daysSinceStart >= 60 && !subscription.payment_reminder_sent) {
        await supabaseClient
          .from('subscriptions')
          .update({ payment_reminder_sent: true })
          .eq('id', subscription.id);

        // Create payment reminder notification
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: subscription.professionals.user_id,
            title: 'Recordatorio de suscripción',
            message: `¡Hola ${subscription.professionals.full_name}! Te quedan 30 días de período de prueba. Para continuar sin interrupciones, configurá tu método de pago.`,
            type: 'info',
            action_url: '/dashboard?tab=subscription'
          });

        processedCount++;
        console.log(`Payment reminder sent for subscription: ${subscription.id}`);
      }

      // Check if payment data is required (at 75 days)
      if (now > paymentRequiredDate && subscription.status === 'trial') {
        // Create urgent payment notification
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: subscription.professionals.user_id,
            title: 'Acción requerida: Configurá tu pago',
            message: 'Te quedan 15 días para configurar tu método de pago y continuar con tu suscripción. ¡No pierdas el acceso a tus solicitudes!',
            type: 'warning',
            action_url: '/dashboard?tab=subscription'
          });

        processedCount++;
        console.log(`Payment required notification sent for subscription: ${subscription.id}`);
      }
    }

    return new Response(JSON.stringify({ 
      processedCount,
      message: `Processed ${processedCount} subscription status checks`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error checking subscription status:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});