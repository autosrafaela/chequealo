import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Globe, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { SitemapGenerator } from '@/utils/sitemapGenerator';
import { toast } from 'sonner';

export const SitemapManager = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [professionalCount, setProfessionalCount] = useState<number | null>(null);
  const [sitemapPreview, setSitemapPreview] = useState<string>('');

  const handleGenerateSitemap = async () => {
    setIsGenerating(true);
    try {
      const sitemap = await SitemapGenerator.generateSitemap();
      setSitemapPreview(sitemap);
      
      // Count URLs in sitemap
      const urlCount = (sitemap.match(/<url>/g) || []).length;
      
      toast.success(`Sitemap generado exitosamente con ${urlCount} URLs`);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      toast.error('Error al generar el sitemap');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadSitemap = async () => {
    try {
      await SitemapGenerator.downloadSitemap();
      toast.success('Sitemap descargado exitosamente');
    } catch (error) {
      console.error('Error downloading sitemap:', error);
      toast.error('Error al descargar el sitemap');
    }
  };

  const handleDownloadRobots = () => {
    const robotsContent = SitemapGenerator.generateRobotsTxt();
    const blob = new Blob([robotsContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'robots.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success('robots.txt descargado exitosamente');
  };

  const handleGetProfessionalUrls = async () => {
    try {
      const urls = await SitemapGenerator.getProfessionalUrls();
      setProfessionalCount(urls.length);
      toast.success(`Encontradas ${urls.length} URLs de profesionales`);
    } catch (error) {
      console.error('Error fetching professional URLs:', error);
      toast.error('Error al obtener URLs de profesionales');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Gestión de SEO y Sitemap
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">URLs de Profesionales</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {professionalCount !== null ? professionalCount : '-'}
                  </p>
                </div>
                <Globe className="h-8 w-8 text-blue-500" />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGetProfessionalUrls}
                className="mt-2 text-blue-600 border-blue-200"
              >
                Actualizar
              </Button>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Estado del Sitemap</p>
                  <div className="flex items-center gap-2 mt-1">
                    {sitemapPreview ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-700">Generado</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-orange-700">Pendiente</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleGenerateSitemap}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                {isGenerating ? 'Generando...' : 'Generar Sitemap'}
              </Button>

              <Button
                variant="outline"
                onClick={handleDownloadSitemap}
                disabled={!sitemapPreview}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar Sitemap.xml
              </Button>

              <Button
                variant="outline"
                onClick={handleDownloadRobots}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar robots.txt
              </Button>
            </div>

            {/* SEO Tips */}
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-lg text-yellow-800">Consejos de SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-yellow-700">
                <p>• Sube el sitemap.xml a Google Search Console después de descargarlo</p>
                <p>• Actualiza el sitemap regularmente cuando agregues nuevos profesionales</p>
                <p>• Asegúrate de que todos los profesionales tengan descripciones únicas</p>
                <p>• Las páginas de profesionales ya tienen datos estructurados (Schema.org)</p>
                <p>• Cada perfil profesional es indexable individualmente</p>
              </CardContent>
            </Card>
          </div>

          {/* Sitemap Preview */}
          {sitemapPreview && (
            <div className="space-y-2">
              <h4 className="font-medium">Vista Previa del Sitemap</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-xs overflow-auto max-h-40 text-gray-600">
                  {sitemapPreview.substring(0, 1000)}
                  {sitemapPreview.length > 1000 && '...'}
                </pre>
              </div>
              <Badge variant="secondary" className="text-xs">
                {sitemapPreview.split('\n').length} líneas
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};