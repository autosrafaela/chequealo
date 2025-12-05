import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Download, Instagram, Sparkles, Image as ImageIcon, Video, Star, Clock, Percent, Wrench } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WorkPhoto {
  id: string;
  image_url: string;
  caption?: string;
  work_type?: string;
  is_before_after?: boolean;
  before_image_url?: string;
  after_image_url?: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  bgGradient: string;
  textColor: string;
}

const templates: Template[] = [
  {
    id: 'before_after',
    name: 'Antes/Después',
    description: 'Mostrá la transformación de tu trabajo',
    icon: <Sparkles className="h-5 w-5" />,
    bgGradient: 'from-blue-600 to-purple-600',
    textColor: 'text-white'
  },
  {
    id: 'testimonial',
    name: 'Testimonio',
    description: 'Compartí lo que dicen tus clientes',
    icon: <Star className="h-5 w-5" />,
    bgGradient: 'from-amber-500 to-orange-600',
    textColor: 'text-white'
  },
  {
    id: 'promo',
    name: 'Promo -10% con Seña',
    description: 'Oferta especial para nuevos clientes',
    icon: <Percent className="h-5 w-5" />,
    bgGradient: 'from-green-500 to-emerald-600',
    textColor: 'text-white'
  },
  {
    id: 'urgencies',
    name: 'Urgencias 24/7',
    description: 'Destacá tu disponibilidad',
    icon: <Clock className="h-5 w-5" />,
    bgGradient: 'from-red-500 to-rose-600',
    textColor: 'text-white'
  }
];

interface SocialContentGeneratorProps {
  professional: {
    full_name: string;
    profession: string;
    phone?: string;
    location?: string;
    image_url?: string;
  };
  workPhoto?: WorkPhoto;
  trigger?: React.ReactNode;
}

