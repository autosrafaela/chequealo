import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid token or user not found');
    }

    const userId = user.id;
    console.log('Delete account request for user:', userId);

    // Check if user is a professional and delete professional data first
    const { data: professional } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (professional) {
      console.log('Deleting professional data...');
      const pid = professional.id;
      
      // Professional-referenced tables
      await supabase.from('professional_services').delete().eq('professional_id', pid);
      await supabase.from('work_photos').delete().eq('professional_id', pid);
      await supabase.from('verification_requests').delete().eq('professional_id', pid);
      await supabase.from('review_responses').delete().eq('professional_id', pid);
      await supabase.from('contact_requests').delete().eq('professional_id', pid);
      await supabase.from('subscriptions').delete().eq('professional_id', pid);
      await supabase.from('transactions').delete().eq('professional_id', pid);
      await supabase.from('user_ratings').delete().eq('professional_id', pid);
      await supabase.from('reviews').delete().eq('professional_id', pid);
      await supabase.from('combos').delete().eq('professional_id', pid);
      await supabase.from('combo_reservations').delete().eq('professional_id', pid);
      await supabase.from('agenda_slots').delete().eq('professional_id', pid);
      await supabase.from('availability_slots').delete().eq('professional_id', pid);
      await supabase.from('certifications').delete().eq('professional_id', pid);
      await supabase.from('bookings').delete().eq('professional_id', pid);
      await supabase.from('professional_professions').delete().eq('professional_id', pid);
      await supabase.from('professional_rankings').delete().eq('professional_id', pid);
      await supabase.from('pro_routes').delete().eq('professional_id', pid);
      await supabase.from('campaign_events').delete().eq('professional_id', pid);
      await supabase.from('conversations').delete().eq('professional_id', pid);
      await supabase.from('chat_quotes').delete().eq('professional_id', pid);
      await supabase.from('lead_coupons').delete().eq('professional_id', pid);
      
      // Delete professional profile
      await supabase.from('professionals').delete().eq('id', pid);
    }

    // User-referenced tables
    console.log('Deleting user related data...');
    await supabase.from('contact_requests').delete().eq('user_id', userId);
    await supabase.from('favorites').delete().eq('user_id', userId);
    await supabase.from('notifications').delete().eq('user_id', userId);
    await supabase.from('payment_methods').delete().eq('user_id', userId);
    await supabase.from('payments').delete().eq('user_id', userId);
    await supabase.from('transactions').delete().eq('user_id', userId);
    await supabase.from('reviews').delete().eq('user_id', userId);
    await supabase.from('review_likes').delete().eq('user_id', userId);
    await supabase.from('user_ratings').delete().eq('user_id', userId);
    await supabase.from('user_roles').delete().eq('user_id', userId);
    await supabase.from('subscriptions').delete().eq('user_id', userId);
    await supabase.from('conversations').delete().eq('user_id', userId);
    await supabase.from('chat_quotes').delete().eq('user_id', userId);
    await supabase.from('combo_reservations').delete().eq('user_id', userId);
    await supabase.from('bookings').delete().eq('user_id', userId);
    await supabase.from('push_subscriptions').delete().eq('user_id', userId);
    await supabase.from('user_achievements').delete().eq('user_id', userId);
    
    // Delete user profile
    console.log('Deleting user profile...');
    await supabase.from('profiles').delete().eq('user_id', userId);
    
    // Delete user from auth
    console.log('Deleting user from auth...');
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      console.error('Error deleting user from auth:', deleteError);
      throw deleteError;
    }

    console.log('User account deleted successfully:', userId);

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in delete-my-account function:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || 'Internal server error', success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
