import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { parseUTMParams } from '@/utils/utmHelpers';

export type CampaignEventType = 'whatsapp_click' | 'form_submit' | 'page_view' | 'cta_click';

interface TrackEventParams {
  eventType: CampaignEventType;
  campaign: string;
  professionalId?: string;
  metadata?: Record<string, any>;
}

export const useCampaignTracking = () => {
  const trackEvent = useCallback(async ({ 
    eventType, 
    campaign, 
    professionalId,
    metadata = {} 
  }: TrackEventParams) => {
    try {
      const utmParams = parseUTMParams();
      
      await supabase.from('campaign_events').insert({
        event_type: eventType,
        campaign,
        utm_source: utmParams.source,
        utm_medium: utmParams.medium,
        utm_campaign: utmParams.campaign,
        utm_content: utmParams.content,
        professional_id: professionalId,
        user_agent: navigator.userAgent,
        referrer: document.referrer,
        metadata
      });
    } catch (error) {
      console.error('Error tracking campaign event:', error);
    }
  }, []);

  const trackWhatsAppClick = useCallback((campaign: string, professionalId?: string, phone?: string) => {
    trackEvent({
      eventType: 'whatsapp_click',
      campaign,
      professionalId,
      metadata: { phone }
    });
  }, [trackEvent]);

  const trackPageView = useCallback((campaign: string) => {
    trackEvent({
      eventType: 'page_view',
      campaign
    });
  }, [trackEvent]);

  const trackFormSubmit = useCallback((campaign: string, formData?: Record<string, any>) => {
    trackEvent({
      eventType: 'form_submit',
      campaign,
      metadata: formData
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackWhatsAppClick,
    trackPageView,
    trackFormSubmit
  };
};