export const SocialContentGenerator = ({ professional, workPhoto, trigger }: SocialContentGeneratorProps) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('before_after');
  const [customText, setCustomText] = useState('');
  const [testimonialText, setTestimonialText] = useState('');
  const [clientName, setClientName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const generateStoryImage = async () => {
    setGenerating(true);
    
    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not found');
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Story dimensions (9:16 aspect ratio)
      canvas.width = 1080;
      canvas.height = 1920;

      const template = templates.find(t => t.id === selectedTemplate);
      if (!template) throw new Error('Template not found');

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      
      switch (template.id) {
        case 'before_after':
          gradient.addColorStop(0, '#2563eb');
          gradient.addColorStop(1, '#9333ea');
          break;
        case 'testimonial':
          gradient.addColorStop(0, '#f59e0b');
          gradient.addColorStop(1, '#ea580c');
          break;
        case 'promo':
          gradient.addColorStop(0, '#22c55e');
          gradient.addColorStop(1, '#059669');
          break;
        case 'urgencies':
          gradient.addColorStop(0, '#ef4444');
          gradient.addColorStop(1, '#e11d48');
          break;
        default:
          gradient.addColorStop(0, '#3b82f6');
          gradient.addColorStop(1, '#8b5cf6');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add subtle pattern overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let i = 0; i < canvas.height; i += 40) {
        ctx.fillRect(0, i, canvas.width, 1);
      }

      // Draw work photo if available
      if (workPhoto?.image_url) {
        try {
          const img = await loadImage(workPhoto.image_url);
          const photoY = 300;
          const photoHeight = 800;
          const photoWidth = canvas.width - 100;
          
          // Draw photo with rounded corners effect
          ctx.save();
          ctx.beginPath();
          roundRect(ctx, 50, photoY, photoWidth, photoHeight, 30);
          ctx.clip();
          
          // Calculate aspect ratio to fit image
          const scale = Math.max(photoWidth / img.width, photoHeight / img.height);
          const x = 50 + (photoWidth - img.width * scale) / 2;
          const y = photoY + (photoHeight - img.height * scale) / 2;
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          ctx.restore();
          
          // Add shadow effect
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 20;
          ctx.shadowOffsetY = 10;
        } catch (e) {
          console.error('Error loading work photo:', e);
        }
      }

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Draw template-specific content
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';

      switch (template.id) {
        case 'before_after':
          ctx.font = 'bold 72px system-ui';
          ctx.fillText('✨ TRANSFORMACIÓN', canvas.width / 2, 200);
          ctx.font = '48px system-ui';
          ctx.fillText('Antes → Después', canvas.width / 2, 270);
          break;
          
        case 'testimonial':
          ctx.font = 'bold 64px system-ui';
          ctx.fillText('⭐ CLIENTE SATISFECHO', canvas.width / 2, 200);
          if (testimonialText) {
            ctx.font = 'italic 40px system-ui';
            wrapText(ctx, `"${testimonialText}"`, canvas.width / 2, 1200, canvas.width - 120, 50);
          }
          if (clientName) {
            ctx.font = '36px system-ui';
            ctx.fillText(`- ${clientName}`, canvas.width / 2, 1400);
          }
          break;
          
        case 'promo':
          ctx.font = 'bold 100px system-ui';
          ctx.fillText('🎉 -10%', canvas.width / 2, 180);
          ctx.font = 'bold 56px system-ui';
          ctx.fillText('CON SEÑA', canvas.width / 2, 260);
          ctx.font = '40px system-ui';
          ctx.fillText('¡Reservá tu turno hoy!', canvas.width / 2, 1200);
          break;
          
        case 'urgencies':
          ctx.font = 'bold 72px system-ui';
          ctx.fillText('🚨 URGENCIAS 24/7', canvas.width / 2, 180);
          ctx.font = '48px system-ui';
          ctx.fillText('Atención inmediata', canvas.width / 2, 260);
          break;
      }

      // Draw professional info at bottom
      const bottomY = 1500;
      
      // Professional name
      ctx.font = 'bold 56px system-ui';
      ctx.fillText(professional.full_name, canvas.width / 2, bottomY);
      
      // Profession
      ctx.font = '40px system-ui';
      ctx.fillText(professional.profession, canvas.width / 2, bottomY + 60);
      
      // Phone/Contact
      if (professional.phone) {
        ctx.font = '36px system-ui';
        ctx.fillText(`📱 ${professional.phone}`, canvas.width / 2, bottomY + 120);
      }

      // Location
      if (professional.location) {
        ctx.font = '32px system-ui';
        ctx.fillText(`📍 ${professional.location}`, canvas.width / 2, bottomY + 170);
      }

      // Chequealo branding
      ctx.font = 'bold 32px system-ui';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('Verificado por Chequealo ✓', canvas.width / 2, 1850);

      // Custom text if provided
      if (customText) {
        ctx.font = '36px system-ui';
        ctx.fillStyle = 'white';
        wrapText(ctx, customText, canvas.width / 2, 1300, canvas.width - 100, 45);
      }

      // Convert canvas to image
      const dataUrl = canvas.toDataURL('image/png');
      setGeneratedImage(dataUrl);
      
      toast({
        title: "¡Story generado!",
        description: "Tu contenido está listo para descargar",
      });
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Error",
        description: "No se pudo generar la imagen",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.download = `chequealo-story-${Date.now()}.png`;
    link.href = generatedImage;
    link.click();
    
    toast({
      title: "¡Descargado!",
      description: "Subilo a tu Instagram o Facebook",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Instagram className="h-4 w-4" />
            Generar Story
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Auto-publicador de Contenido
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Template Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Elegí una plantilla</Label>
            <div className="grid grid-cols-2 gap-3">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    selectedTemplate === template.id
                      ? 'ring-2 ring-primary shadow-lg'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <CardContent className={`p-4 bg-gradient-to-br ${template.bgGradient} rounded-lg`}>
                    <div className="text-white">
                      {template.icon}
                      <p className="font-semibold mt-2 text-sm">{template.name}</p>
                      <p className="text-xs opacity-80">{template.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Template-specific inputs */}
            <div className="space-y-3 mt-4">
              {selectedTemplate === 'testimonial' && (
                <>
                  <div>
                    <Label>Testimonio del cliente</Label>
                    <Textarea
                      value={testimonialText}
                      onChange={(e) => setTestimonialText(e.target.value)}
                      placeholder="Excelente trabajo, muy profesional..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Nombre del cliente</Label>
                    <Input
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Juan P."
                      className="mt-1"
                    />
                  </div>
                </>
              )}

              <div>
                <Label>Texto adicional (opcional)</Label>
                <Textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Agregá información extra..."
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              onClick={generateStoryImage}
              disabled={generating}
              className="w-full mt-4"
            >
              {generating ? (
                <>Generando...</>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generar Story
                </>
              )}
            </Button>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Vista previa</Label>
            <div className="bg-muted rounded-lg p-4 flex items-center justify-center min-h-[400px]">
              {generatedImage ? (
                <div className="space-y-4">
                  <img
                    src={generatedImage}
                    alt="Generated story"
                    className="max-h-[350px] rounded-lg shadow-lg mx-auto"
                  />
                  <div className="flex gap-2 justify-center">
                    <Button onClick={downloadImage} className="gap-2">
                      <Download className="h-4 w-4" />
                      Descargar
                    </Button>
                    <Button variant="outline" onClick={() => setGeneratedImage(null)}>
                      Generar otro
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Formato: 1080x1920px (Story/Reel)
                  </p>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Seleccioná una plantilla y hacé clic en "Generar Story"</p>
                </div>
              )}
            </div>

            {workPhoto && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm font-medium mb-2">Foto seleccionada:</p>
                <img
                  src={workPhoto.image_url}
                  alt="Work photo"
                  className="h-20 w-20 object-cover rounded"
                />
              </div>
            )}
          </div>
        </div>

        {/* Hidden canvas for generation */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </DialogContent>
    </Dialog>
  );
};

// Helper functions
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}

export default SocialContentGenerator;
