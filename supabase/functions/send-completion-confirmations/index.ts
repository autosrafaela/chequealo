import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting completion confirmation process...');

    // Find transactions that started 24 hours ago and haven't been confirmed yet
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const twentyThreeHoursAgo = new Date();
    twentyThreeHoursAgo.setHours(twentyThreeHoursAgo.getHours() - 23);

    // Query transactions without the problematic join
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('id, user_id, professional_id, service_type, started_at, confirmation_requested_at, user_confirmed_completion, professional_confirmed_completion')
      .eq('status', 'in_progress')
      .gte('started_at', twentyFourHoursAgo.toISOString())
      .lt('started_at', twentyThreeHoursAgo.toISOString())
      .is('confirmation_requested_at', null);

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
      throw transactionsError;
    }

    console.log(`Found ${transactions?.length || 0} transactions to request confirmation`);

    for (const transaction of transactions || []) {
      try {
        // Fetch professional data separately
        const { data: professional, error: professionalError } = await supabase
          .from('professionals')
          .select('user_id, full_name, email')
          .eq('id', transaction.professional_id)
          .maybeSingle();

        if (professionalError) {
          console.error(`Error fetching professional ${transaction.professional_id}:`, professionalError);
          continue;
        }

        if (!professional) {
          console.error(`Professional not found for ID ${transaction.professional_id}`);
          continue;
        }

        // Mark confirmation as requested
        const { error: updateError } = await supabase
          .from('transactions')
          .update({ 
            confirmation_requested_at: new Date().toISOString() 
          })
          .eq('id', transaction.id);

        if (updateError) {
          console.error(`Error updating transaction ${transaction.id}:`, updateError);
          continue;
        }

        // Send notification to user
        const { error: userNotificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: transaction.user_id,
            title: '¿Se completó el trabajo?',
            message: `¿${professional.full_name} completó el trabajo de ${transaction.service_type || 'servicio'}? Tu confirmación es importante.`,
            type: 'info',
            action_url: `/user/dashboard?confirm_transaction=${transaction.id}`
          });

        if (userNotificationError) {
          console.error('Error sending user notification:', userNotificationError);
        } else {
          console.log(`Confirmation request sent to user ${transaction.user_id}`);
          
          // Send push notification to user using correct format
          await sendPushToUser(transaction.user_id, 
            '¿Se completó el trabajo?',
            `¿${professional.full_name} completó el trabajo? Confirma ahora.`,
            '/user/dashboard'
          );
        }

        // Send notification to professional
        const { error: professionalNotificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: professional.user_id,
            title: '¿Completaste el trabajo?',
            message: `¿Completaste el trabajo de ${transaction.service_type || 'servicio'}? Confirma para poder recibir calificaciones.`,
            type: 'info',
            action_url: `/professional/dashboard?confirm_transaction=${transaction.id}`
          });

        if (professionalNotificationError) {
          console.error('Error sending professional notification:', professionalNotificationError);
        } else {
          console.log(`Confirmation request sent to professional ${professional.user_id}`);
          
          // Send push notification to professional using correct format
          await sendPushToUser(professional.user_id,
            '¿Completaste el trabajo?',
            `¿Completaste el trabajo? Confirma para poder ser calificado.`,
            '/professional/dashboard'
          );
        }
      } catch (error) {
        console.error(`Error processing transaction ${transaction.id}:`, error);
        continue;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${transactions?.length || 0} transactions for confirmation` 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Error in send-completion-confirmations function:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});

async function sendPushToUser(userId: string, title: string, body: string, url: string) {
  try {
    // Check if user has active push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1);

    if (subError || !subscriptions || subscriptions.length === 0) {
      console.log(`No active push subscriptions for user ${userId}`);
      return;
    }

    // Call the push notification function with correct format
    const { data, error } = await supabase.functions.invoke('send-push-notification', {
      body: {
        userIds: [userId],
        title,
        body,
        url
      }
    });

    if (error) {
      console.error(`Error invoking send-push-notification for user ${userId}:`, error);
    } else {
      console.log(`Push notification sent to user ${userId}:`, data);
    }
  } catch (error) {
    console.error(`Error in sendPushToUser for ${userId}:`, error);
  }
}
