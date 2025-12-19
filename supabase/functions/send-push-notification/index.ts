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
  data?: Record<string, unknown>;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
  vibrate?: number[];
}

// VAPID Public Key - must match the frontend
const VAPID_PUBLIC_KEY = "BP1yFovtMdbM1FEO_DxZm8nVLDrdr5x9YPxPZlkI58cSKhpI1_7L_SNocLh9S08QBMFJ8rXKOKJjrT4XIpCFdjo";

async function sendPushNotification(
  subscription: PushSubscription,
  payload: NotificationPayload,
  subscriptionId: string
): Promise<{ success: boolean; shouldRemove?: boolean; error?: string }> {
  const VAPID_PRIVATE_KEY = Deno.env.get('WEB_PUSH_PRIVATE_KEY');
  
  if (!VAPID_PRIVATE_KEY) {
    console.error('[send-push] ❌ WEB_PUSH_PRIVATE_KEY not configured');
    return { success: false, error: 'WEB_PUSH_PRIVATE_KEY not configured' };
  }

  console.log(`[send-push] Preparing to send notification to subscription ${subscriptionId.substring(0, 8)}...`);
  console.log(`[send-push] Endpoint: ${subscription.endpoint.substring(0, 80)}...`);

  try {
    // Import web-push library
    const webpush = await import('https://esm.sh/web-push@3.6.7');
    
    webpush.default.setVapidDetails(
      'mailto:contacto@chequealo.ar',
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );

    // Build the full payload with vibration and other options
    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icon-192.png',
      badge: payload.badge || '/icon-192.png',
      tag: payload.tag || `notification-${Date.now()}`,
      url: payload.url || '/',
      requireInteraction: payload.requireInteraction || false,
      vibrate: payload.vibrate || [200, 100, 200],
      renotify: true,
      data: {
        url: payload.url || '/',
        timestamp: Date.now(),
        ...payload.data
      },
      actions: [
        { action: 'view', title: 'Ver' },
        { action: 'close', title: 'Cerrar' }
      ]
    });

    console.log(`[send-push] Payload size: ${pushPayload.length} bytes`);
    console.log(`[send-push] Sending: "${payload.title}" - "${payload.body.substring(0, 50)}..."`);
    
    await webpush.default.sendNotification(subscription, pushPayload);
    
    console.log(`[send-push] ✅ Push sent successfully to ${subscriptionId.substring(0, 8)}`);
    return { success: true };
    
  } catch (error: unknown) {
    const err = error as { message?: string; statusCode?: number; body?: string };
    console.error(`[send-push] ❌ Error sending to ${subscriptionId.substring(0, 8)}:`, {
      message: err.message,
      statusCode: err.statusCode,
      body: err.body?.substring(0, 200)
    });
    
    // If subscription is invalid (expired or unsubscribed), mark for removal
    if (err.statusCode === 410 || err.statusCode === 404) {
      console.log(`[send-push] Subscription ${subscriptionId.substring(0, 8)} is invalid (${err.statusCode}), marking for removal`);
      return { success: false, shouldRemove: true, error: `Invalid subscription: ${err.statusCode}` };
    }
    
    // Rate limited or temporary error
    if (err.statusCode === 429) {
      console.log(`[send-push] Rate limited for ${subscriptionId.substring(0, 8)}, will retry`);
      return { success: false, error: 'Rate limited' };
    }
    
    return { success: false, error: err.message || 'Unknown error' };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log('');
  console.log('[send-push] ========================================');
  console.log('[send-push] 🔔 Push notification function invoked');
  console.log('[send-push] ========================================');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const requestBody = await req.json();
    const { userIds, title, body, icon, url, data, tag, requireInteraction, vibrate } = requestBody;
    
    console.log('[send-push] 📥 Request received:', { 
      userIdsCount: userIds?.length || 0, 
      title: title?.substring(0, 50),
      body: body?.substring(0, 50),
      url
    });

    // Validate required fields
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      console.error('[send-push] ❌ Invalid or missing userIds');
      return new Response(
        JSON.stringify({ error: 'userIds array is required', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!title || !body) {
      console.error('[send-push] ❌ Missing title or body');
      return new Response(
        JSON.stringify({ error: 'title and body are required', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get active push subscriptions for specified users
    console.log(`[send-push] 🔍 Fetching subscriptions for ${userIds.length} user(s)...`);
    console.log(`[send-push] User IDs: ${userIds.map((id: string) => id.substring(0, 8)).join(', ')}...`);
    
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', userIds)
      .eq('is_active', true);

    if (subError) {
      console.error('[send-push] ❌ Error fetching subscriptions:', subError);
      throw subError;
    }

    console.log(`[send-push] 📊 Found ${subscriptions?.length || 0} active subscription(s)`);

    if (!subscriptions || subscriptions.length === 0) {
      console.log('[send-push] ⚠️ No active subscriptions found, returning early');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No active subscriptions found',
          sent: 0,
          failed: 0,
          removed: 0,
          total: 0,
          duration: Date.now() - startTime
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log subscription details
    subscriptions.forEach((sub, index) => {
      console.log(`[send-push] 📱 Subscription ${index + 1}:`, {
        id: sub.id.substring(0, 8),
        userId: sub.user_id.substring(0, 8),
        endpoint: sub.endpoint.substring(0, 50) + '...',
        lastUsed: sub.last_used_at
      });
    });

    // Prepare notification payload
    const payload: NotificationPayload = {
      title,
      body,
      icon: icon || '/icon-192.png',
      badge: '/icon-192.png',
      tag: tag || `notification-${Date.now()}`,
      requireInteraction: requireInteraction || false,
      vibrate: vibrate || [200, 100, 200],
      data: {
        url: url || '/',
        timestamp: Date.now(),
        ...data
      },
      url: url || '/'
    };

    console.log('[send-push] 📤 Sending notifications with payload:', { 
      title: payload.title, 
      body: payload.body.substring(0, 50),
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
          console.log(`[send-push] 🔄 Retrying subscription ${sub.id.substring(0, 8)}...`);
          await new Promise(resolve => setTimeout(resolve, 500));
          result = await sendPushNotification(pushSubscription, payload, sub.id);
        }
        
        // Handle subscription status updates
        if (result.shouldRemove) {
          console.log(`[send-push] 🗑️ Deactivating invalid subscription ${sub.id.substring(0, 8)}`);
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

    // Calculate statistics
    const successful = results.filter(r => r.status === 'fulfilled' && (r.value as { success: boolean }).success).length;
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !(r.value as { success: boolean }).success)).length;
    const removed = results.filter(r => r.status === 'fulfilled' && (r.value as { shouldRemove?: boolean }).shouldRemove).length;

    const duration = Date.now() - startTime;
    
    console.log('');
    console.log('[send-push] ========================================');
    console.log('[send-push] 📊 SUMMARY');
    console.log('[send-push] ========================================');
    console.log(`[send-push] Total subscriptions: ${subscriptions.length}`);
    console.log(`[send-push] ✅ Successful: ${successful}`);
    console.log(`[send-push] ❌ Failed: ${failed}`);
    console.log(`[send-push] 🗑️ Removed: ${removed}`);
    console.log(`[send-push] ⏱️ Duration: ${duration}ms`);
    console.log('[send-push] ========================================');
    console.log('');

    return new Response(
      JSON.stringify({ 
        success: true,
        sent: successful,
        failed,
        removed,
        total: subscriptions.length,
        duration,
        results: results.map(r => {
          if (r.status === 'fulfilled') {
            return r.value;
          }
          return { success: false, error: 'Promise rejected' };
        })
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const err = error as { message?: string; stack?: string };
    const duration = Date.now() - startTime;
    console.error('');
    console.error('[send-push] ========================================');
    console.error('[send-push] ❌ FATAL ERROR');
    console.error('[send-push] ========================================');
    console.error('[send-push] Error:', err.message);
    console.error('[send-push] Stack:', err.stack?.substring(0, 500));
    console.error(`[send-push] Duration: ${duration}ms`);
    console.error('[send-push] ========================================');
    
    return new Response(
      JSON.stringify({ 
        error: err.message || 'Unknown error',
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
