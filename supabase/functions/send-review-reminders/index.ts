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
    console.log('Starting review reminder process...');

    const now = new Date();
    
    // Calculate time windows for 24hs and 72hs reminders
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000);
    
    const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);
    const seventyThreeHoursAgo = new Date(now.getTime() - 73 * 60 * 60 * 1000);

    // Find completed transactions that need first reminder (24hs) or follow-up reminders (every 72hs)
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select(`
        id,
        user_id,
        professional_id,
        completed_at,
        professionals!inner(user_id, full_name)
      `)
      .eq('status', 'completed')
      .not('completed_at', 'is', null);

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
      throw transactionsError;
    }

    console.log(`Found ${transactions?.length || 0} transactions to check for reminders`);

    let remindersCount = 0;

    for (const transaction of transactions || []) {
      const completedAt = new Date(transaction.completed_at);
      const hoursSinceCompleted = (now.getTime() - completedAt.getTime()) / (1000 * 60 * 60);
      
      // Skip if less than 24 hours have passed
      if (hoursSinceCompleted < 24) continue;

      // Check if user has already reviewed the professional
      const { data: userReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', transaction.user_id)
        .eq('professional_id', transaction.professional_id)
        .eq('transaction_id', transaction.id)
        .maybeSingle();

      // Check if professional has already reviewed the user
      const { data: professionalReview } = await supabase
        .from('user_ratings')
        .select('id')
        .eq('professional_id', transaction.professional_id)
        .eq('user_id', transaction.user_id)
        .eq('transaction_id', transaction.id)
        .maybeSingle();

      // Get the last reminder sent for this transaction
      const { data: lastUserNotification } = await supabase
        .from('notifications')
        .select('created_at')
        .eq('user_id', transaction.user_id)
        .ilike('title', '%Recordatorio%reseña%')
        .contains('message', [(transaction as any).professionals.full_name])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: lastProfessionalNotification } = await supabase
        .from('notifications')
        .select('created_at')
        .eq('user_id', (transaction as any).professionals.user_id)
        .ilike('title', '%Recordatorio%cliente%')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Determine if we should send reminder
      const shouldSendUserReminder = !userReview && (
        !lastUserNotification || // First reminder at 24hs
        (now.getTime() - new Date(lastUserNotification.created_at).getTime()) >= 72 * 60 * 60 * 1000 // Follow-ups every 72hs
      );

      const shouldSendProfessionalReminder = !professionalReview && (
        !lastProfessionalNotification || // First reminder at 24hs
        (now.getTime() - new Date(lastProfessionalNotification.created_at).getTime()) >= 72 * 60 * 60 * 1000 // Follow-ups every 72hs
      );

      // Send reminder to user if needed
      if (shouldSendUserReminder) {
        const isFirstReminder = !lastUserNotification;
        const title = isFirstReminder ? '¡Deja tu reseña!' : 'Recordatorio: Deja tu reseña';
        const message = isFirstReminder 
          ? `¿Cómo fue tu experiencia con ${(transaction as any).professionals.full_name}? Tu opinión ayuda a otros usuarios.`
          : `Aún no has reseñado tu experiencia con ${(transaction as any).professionals.full_name}. ¡Tu opinión es importante!`;
        
        const { error: userNotificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: transaction.user_id,
            title,
            message,
            type: 'info',
            action_url: `/user-dashboard?tab=reviews`
          });

        if (userNotificationError) {
          console.error('Error sending user notification:', userNotificationError);
        } else {
          console.log(`Review reminder sent to user ${transaction.user_id} (${isFirstReminder ? 'first' : 'follow-up'})`);
          
          // Send push notification
          try {
            await supabase.functions.invoke('send-push-notification', {
              body: {
                userIds: [transaction.user_id],
                title,
                body: message,
                url: `/user-dashboard?tab=reviews`,
                icon: '/icon-192.png'
              }
            });
            console.log(`Push notification sent to user ${transaction.user_id}`);
          } catch (pushError) {
            console.error('Error sending push notification to user:', pushError);
          }
          
          remindersCount++;
        }
      }

      // Send reminder to professional if needed
      if (shouldSendProfessionalReminder) {
        const isFirstReminder = !lastProfessionalNotification;
        const title = isFirstReminder ? '¡Evalúa al cliente!' : 'Recordatorio: Evalúa al cliente';
        const message = isFirstReminder
          ? 'No olvides evaluar la experiencia con tu cliente reciente. Esto ayuda a mejorar la plataforma.'
          : 'Aún no has evaluado a tu cliente reciente. ¡Tu evaluación es importante para la comunidad!';
        
        const { error: professionalNotificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: (transaction as any).professionals.user_id,
            title,
            message,
            type: 'info',
            action_url: `/professional-dashboard?tab=reviews`
          });

        if (professionalNotificationError) {
          console.error('Error sending professional notification:', professionalNotificationError);
        } else {
          console.log(`Review reminder sent to professional ${(transaction as any).professionals.user_id} (${isFirstReminder ? 'first' : 'follow-up'})`);
          
          // Send push notification
          try {
            await supabase.functions.invoke('send-push-notification', {
              body: {
                userIds: [(transaction as any).professionals.user_id],
                title,
                body: message,
                url: `/professional-dashboard?tab=reviews`,
                icon: '/icon-192.png'
              }
            });
            console.log(`Push notification sent to professional ${(transaction as any).professionals.user_id}`);
          } catch (pushError) {
            console.error('Error sending push notification to professional:', pushError);
          }
          
          remindersCount++;
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${transactions?.length || 0} transactions, sent ${remindersCount} reminders` 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Error in send-review-reminders function:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});