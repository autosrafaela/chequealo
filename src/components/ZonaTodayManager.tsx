import { useState, useRef } from 'react';
import { MapPin, Clock, Download, Share2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useProRoutes } from '@/hooks/useProRoutes';
import { toast } from 'sonner';

const POPULAR_NEIGHBORHOODS = [
  'Centro', 'Norte', 'Sur', 'Este', 'Oeste',
  'Microcentro', 'Palermo', 'Belgrano', 'Recoleta', 
  'Caballito', 'Flores', 'Villa Crespo', 'Almagro',
  'San Telmo', 'La Boca', 'Barracas', 'Boedo'
];

interface ZonaTodayManagerProps {
  professionalName: string;
  profession: string;
  phone?: string;
}

export const ZonaTodayManager = ({ professionalName, profession, phone }: ZonaTodayManagerProps) => {
  const { todayRoute, isLoading, activateRoute, deactivateRoute, isBoostActive } = useProRoutes();
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
  const [customNeighborhood, setCustomNeighborhood] = useState('');
  const [showStoryPreview, setShowStoryPreview] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const toggleNeighborhood = (neighborhood: string) => {
    setSelectedNeighborhoods(prev => 
      prev.includes(neighborhood)
        ? prev.filter(n => n !== neighborhood)
        : [...prev, neighborhood]
    );
  };

  const addCustomNeighborhood = () => {
    if (customNeighborhood.trim() && !selectedNeighborhoods.includes(customNeighborhood.trim())) {
      setSelectedNeighborhoods(prev => [...prev, customNeighborhood.trim()]);
      setCustomNeighborhood('');
    }
  };

  const handleActivate = () => {
    if (selectedNeighborhoods.length === 0) {
      toast.error('Seleccioná al menos un barrio');
      return;
    }
    activateRoute.mutate(selectedNeighborhoods);
  };

  const generateStoryImage = async () => {
    const neighborhoods = todayRoute?.neighborhoods || selectedNeighborhoods;
    if (neighborhoods.length === 0) {
      toast.error('Activá primero tu zona');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for IG Story (1080x1920)
    canvas.width = 1080;
    canvas.height = 1920;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add decorative elements
    ctx.fillStyle = 'rgba(255, 193, 7, 0.1)';
    ctx.beginPath();
    ctx.arc(100, 300, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(980, 1600, 250, 0, Math.PI * 2);
    ctx.fill();

    // Header badge
    ctx.fillStyle = '#FFC107';
    roundRect(ctx, 340, 200, 400, 60, 30);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('📍 EN TU ZONA HOY', 540, 242);

    // Professional name
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 72px Arial';
    ctx.fillText(professionalName, 540, 450);

    // Profession
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '42px Arial';
    ctx.fillText(profession, 540, 520);

    // "Hoy trabajo en:" title
    ctx.fillStyle = '#FFC107';
    ctx.font = 'bold 48px Arial';
    ctx.fillText('Hoy trabajo en:', 540, 700);

    // Neighborhoods list
    ctx.fillStyle = '#fff';
    ctx.font = '44px Arial';
    let yPos = 800;
    neighborhoods.forEach((neighborhood, index) => {
      ctx.fillText(`• ${neighborhood}`, 540, yPos);
      yPos += 70;
    });

    // CTA section
    const ctaY = 1400;
    ctx.fillStyle = '#25D366';
    roundRect(ctx, 190, ctaY, 700, 100, 50);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 40px Arial';
    ctx.fillText('📲 Contactame por WhatsApp', 540, ctaY + 65);

    // Phone number if available
    if (phone) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '36px Arial';
      ctx.fillText(phone, 540, ctaY + 150);
    }

    // Footer - Chequealo branding
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '28px Arial';
    ctx.fillText('Verificado por Chequealo.com', 540, 1820);

    setShowStoryPreview(true);
  };

  const downloadStory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `en-tu-zona-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('Imagen descargada. ¡Subila a tu story!');
  };

  // Helper function for rounded rectangles
  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  const getRemainingTime = () => {
    if (!todayRoute?.boost_expires_at) return null;
    const expires = new Date(todayRoute.boost_expires_at);
    const now = new Date();
    const diff = expires.getTime() - now.getTime();
    if (diff <= 0) return null;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />;
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Estoy en tu zona hoy
            </CardTitle>
            <CardDescription>
              Activá los barrios donde trabajás hoy y aumentá tu visibilidad
            </CardDescription>
          </div>
          {isBoostActive && (
            <Badge className="bg-amber-500 text-black animate-pulse">
              <Clock className="h-3 w-3 mr-1" />
              {getRemainingTime()} restantes
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isBoostActive && todayRoute ? (
          <div className="space-y-4">
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="font-medium text-amber-600 dark:text-amber-400 mb-2">
                ¡Estás visible en estos barrios!
              </p>
              <div className="flex flex-wrap gap-2">
                {todayRoute.neighborhoods.map(n => (
                  <Badge key={n} variant="secondary" className="bg-amber-500/20">
                    {n}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={generateStoryImage}
                className="flex-1"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Generar Story para IG/FB
              </Button>
              <Button 
                onClick={() => deactivateRoute.mutate()}
                variant="destructive"
                size="icon"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Barrios populares:
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_NEIGHBORHOODS.map(neighborhood => (
                  <Badge
                    key={neighborhood}
                    variant={selectedNeighborhoods.includes(neighborhood) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={() => toggleNeighborhood(neighborhood)}
                  >
                    {selectedNeighborhoods.includes(neighborhood) && (
                      <Check className="h-3 w-3 mr-1" />
                    )}
                    {neighborhood}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Agregar otro barrio..."
                value={customNeighborhood}
                onChange={(e) => setCustomNeighborhood(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomNeighborhood()}
              />
              <Button variant="outline" onClick={addCustomNeighborhood}>
                Agregar
              </Button>
            </div>

            {selectedNeighborhoods.length > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Seleccionados:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedNeighborhoods.map(n => (
                    <Badge 
                      key={n} 
                      className="cursor-pointer"
                      onClick={() => toggleNeighborhood(n)}
                    >
                      {n}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button 
              onClick={handleActivate}
              disabled={selectedNeighborhoods.length === 0 || activateRoute.isPending}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black"
            >
              <MapPin className="h-4 w-4 mr-2" />
              {activateRoute.isPending ? 'Activando...' : 'Activar "En tu zona hoy" (7 horas)'}
            </Button>
          </div>
        )}

        {/* Hidden canvas for story generation */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Story preview modal */}
        {showStoryPreview && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg p-4 max-w-sm w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Vista previa de Story</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowStoryPreview(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="aspect-[9/16] bg-muted rounded-lg overflow-hidden mb-4">
                <canvas 
                  ref={canvasRef} 
                  className="w-full h-full object-contain"
                  style={{ display: 'block' }}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={downloadStory} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowStoryPreview(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
