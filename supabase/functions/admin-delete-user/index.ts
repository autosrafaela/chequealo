import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Initialize Supabase Admin Client with Service Role for all operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the user from the JWT token using admin client
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error('[admin-delete-user] Auth error:', authError);
      throw new Error('Unauthorized: Invalid or expired token');
    }

    console.log('[admin-delete-user] User authenticated:', user.id);

    // SECURITY: Check if the user has admin role using RBAC
    const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    console.log('[admin-delete-user] Admin check:', { isAdmin, roleError });

    if (roleError || !isAdmin) {
      console.error('[admin-delete-user] Authorization failed:', roleError);
      throw new Error('Unauthorized: Admin role required');
    }

    // Get request body
    const { userId } = await req.json();
    
    console.log('[admin-delete-user] Request to delete user:', { userId, requestedBy: user.id });

    if (!userId) {
      throw new Error('User ID is required');
    }

    // 1. Delete related data first (to avoid foreign key constraints)
    console.log('Deleting user related data...');
    
    // Delete from tables that reference the user
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
    
    // Check if user is a professional and delete professional data
    const { data: professional } = await supabaseAdmin
      .from('professionals')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (professional) {
      console.log('Deleting professional data...');
      const professionalId = professional.id;
      
      // Delete professional-related data
      await supabaseAdmin.from('professional_services').delete().eq('professional_id', professionalId);
      await supabaseAdmin.from('work_photos').delete().eq('professional_id', professionalId);
      await supabaseAdmin.from('verification_requests').delete().eq('professional_id', professionalId);
      await supabaseAdmin.from('review_responses').delete().eq('professional_id', professionalId);
      await supabaseAdmin.from('contact_requests').delete().eq('professional_id', professionalId);
      await supabaseAdmin.from('subscriptions').delete().eq('professional_id', professionalId);
      await supabaseAdmin.from('transactions').delete().eq('professional_id', professionalId);
      await supabaseAdmin.from('user_ratings').delete().eq('professional_id', professionalId);
      await supabaseAdmin.from('reviews').delete().eq('professional_id', professionalId);
      
      // Delete professional profile
      await supabaseAdmin.from('professionals').delete().eq('id', professionalId);
    }
    
    // 2. Delete user profile
    console.log('Deleting user profile...');
    await supabaseAdmin.from('profiles').delete().eq('user_id', userId);
    
    // 3. Delete user from auth (this is the final step)
    console.log('Deleting user from auth...');
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      console.error('Error deleting user from auth:', deleteError);
      throw deleteError;
    }

    console.log('User deleted successfully:', userId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User deleted successfully',
        deletedUserId: userId 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in admin-delete-user function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message || 'Internal server error',
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});