import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE_URL = 'https://chequealo.net';

const STATIC_PAGES = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/search', changefreq: 'daily', priority: '0.9' },
  { loc: '/register', changefreq: 'monthly', priority: '0.8' },
  { loc: '/how-it-works', changefreq: 'monthly', priority: '0.8' },
  { loc: '/pricing', changefreq: 'monthly', priority: '0.8' },
  { loc: '/faq', changefreq: 'monthly', priority: '0.7' },
  { loc: '/ai-search', changefreq: 'weekly', priority: '0.7' },
  { loc: '/install', changefreq: 'monthly', priority: '0.6' },
  { loc: '/terms', changefreq: 'yearly', priority: '0.5' },
  { loc: '/privacy', changefreq: 'yearly', priority: '0.5' },
  { loc: '/login', changefreq: 'monthly', priority: '0.5' },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const today = new Date().toISOString().split('T')[0];

    // Build static URLs
    const urls: string[] = STATIC_PAGES.map(page => `  <url>
    <loc>${BASE_URL}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);

    // Fetch all active professionals with slug info
    const { data: professionals, error } = await supabase
      .from('professionals')
      .select('id, slug, updated_at')
      .eq('is_blocked', false);

    if (error) {
      console.error('[generate-sitemap] Error fetching professionals:', error);
    }

    if (professionals && professionals.length > 0) {
      for (const prof of professionals) {
        const profUrl = prof.slug
          ? `${BASE_URL}/${prof.slug}`
          : `${BASE_URL}/professional/${prof.id}`;
        const lastmod = prof.updated_at
          ? new Date(prof.updated_at).toISOString().split('T')[0]
          : today;

        urls.push(`  <url>
    <loc>${profUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    console.log(`[generate-sitemap] Generated sitemap with ${urls.length} URLs (${professionals?.length ?? 0} professionals)`);

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
      status: 200,
    });
  } catch (error) {
    console.error('[generate-sitemap] Error:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <priority>1.0</priority>
  </url>
</urlset>`,
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml; charset=utf-8',
        },
        status: 200,
      }
    );
  }
});
