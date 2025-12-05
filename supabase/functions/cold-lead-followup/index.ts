import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate unique coupon code
function generateCouponCode(professionalId: string): string {
  const prefix = 'CHEQ';
  const discount = '10';
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${discount}-${random}`;
}

// Send WhatsApp message via Twilio
async function sendWhatsAppMessage(
  to: string,
  professionalName: string,
  couponCode: string,
  expiresIn: string
): Promise<boolean> {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const fromNumber = Deno.env.get('TWILIO_WHATSAPP_FROM');

  if (!accountSid || !authToken || !fromNumber) {
    console.error('Missing Twilio credentials');
    return false;
  }

  // Format phone number for WhatsApp
  const formattedTo = to.startsWith('+') ? to : `+54${to.replace(/\D/g, '')}`;

  const message = `¡Hola! 👋

Notamos que consultaste por los servicios de *${professionalName}* en Chequealo.

¿Todavía necesitás el servicio? Te dejamos un cupón exclusivo:

🎁 *Código: ${couponCode}*
💰 *10% de descuento*
⏰ *Válido por ${expiresIn}*

👉 Contactá al profesional y mencioná tu cupón para obtener el descuento.

https://chequealo.com

_Si ya resolviste tu necesidad, ignorá este mensaje._`;

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: `whatsapp:${formattedTo}`,
          From: `whatsapp:${fromNumber}`,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Twilio error:', error);
      return false;
    }

    console.log(`WhatsApp sent to ${formattedTo}`);
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp:', error);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting cold lead followup job...');

    // Find cold leads: pending status, older than 72h, no followup sent yet
    const hoursThreshold = 72;
    const cutoffDate = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000).toISOString();

    const { data: coldLeads, error: fetchError } = await supabase
      .from('contact_requests')
      .select(`
        id,
        name,
        phone,
        email,
        professional_id,
        created_at,
        followup_count,
        professionals!inner (
          id,
          full_name
        )
      `)
      .eq('status', 'pending')
      .lt('created_at', cutoffDate)
      .or('last_followup_at.is.null,followup_count.eq.0')
      .not('phone', 'is', null);

    if (fetchError) {
      console.error('Error fetching cold leads:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${coldLeads?.length || 0} cold leads`);

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      noPhone: 0,
    };

    for (const lead of coldLeads || []) {
      results.processed++;

      if (!lead.phone) {
        results.noPhone++;
        continue;
      }

      const professional = lead.professionals as any;
      const couponCode = generateCouponCode(lead.professional_id);
      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours from now

      // Create coupon
      const { error: couponError } = await supabase
        .from('lead_coupons')
        .insert({
          code: couponCode,
          contact_request_id: lead.id,
          professional_id: lead.professional_id,
          discount_percentage: 10,
          expires_at: expiresAt.toISOString(),
        });

      if (couponError) {
        console.error(`Error creating coupon for lead ${lead.id}:`, couponError);
        results.failed++;
        continue;
      }

      // Send WhatsApp
      const sent = await sendWhatsAppMessage(
        lead.phone,
        professional.full_name,
        couponCode,
        '72 horas'
      );

      if (sent) {
        // Update contact request
        await supabase
          .from('contact_requests')
          .update({
            last_followup_at: new Date().toISOString(),
            followup_count: (lead.followup_count || 0) + 1,
          })
          .eq('id', lead.id);

        results.sent++;
        console.log(`Followup sent to lead ${lead.id}`);
      } else {
        results.failed++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('Cold lead followup completed:', results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in cold lead followup:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
