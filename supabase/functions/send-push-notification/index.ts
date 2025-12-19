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
    await webpush.default.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
    return { success: true };
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    
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
    console.log('send-push-notification: Function invoked');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body first to log it
    const requestBody = await req.json();
    const { userIds, title, body, icon, url, data } = requestBody;
    
    console.log('send-push-notification: Request body:', JSON.stringify({ userIds, title, body, url }));

    // Check auth - allow service role calls (from other edge functions)
    const authHeader = req.headers.get('Authorization');
    const isServiceCall = authHeader?.includes(supabaseKey);
    
    if (!isServiceCall && authHeader) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      );

      if (authError || !user) {
        console.error('send-push-notification: Auth error:', authError);
        throw new Error('Unauthorized');
      }
      console.log('send-push-notification: Authenticated user:', user.id);
    } else if (!authHeader) {
      console.log('send-push-notification: No auth header - rejecting');
      throw new Error('No authorization header');
    } else {
      console.log('send-push-notification: Service role call detected');
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      console.error('send-push-notification: Invalid userIds:', userIds);
      throw new Error('userIds array is required');
    }

    if (!title || !body) {
      console.error('send-push-notification: Missing title or body');
      throw new Error('title and body are required');
    }

    // Get active push subscriptions for specified users
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', userIds)
      .eq('is_active', true);

    if (subError) {
      throw subError;
    }

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
          await supabase
            .from('push_subscriptions')
            .update({ is_active: false })
            .eq('id', sub.id);
        } else {
          // Update last_used_at
          await supabase
            .from('push_subscriptions')
            .update({ last_used_at: new Date().toISOString() })
            .eq('id', sub.id);
        }

        return result;
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;

    return new Response(
      JSON.stringify({ 
        success: true,
        sent: successful,
        total: subscriptions.length,
        results: results.map(r => r.status === 'fulfilled' ? r.value : { success: false })
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-push-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
