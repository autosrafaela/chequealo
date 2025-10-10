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

    console.log('[billing-get-subscription] User:', user.id);

    // Get professional profile
    const { data: professional } = await supabaseClient
      .from('professionals')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!professional) {
      return new Response(JSON.stringify({
        ok: true,
        subscription: null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Get subscription with plans
    const { data: subscription, error } = await supabaseClient
      .from('subscriptions')
      .select(`
        *,
        subscription_plans!plan_id(*),
        selected_subscription_plan:subscription_plans!selected_plan_id(*)
      `)
      .eq('professional_id', professional.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('[billing-get-subscription] Error:', error);
      throw error;
    }

    console.log('[billing-get-subscription] Subscription found:', !!subscription);

    return new Response(JSON.stringify({
      ok: true,
      subscription: subscription || null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('[billing-get-subscription] Error:', error);
    
    return new Response(JSON.stringify({ 
      ok: false,
      message: error.message || 'Error al cargar suscripción'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
