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

    // Find completed transactions from 10 days ago that need review reminders
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

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
      .gte('completed_at', tenDaysAgo.toISOString())
      .lt('completed_at', new Date(tenDaysAgo.getTime() + 24 * 60 * 60 * 1000).toISOString());

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
      throw transactionsError;
    }

    console.log(`Found ${transactions?.length || 0} transactions to check for reminders`);

    for (const transaction of transactions || []) {
      // Check if user has already reviewed the professional
      const { data: userReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', transaction.user_id)
        .eq('professional_id', transaction.professional_id)
        .eq('transaction_id', transaction.id)
        .single();

      // Check if professional has already reviewed the user
      const { data: professionalReview } = await supabase
        .from('user_ratings')
        .select('id')
        .eq('professional_id', transaction.professional_id)
        .eq('user_id', transaction.user_id)
        .eq('transaction_id', transaction.id)
        .single();

      // Check if reminder notifications have already been sent
      const { data: existingUserNotification } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', transaction.user_id)
        .eq('title', 'Recordatorio: Deja tu reseña')
        .gte('created_at', tenDaysAgo.toISOString())
        .single();

      const { data: existingProfessionalNotification } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', (transaction as any).professionals.user_id)
        .eq('title', 'Recordatorio: Evalúa al cliente')
        .gte('created_at', tenDaysAgo.toISOString())
        .single();

      // Send reminder to user if they haven't reviewed and no reminder sent
      if (!userReview && !existingUserNotification) {
        const { error: userNotificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: transaction.user_id,
            title: 'Recordatorio: Deja tu reseña',
            message: `¿Cómo fue tu experiencia con ${(transaction as any).professionals.full_name}? Tu opinión ayuda a otros usuarios.`,
            type: 'info',
            action_url: `/professional/${transaction.professional_id}?review=true`
          });

        if (userNotificationError) {
          console.error('Error sending user notification:', userNotificationError);
        } else {
          console.log(`Review reminder sent to user ${transaction.user_id}`);
        }
      }

      // Send reminder to professional if they haven't reviewed and no reminder sent
      if (!professionalReview && !existingProfessionalNotification) {
        const { error: professionalNotificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: (transaction as any).professionals.user_id,
            title: 'Recordatorio: Evalúa al cliente',
            message: 'No olvides evaluar la experiencia con tu cliente reciente. Esto ayuda a mejorar la plataforma.',
            type: 'info',
            action_url: `/professional/dashboard?rate=true&transaction=${transaction.id}`
          });

        if (professionalNotificationError) {
          console.error('Error sending professional notification:', professionalNotificationError);
        } else {
          console.log(`Review reminder sent to professional ${(transaction as any).professionals.user_id}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${transactions?.length || 0} transactions for review reminders` 
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