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
  tag?: string;
  requireInteraction?: boolean;
}

// VAPID Public Key
const VAPID_PUBLIC_KEY = "BP1yFovtMdbM1FEO_DxZm8nVLDrdr5x9YPxPZlkI58cSKhpI1_7L_SNocLh9S08QBMFJ8rXKOKJjrT4XIpCFdjo";

async function sendPushNotification(
  subscription: PushSubscription,
  payload: NotificationPayload,
  subscriptionId: string
): Promise<{ success: boolean; shouldRemove?: boolean; error?: string }> {
  const VAPID_PRIVATE_KEY = Deno.env.get('WEB_PUSH_PRIVATE_KEY');
  
  if (!VAPID_PRIVATE_KEY) {
    console.error('[send-push-notification] WEB_PUSH_PRIVATE_KEY not configured');
    return { success: false, error: 'WEB_PUSH_PRIVATE_KEY not configured' };
  }

  try {
    // Import web-push functionality
    const webpush = await import('https://esm.sh/web-push@3.6.7');
    
    webpush.default.setVapidDetails(
      'mailto:contacto@chequealo.ar',
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );

    const pushPayload = JSON.stringify({
      ...payload,
      vibrate: [200, 100, 200],
      renotify: true
    });

    console.log(`[send-push-notification] Sending to subscription ${subscriptionId}:`, {
      endpoint: subscription.endpoint.substring(0, 60) + '...',
      title: payload.title
    });
    
    await webpush.default.sendNotification(subscription, pushPayload);
    
    console.log(`[send-push-notification] ✅ Push sent successfully to ${subscriptionId}`);
    return { success: true };
    
  } catch (error: any) {
    console.error(`[send-push-notification] ❌ Error sending to ${subscriptionId}:`, {
      message: error.message,
      statusCode: error.statusCode,
      body: error.body
    });
    
    // If subscription is invalid (expired or unsubscribed), mark for removal
    if (error.statusCode === 410 || error.statusCode === 404) {
      console.log(`[send-push-notification] Subscription ${subscriptionId} is invalid, marking for removal`);
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

  const startTime = Date.now();
  console.log('[send-push-notification] ====== Function invoked ======');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const requestBody = await req.json();
    const { userIds, title, body, icon, url, data, tag, requireInteraction } = requestBody;
    
    console.log('[send-push-notification] Request received:', { 
      userIdsCount: userIds?.length || 0, 
      title: title?.substring(0, 50),
      body: body?.substring(0, 50),
      url
    });

    // Validate required fields
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      console.error('[send-push-notification] Invalid or missing userIds');
      return new Response(
        JSON.stringify({ error: 'userIds array is required', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!title || !body) {
      console.error('[send-push-notification] Missing title or body');
      return new Response(
        JSON.stringify({ error: 'title and body are required', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get active push subscriptions for specified users
    console.log('[send-push-notification] Fetching subscriptions for', userIds.length, 'users');
    
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', userIds)
      .eq('is_active', true);

    if (subError) {
      console.error('[send-push-notification] Error fetching subscriptions:', subError);
      throw subError;
    }

    console.log(`[send-push-notification] Found ${subscriptions?.length || 0} active subscriptions`);

    if (!subscriptions || subscriptions.length === 0) {
      console.log('[send-push-notification] No active subscriptions found, returning early');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No active subscriptions found',
          sent: 0,
          duration: Date.now() - startTime
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
      tag: tag || `notification-${Date.now()}`,
      requireInteraction: requireInteraction || false,
      data: {
        url: url || '/',
        timestamp: Date.now(),
        ...data
      },
      url: url || '/'
    };

    console.log('[send-push-notification] Sending with payload:', { 
      title: payload.title, 
      body: payload.body,
      url: payload.url,
      tag: payload.tag
    });

    // Send push notifications with retry logic
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSubscription: PushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };

        // Try sending the notification
        let result = await sendPushNotification(pushSubscription, payload, sub.id);
        
        // Simple retry once on failure (not on invalid subscription)
        if (!result.success && !result.shouldRemove) {
          console.log(`[send-push-notification] Retrying subscription ${sub.id}...`);
          await new Promise(resolve => setTimeout(resolve, 500));
          result = await sendPushNotification(pushSubscription, payload, sub.id);
        }
        
        // Handle subscription status updates
        if (result.shouldRemove) {
          console.log(`[send-push-notification] Deactivating invalid subscription ${sub.id}`);
          await supabase
            .from('push_subscriptions')
            .update({ is_active: false })
            .eq('id', sub.id);
        } else if (result.success) {
          // Update last_used_at on success
          await supabase
            .from('push_subscriptions')
            .update({ last_used_at: new Date().toISOString() })
            .eq('id', sub.id);
        }

        return { ...result, subscription_id: sub.id, user_id: sub.user_id };
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !(r.value as any).success)).length;
    const removed = results.filter(r => r.status === 'fulfilled' && (r.value as any).shouldRemove).length;

    const duration = Date.now() - startTime;
    
    console.log('[send-push-notification] ====== Summary ======');
    console.log(`[send-push-notification] Total: ${subscriptions.length}, Success: ${successful}, Failed: ${failed}, Removed: ${removed}`);
    console.log(`[send-push-notification] Duration: ${duration}ms`);

    return new Response(
      JSON.stringify({ 
        success: true,
        sent: successful,
        failed,
        removed,
        total: subscriptions.length,
        duration,
        results: results.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: 'Promise rejected' })
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('[send-push-notification] ====== ERROR ======');
    console.error('[send-push-notification] Error:', error.message);
    console.error('[send-push-notification] Stack:', error.stack);
    console.error(`[send-push-notification] Duration: ${duration}ms`);
    
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        success: false,
        duration 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
