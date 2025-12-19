-- Deactivate all existing push subscriptions to force re-subscription with new VAPID keys
UPDATE push_subscriptions SET is_active = false, updated_at = now();