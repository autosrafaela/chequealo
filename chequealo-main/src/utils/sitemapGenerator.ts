import { supabase } from '@/integrations/supabase/client';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

export class SitemapGenerator {
  private static baseUrl = window.location.origin;

  static async generateSitemap(): Promise<string> {
    const urls: SitemapUrl[] = [];

    // Add static pages
    urls.push({
      loc: `${this.baseUrl}/`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'daily',
      priority: '1.0'
    });

    urls.push({
      loc: `${this.baseUrl}/search`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'daily',
      priority: '0.9'
    });

    urls.push({
      loc: `${this.baseUrl}/auth`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: '0.5'
    });

    urls.push({
      loc: `${this.baseUrl}/register`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: '0.6'
    });

    try {
      // Add professional pages
      const { data: professionals, error } = await supabase
        .from('professionals_public')
        .select('id, updated_at')
        .eq('is_verified', true);

      if (!error && professionals) {
        professionals.forEach(professional => {
          urls.push({
            loc: `${this.baseUrl}/professional/${professional.id}`,
            lastmod: professional.updated_at ? new Date(professional.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: '0.8'
          });
        });
      }
    } catch (error) {
      console.error('Error fetching professionals for sitemap:', error);
    }

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return xml;
  }

  static async downloadSitemap(): Promise<void> {
    try {
      const sitemap = await this.generateSitemap();
      const blob = new Blob([sitemap], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sitemap.xml';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      throw error;
    }
  }

  static async getProfessionalUrls(): Promise<string[]> {
    try {
      const { data: professionals, error } = await supabase
        .from('professionals_public')
        .select('id, full_name, profession, location')
        .eq('is_verified', true);

      if (error || !professionals) return [];

      return professionals.map(prof => `${this.baseUrl}/professional/${prof.id}`);
    } catch (error) {
      console.error('Error fetching professional URLs:', error);
      return [];
    }
  }

  static generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${this.baseUrl}/sitemap.xml

# Disallow admin areas
Disallow: /admin
Disallow: /dashboard
Disallow: /user-dashboard

# Crawl delay
Crawl-delay: 1`;
  }
}