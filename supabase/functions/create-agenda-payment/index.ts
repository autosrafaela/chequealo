import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const mercadopagoToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');

    if (!mercadopagoToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { slotId, amount, professionalName, slotDate, blockType, buyerName, buyerEmail } = await req.json();

    console.log('Creating agenda payment:', { slotId, amount, professionalName, slotDate, blockType });

    // Validate slot exists and is on hold
    const { data: slot, error: slotError } = await supabase
      .from('agenda_slots')
      .select('id, status, professional_id')
      .eq('id', slotId)
      .single();

    if (slotError || !slot) {
      throw new Error('Slot not found');
    }

    if (slot.status !== 'hold' && slot.status !== 'available') {
      throw new Error('Slot is not available for booking');
    }

    // Format block type for display
    const blockLabels: Record<string, string> = {
      morning: 'Mañana',
      afternoon: 'Tarde',
      evening: 'Noche',
    };

    // Create MercadoPago preference
    const preference = {
      items: [{
        title: `Seña - Turno con ${professionalName}`,
        description: `${slotDate} - ${blockLabels[blockType] || blockType}`,
        quantity: 1,
        currency_id: 'ARS',
        unit_price: Number(amount),
      }],
      payer: {
        name: buyerName,
        email: buyerEmail,
      },
      back_urls: {
        success: `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/agenda-payment-success?slot_id=${slotId}`,
        failure: `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/agenda-payment-failure?slot_id=${slotId}`,
        pending: `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/agenda-payment-pending?slot_id=${slotId}`,
      },
      auto_return: 'approved',
      external_reference: `agenda_${slotId}`,
      notification_url: `${supabaseUrl}/functions/v1/mercadopago-webhook`,
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
    };

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mercadopagoToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    });

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      console.error('MercadoPago error:', errorText);
      throw new Error('Failed to create payment preference');
    }

    const mpData = await mpResponse.json();
    console.log('MercadoPago preference created:', mpData.id);

    // Update slot with preference ID
    await supabase
      .from('agenda_slots')
      .update({ 
        mercadopago_preference_id: mpData.id,
        booked_by_name: buyerName,
        booked_by_email: buyerEmail,
      })
      .eq('id', slotId);

    return new Response(
      JSON.stringify({
        id: mpData.id,
        init_point: mpData.init_point,
        sandbox_init_point: mpData.sandbox_init_point,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating agenda payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
