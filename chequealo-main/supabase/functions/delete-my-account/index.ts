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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    // Verify the user token to get user ID
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid token or user not found');
    }

    const userId = user.id;
    console.log('Delete account request for user:', userId);

    // 1. Delete related data first (to avoid foreign key constraints)
    console.log('Deleting user related data...');
    
    // Delete from tables that reference the user
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
    
    // Check if user is a professional and delete professional data
    const { data: professional } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (professional) {
      console.log('Deleting professional data...');
      const professionalId = professional.id;
      
      // Delete professional-related data
      await supabase.from('professional_services').delete().eq('professional_id', professionalId);
      await supabase.from('work_photos').delete().eq('professional_id', professionalId);
      await supabase.from('verification_requests').delete().eq('professional_id', professionalId);
      await supabase.from('review_responses').delete().eq('professional_id', professionalId);
      await supabase.from('contact_requests').delete().eq('professional_id', professionalId);
      await supabase.from('subscriptions').delete().eq('professional_id', professionalId);
      await supabase.from('transactions').delete().eq('professional_id', professionalId);
      await supabase.from('user_ratings').delete().eq('professional_id', professionalId);
      await supabase.from('reviews').delete().eq('professional_id', professionalId);
      
      // Delete professional profile
      await supabase.from('professionals').delete().eq('id', professionalId);
    }
    
    // 2. Delete user profile
    console.log('Deleting user profile...');
    await supabase.from('profiles').delete().eq('user_id', userId);
    
    // 3. Delete user from auth (this is the final step)
    console.log('Deleting user from auth...');
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      console.error('Error deleting user from auth:', deleteError);
      throw deleteError;
    }

    console.log('User account deleted successfully:', userId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Account deleted successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in delete-my-account function:', error);
    
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