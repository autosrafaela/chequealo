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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    console.log('[billing-get-plans] Fetching active subscription plans');

    // Fetch all active plans ordered by sort_order
    const { data: plans, error } = await supabaseClient
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('[billing-get-plans] Error:', error);
      throw error;
    }

    console.log('[billing-get-plans] Found', plans?.length || 0, 'plans');

    return new Response(JSON.stringify({
      ok: true,
      plans: plans || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('[billing-get-plans] Error:', error);
    
    return new Response(JSON.stringify({ 
      ok: false,
      message: error.message || 'Error al cargar planes'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
