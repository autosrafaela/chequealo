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

    console.log('[billing-cancel] User:', user.id);

    // Get professional profile
    const { data: professional } = await supabaseClient
      .from('professionals')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!professional) {
      throw new Error('Professional profile not found');
    }

    // Get current subscription
    const { data: subscription, error: subError } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('professional_id', professional.id)
      .maybeSingle();

    if (subError || !subscription) {
      throw new Error('Subscription not found');
    }

    // Mark for cancellation at period end
    const { error: updateError } = await supabaseClient
      .from('subscriptions')
      .update({
        status: 'cancelled'
      })
      .eq('id', subscription.id);

    if (updateError) throw updateError;

    console.log('[billing-cancel] Subscription cancelled successfully');

    return new Response(JSON.stringify({
      ok: true,
      message: 'Suscripción cancelada correctamente'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('[billing-cancel] Error:', error);
    
    return new Response(JSON.stringify({ 
      ok: false,
      message: error.message || 'Error al cancelar suscripción'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
