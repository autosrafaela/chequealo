import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Share2, Instagram, MessageCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileShareCardProps {
  professional: {
    id: string;
    full_name: string;
    profession: string;
    location?: string;
    rating?: number;
    review_count?: number;
    image_url?: string;
    is_verified?: boolean;
  };
  trigger?: React.ReactNode;
}

export const ProfileShareCard = ({ professional, trigger }: ProfileShareCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
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
  };

  const generateProfileCard = async () => {
    setGenerating(true);
    
    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not found');
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Story dimensions (9:16 aspect ratio)
      canvas.width = 1080;
      canvas.height = 1920;

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(0.5, '#16213e');
      gradient.addColorStop(1, '#0f3460');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add subtle pattern overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      for (let i = 0; i < canvas.height; i += 60) {
        ctx.fillRect(0, i, canvas.width, 1);
      }

      // Add decorative circles
      ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
      ctx.beginPath();
      ctx.arc(-100, 400, 300, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'rgba(236, 72, 153, 0.1)';
      ctx.beginPath();
      ctx.arc(canvas.width + 100, 1400, 400, 0, Math.PI * 2);
      ctx.fill();

      // Draw profile photo with circular mask
      const photoSize = 400;
      const photoX = (canvas.width - photoSize) / 2;
      const photoY = 350;
      
      // Photo background circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2 + 10, 0, Math.PI * 2);
      const photoGradient = ctx.createLinearGradient(photoX, photoY, photoX + photoSize, photoY + photoSize);
      photoGradient.addColorStop(0, '#6366f1');
      photoGradient.addColorStop(1, '#ec4899');
      ctx.fillStyle = photoGradient;
      ctx.fill();
      ctx.restore();

      // Draw professional photo
      if (professional.image_url) {
        try {
          const img = await loadImage(professional.image_url);
          ctx.save();
          ctx.beginPath();
          ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img, photoX, photoY, photoSize, photoSize);
          ctx.restore();
        } catch {
          // Draw placeholder if image fails
          ctx.save();
          ctx.beginPath();
          ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
          ctx.fillStyle = '#4a5568';
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 120px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const initials = professional.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
          ctx.fillText(initials, photoX + photoSize / 2, photoY + photoSize / 2);
          ctx.restore();
        }
      } else {
        // Draw placeholder
        ctx.save();
        ctx.beginPath();
        ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#4a5568';
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 120px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const initials = professional.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        ctx.fillText(initials, photoX + photoSize / 2, photoY + photoSize / 2);
        ctx.restore();
      }

      // Verified badge
      if (professional.is_verified) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(photoX + photoSize - 30, photoY + photoSize - 30, 45, 0, Math.PI * 2);
        ctx.fillStyle = '#22c55e';
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✓', photoX + photoSize - 30, photoY + photoSize - 30);
        ctx.restore();
      }

      // Professional name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(professional.full_name, canvas.width / 2, photoY + photoSize + 60);

      // Profession
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '48px Arial';
      ctx.fillText(professional.profession, canvas.width / 2, photoY + photoSize + 150);

      // Location
      if (professional.location) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '40px Arial';
        ctx.fillText(`📍 ${professional.location}`, canvas.width / 2, photoY + photoSize + 220);
      }

      // Rating card
      if (professional.rating) {
        const ratingY = photoY + photoSize + 310;
        const cardWidth = 400;
        const cardHeight = 120;
        const cardX = (canvas.width - cardWidth) / 2;

        // Rating background
        ctx.save();
        roundRect(ctx, cardX, ratingY, cardWidth, cardHeight, 20);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fill();
        ctx.restore();

        // Stars
        ctx.fillStyle = '#fbbf24';
        ctx.font = '50px Arial';
        ctx.textAlign = 'center';
        const stars = '⭐'.repeat(Math.round(professional.rating));
        ctx.fillText(stars, canvas.width / 2, ratingY + 45);

        // Rating text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px Arial';
        ctx.fillText(`${professional.rating.toFixed(1)}/5`, canvas.width / 2 - 80, ratingY + 95);
        
        if (professional.review_count) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.font = '30px Arial';
          ctx.fillText(`(${professional.review_count} opiniones)`, canvas.width / 2 + 80, ratingY + 95);
        }
      }

      // Profile URL - prominently displayed
      const profileUrl = `chequealo.ar/professional/${professional.id}`;
      
      // URL Box background
      const urlBoxY = 1380;
      ctx.save();
      roundRect(ctx, 60, urlBoxY, canvas.width - 120, 100, 20);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Link icon and URL
      ctx.fillStyle = '#fff';
      ctx.font = '36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🔗 ' + profileUrl, canvas.width / 2, urlBoxY + 60);

      // CTA section
      const ctaY = 1520;
      
      // CTA background
      ctx.save();
      roundRect(ctx, 80, ctaY, canvas.width - 160, 160, 30);
      const ctaGradient = ctx.createLinearGradient(80, ctaY, canvas.width - 80, ctaY + 160);
      ctaGradient.addColorStop(0, '#6366f1');
      ctaGradient.addColorStop(1, '#8b5cf6');
      ctx.fillStyle = ctaGradient;
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 44px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('¡Contactá ahora!', canvas.width / 2, ctaY + 65);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '32px Arial';
      ctx.fillText('Visitá el link para ver el perfil completo', canvas.width / 2, ctaY + 120);

      // Chequealo branding at bottom
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('CHEQUEALO', canvas.width / 2, 1760);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '28px Arial';
      ctx.fillText('Profesionales verificados en Argentina', canvas.width / 2, 1820);

      // Generate data URL
      const dataUrl = canvas.toDataURL('image/png');
      setGeneratedImage(dataUrl);
      
      toast.success('¡Tarjeta generada! Descargala para compartir');
    } catch (error) {
      console.error('Error generating profile card:', error);
      toast.error('Error al generar la tarjeta');
    } finally {
      setGenerating(false);
    }
  };

  const getProfileUrl = () => {
    return `${window.location.origin}/professional/${professional.id}`;
  };

  const downloadImage = async () => {
    if (!generatedImage) return;
    
    // Copy profile URL to clipboard
    const profileUrl = getProfileUrl();
    try {
      await navigator.clipboard.writeText(profileUrl);
    } catch (err) {
      console.log('Could not copy URL to clipboard');
    }
    
    const link = document.createElement('a');
    link.download = `perfil-${professional.full_name.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = generatedImage;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Imagen descargada y link copiado. ¡Pegá el link en tu historia!', {
      duration: 5000,
    });
  };

  const shareToWhatsAppStatus = async () => {
    if (!generatedImage) {
      generateProfileCard();
      return;
    }
    
    // WhatsApp Status requires downloading the image first
    await downloadImage();
    toast.success('Imagen descargada y link copiado. Abrí WhatsApp → Estado → Pegá el link junto a la imagen', {
      duration: 6000,
    });
  };

  const shareToInstagramStory = async () => {
    if (!generatedImage) {
      generateProfileCard();
      return;
    }

    // Try Web Share API with files on mobile
    if (navigator.share && navigator.canShare) {
      try {
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const file = new File([blob], `perfil-${professional.full_name}.png`, { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `${professional.full_name} - ${professional.profession}`,
          });
          toast.success('¡Compartiendo en Instagram!');
          return;
        }
      } catch (error) {
        console.log('Web Share failed, falling back to download');
      }
    }

    // Fallback: download image
    await downloadImage();
    toast.success('Imagen descargada y link copiado. Abrí Instagram → Historia → Pegá el link con el sticker de enlace', {
      duration: 6000,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Compartir en Stories
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartir Perfil en Stories
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Hidden canvas for generation */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {/* Preview */}
          <div className="relative aspect-[9/16] bg-muted rounded-lg overflow-hidden max-h-[400px]">
            {generatedImage ? (
              <img 
                src={generatedImage} 
                alt="Preview de tarjeta" 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
                <Share2 className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-sm">
                  Generá una tarjeta de perfil para compartir en WhatsApp Status o Instagram Stories
                </p>
              </div>
            )}
          </div>

          {/* Generate button */}
          {!generatedImage && (
            <Button 
              onClick={generateProfileCard} 
              disabled={generating}
              className="w-full"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Generar Tarjeta de Perfil
                </>
              )}
            </Button>
          )}

          {/* Share buttons */}
          {generatedImage && (
            <div className="space-y-3">
              <Button 
                onClick={shareToWhatsAppStatus}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Compartir en WhatsApp Status
              </Button>
              
              <Button 
                onClick={shareToInstagramStory}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Instagram className="h-4 w-4 mr-2" />
                Compartir en Instagram Story
              </Button>
              
              <Button 
                onClick={downloadImage}
                variant="outline"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar Imagen
              </Button>

              <Button 
                onClick={() => {
                  setGeneratedImage(null);
                }}
                variant="ghost"
                className="w-full text-muted-foreground"
              >
                Regenerar tarjeta
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            La tarjeta incluye tu foto, nombre, profesión, ubicación y rating para que tus seguidores vean tu perfil completo.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
