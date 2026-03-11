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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized: Invalid or expired token');
    }

    // SECURITY: Check admin role via RBAC
    const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (roleError || !isAdmin) {
      throw new Error('Unauthorized: Admin role required');
    }

    const { userId } = await req.json();
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('[admin-delete-user] Deleting user:', userId, 'by admin:', user.id);

    // Check if user is a professional
    const { data: professional } = await supabaseAdmin
      .from('professionals')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (professional) {
      const pid = professional.id;
      
      // Professional-referenced tables
      await supabaseAdmin.from('professional_services').delete().eq('professional_id', pid);
      await supabaseAdmin.from('work_photos').delete().eq('professional_id', pid);
      await supabaseAdmin.from('verification_requests').delete().eq('professional_id', pid);
      await supabaseAdmin.from('review_responses').delete().eq('professional_id', pid);
      await supabaseAdmin.from('contact_requests').delete().eq('professional_id', pid);
      await supabaseAdmin.from('subscriptions').delete().eq('professional_id', pid);
      await supabaseAdmin.from('transactions').delete().eq('professional_id', pid);
      await supabaseAdmin.from('user_ratings').delete().eq('professional_id', pid);
      await supabaseAdmin.from('reviews').delete().eq('professional_id', pid);
      await supabaseAdmin.from('combos').delete().eq('professional_id', pid);
      await supabaseAdmin.from('combo_reservations').delete().eq('professional_id', pid);
      await supabaseAdmin.from('agenda_slots').delete().eq('professional_id', pid);
      await supabaseAdmin.from('availability_slots').delete().eq('professional_id', pid);
      await supabaseAdmin.from('certifications').delete().eq('professional_id', pid);
      await supabaseAdmin.from('bookings').delete().eq('professional_id', pid);
      await supabaseAdmin.from('professional_professions').delete().eq('professional_id', pid);
      await supabaseAdmin.from('professional_rankings').delete().eq('professional_id', pid);
      await supabaseAdmin.from('pro_routes').delete().eq('professional_id', pid);
      await supabaseAdmin.from('campaign_events').delete().eq('professional_id', pid);
      await supabaseAdmin.from('conversations').delete().eq('professional_id', pid);
      await supabaseAdmin.from('chat_quotes').delete().eq('professional_id', pid);
      await supabaseAdmin.from('lead_coupons').delete().eq('professional_id', pid);
      
      await supabaseAdmin.from('professionals').delete().eq('id', pid);
    }
    
    // User-referenced tables
    await supabaseAdmin.from('contact_requests').delete().eq('user_id', userId);
    await supabaseAdmin.from('favorites').delete().eq('user_id', userId);
    await supabaseAdmin.from('notifications').delete().eq('user_id', userId);
    await supabaseAdmin.from('payment_methods').delete().eq('user_id', userId);
    await supabaseAdmin.from('payments').delete().eq('user_id', userId);
    await supabaseAdmin.from('transactions').delete().eq('user_id', userId);
    await supabaseAdmin.from('reviews').delete().eq('user_id', userId);
    await supabaseAdmin.from('review_likes').delete().eq('user_id', userId);
    await supabaseAdmin.from('user_ratings').delete().eq('user_id', userId);
    await supabaseAdmin.from('user_roles').delete().eq('user_id', userId);
    await supabaseAdmin.from('subscriptions').delete().eq('user_id', userId);
    await supabaseAdmin.from('conversations').delete().eq('user_id', userId);
    await supabaseAdmin.from('chat_quotes').delete().eq('user_id', userId);
    await supabaseAdmin.from('combo_reservations').delete().eq('user_id', userId);
    await supabaseAdmin.from('bookings').delete().eq('user_id', userId);
    await supabaseAdmin.from('push_subscriptions').delete().eq('user_id', userId);
    await supabaseAdmin.from('user_achievements').delete().eq('user_id', userId);
    
    await supabaseAdmin.from('profiles').delete().eq('user_id', userId);
    
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      throw deleteError;
    }

    console.log('User deleted successfully:', userId);

    return new Response(
      JSON.stringify({ success: true, message: 'User deleted successfully', deletedUserId: userId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in admin-delete-user function:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || 'Internal server error', success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
