import { generateAutoSlug } from '@/utils/autoSlug';

/**
 * UTM Helper Functions for tracking professional links
 * 
 * UTM Parameters:
 * - utm_source: Platform (ig, fb, tw, wa, email, bio)
 * - utm_medium: How shared (share, bio, post, story)
 * - utm_campaign: Professional identifier (pro_[id])
 */

export type UTMSource = 'ig' | 'fb' | 'tw' | 'wa' | 'email' | 'bio' | 'direct';
export type UTMMedium = 'share' | 'bio' | 'post' | 'story' | 'link';

interface UTMParams {
  source: UTMSource;
  medium: UTMMedium;
  professionalId: string;
  content?: string; // Optional: specific content identifier
}

/**
 * Generate a URL with UTM parameters for tracking
 */
export function generateUTMUrl(baseUrl: string, params: UTMParams): string {
  const url = new URL(baseUrl);
  
  url.searchParams.set('utm_source', params.source);
  url.searchParams.set('utm_medium', params.medium);
  url.searchParams.set('utm_campaign', `pro_${params.professionalId}`);
  
  if (params.content) {
    url.searchParams.set('utm_content', params.content);
  }
  
  return url.toString();
}

/**
 * Generate a professional profile URL with UTM tracking.
 * Uses custom slug or auto-generated SEO slug when available.
 */
export function getProfessionalShareUrl(
  professionalId: string, 
  source: UTMSource, 
  medium: UTMMedium = 'share',
  options?: { slug?: string | null; profession?: string; fullName?: string; location?: string | null }
): string {
  let path = `/professional/${professionalId}`;
  
  if (options?.slug) {
    // Slug personalizado
    path = `/${options.slug}`;
  } else if (options?.profession && options?.fullName) {
    // Auto-slug SEO
    const autoSlug = generateAutoSlug(options.profession, options.fullName, options.location);
    if (autoSlug) {
      path = `/${autoSlug}`;
    }
  }
  
  const baseUrl = `https://chequealo.net${path}`;
  return generateUTMUrl(baseUrl, { source, medium, professionalId });
}

/**
 * Generate a short code for bio links (e.g., CHEQ-JUAN123)
 */
export function generatePromoCode(professionalName: string, professionalId: string): string {
  const shortName = professionalName
    .split(' ')[0]
    .toUpperCase()
    .slice(0, 6)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove accents
  
  const shortId = professionalId.slice(0, 4).toUpperCase();
  return `CHEQ-${shortName}${shortId}`;
}

/**
 * Parse UTM parameters from current URL
 */
export function parseUTMParams(url: string = window.location.href): {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
} {
  const urlObj = new URL(url);
  return {
    source: urlObj.searchParams.get('utm_source') || undefined,
    medium: urlObj.searchParams.get('utm_medium') || undefined,
    campaign: urlObj.searchParams.get('utm_campaign') || undefined,
    content: urlObj.searchParams.get('utm_content') || undefined,
  };
}

/**
 * Check if current visit came from a tracked link
 */
export function isTrackedVisit(): boolean {
  const params = parseUTMParams();
  return !!(params.source || params.campaign);
}

/**
 * Get attribution info for analytics
 */
export function getAttributionInfo(): {
  source: string;
  medium: string;
  campaign: string;
  professionalId?: string;
} {
  const params = parseUTMParams();
  const professionalId = params.campaign?.startsWith('pro_') 
    ? params.campaign.replace('pro_', '') 
    : undefined;
    
  return {
    source: params.source || 'direct',
    medium: params.medium || 'none',
    campaign: params.campaign || 'organic',
    professionalId,
  };
}
