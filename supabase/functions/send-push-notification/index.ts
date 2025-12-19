import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  url?: string;
}

// VAPID Public Key
const VAPID_PUBLIC_KEY = "BP1yFovtMdbM1FEO_DxZm8nVLDrdr5x9YPxPZlkI58cSKhpI1_7L_SNocLh9S08QBMFJ8rXKOKJjrT4XIpCFdjo";

async function sendPushNotification(
  subscription: PushSubscription,
  payload: NotificationPayload
) {
  const VAPID_PRIVATE_KEY = Deno.env.get('WEB_PUSH_PRIVATE_KEY');
  
  if (!VAPID_PRIVATE_KEY) {
    console.error('WEB_PUSH_PRIVATE_KEY not configured');
    throw new Error('WEB_PUSH_PRIVATE_KEY not configured');
  }

  // Import web-push functionality
  const webpush = await import('https://esm.sh/web-push@3.6.7');
  
  webpush.default.setVapidDetails(
    'mailto:contacto@chequealo.ar',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );

  try {
    console.log('Sending push to endpoint:', subscription.endpoint.substring(0, 50) + '...');
    await webpush.default.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
    console.log('Push sent successfully');
    return { success: true };
  } catch (error: any) {
    console.error('Error sending push notification:', error.message, error.statusCode);
    
    // If subscription is invalid, return error so it can be cleaned up
    if (error.statusCode === 410 || error.statusCode === 404) {
      return { success: false, shouldRemove: true };
    }
    
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== send-push-notification: Function invoked ===');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const requestBody = await req.json();
    const { userIds, title, body, icon, url, data } = requestBody;
    
    console.log('Request received:', JSON.stringify({ 
      userIds: userIds?.length || 0, 
      title, 
      body: body?.substring(0, 50) 
    }));

    // Validate required fields
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      console.error('Invalid or missing userIds:', userIds);
      return new Response(
        JSON.stringify({ error: 'userIds array is required', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!title || !body) {
      console.error('Missing title or body');
      return new Response(
        JSON.stringify({ error: 'title and body are required', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get active push subscriptions for specified users
    console.log('Fetching subscriptions for users:', userIds);
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', userIds)
      .eq('is_active', true);

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      throw subError;
    }

    console.log(`Found ${subscriptions?.length || 0} active subscriptions`);

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No active subscriptions found',
          sent: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare notification payload
    const payload: NotificationPayload = {
      title,
      body,
      icon: icon || '/icon-192.png',
      badge: '/icon-192.png',
      data: {
        url: url || '/',
        ...data
      },
      url: url || '/'
    };

    console.log('Sending notifications with payload:', JSON.stringify({ title, body, url }));

    // Send push notifications
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSubscription: PushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };

        const result = await sendPushNotification(pushSubscription, payload);
        
        // Remove invalid subscriptions
        if (result.shouldRemove) {
          console.log(`Marking subscription ${sub.id} as inactive (invalid)`);
          await supabase
            .from('push_subscriptions')
            .update({ is_active: false })
            .eq('id', sub.id);
        } else if (result.success) {
          // Update last_used_at
          await supabase
            .from('push_subscriptions')
            .update({ last_used_at: new Date().toISOString() })
            .eq('id', sub.id);
        }

        return { ...result, subscription_id: sub.id, user_id: sub.user_id };
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
    const failed = results.filter(r => r.status === 'rejected' || !(r.value as any).success).length;

    console.log(`Push notifications sent: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true,
        sent: successful,
        failed,
        total: subscriptions.length,
        results: results.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: 'Promise rejected' })
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-push-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
