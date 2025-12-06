import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Share2, Instagram, MessageCircle, Loader2, Link2, Copy, Check } from 'lucide-react';
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
  const [linkCopied, setLinkCopied] = useState(false);

  const getProfileUrl = () => {
    return `${window.location.origin}/professional/${professional.id}`;
  };

  const copyLinkToClipboard = async () => {
    const profileUrl = getProfileUrl();
    try {
      await navigator.clipboard.writeText(profileUrl);
      setLinkCopied(true);
      toast.success('¡Link copiado! Ahora pegalo como sticker de enlace');
      setTimeout(() => setLinkCopied(false), 3000);
    } catch (err) {
      toast.error('No se pudo copiar el link');
    }
  };

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

      // CTA section - clean design without URL text
      const ctaY = 1400;
      
      // CTA background
      ctx.save();
      roundRect(ctx, 80, ctaY, canvas.width - 160, 200, 30);
      const ctaGradient = ctx.createLinearGradient(80, ctaY, canvas.width - 80, ctaY + 200);
      ctaGradient.addColorStop(0, '#6366f1');
      ctaGradient.addColorStop(1, '#8b5cf6');
      ctx.fillStyle = ctaGradient;
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 52px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('¡Contactame!', canvas.width / 2, ctaY + 80);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '36px Arial';
      ctx.fillText('Tocá el link de esta historia', canvas.width / 2, ctaY + 140);
      
      // Arrow pointing up (where link sticker would go)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '48px Arial';
      ctx.fillText('👆', canvas.width / 2, ctaY + 190);

      // Chequealo branding at bottom
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 56px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('CHEQUEALO', canvas.width / 2, 1720);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '32px Arial';
      ctx.fillText('Profesionales verificados', canvas.width / 2, 1790);
      
      // Website hint
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '28px Arial';
      ctx.fillText('chequealo.ar', canvas.width / 2, 1850);

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

  const downloadImage = async () => {
    if (!generatedImage) return;
    
    // Copy profile URL to clipboard
    const profileUrl = getProfileUrl();
    try {
      await navigator.clipboard.writeText(profileUrl);
      setLinkCopied(true);
    } catch (err) {
      console.log('Could not copy URL to clipboard');
    }
    
    const link = document.createElement('a');
    link.download = `perfil-${professional.full_name.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = generatedImage;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Imagen descargada y link copiado. ¡Pegalo como sticker de enlace!', {
      duration: 5000,
    });
  };

  const shareToWhatsAppStatus = async () => {
    if (!generatedImage) {
      generateProfileCard();
      return;
    }
    
    // Download image first
    await downloadImage();
    
    // Open WhatsApp app
    setTimeout(() => {
      window.location.href = 'whatsapp://';
    }, 500);
    
    toast.success('Imagen descargada y link copiado. Subí la imagen a tu Estado y pegá el link', {
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

    // Fallback: download image and open Instagram
    await downloadImage();
    
    // Open Instagram app
    setTimeout(() => {
      window.location.href = 'instagram://';
    }, 500);
    
    toast.success('Imagen descargada y link copiado. Subila a tu Historia y pegá el link', {
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
              {/* Copy Link Button - prominently displayed */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Link2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <p className="text-sm">
                  <strong>Paso importante:</strong> Copiá el link y pegalo como <strong>sticker de enlace</strong> en tu historia para que sea clickeable.
                </p>
              </div>
              
              <Button 
                onClick={copyLinkToClipboard}
                variant="secondary"
                className="w-full"
              >
                {linkCopied ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    ¡Link copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Link del Perfil
                  </>
                )}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={shareToWhatsAppStatus}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  WhatsApp
                </Button>
                
                <Button 
                  onClick={shareToInstagramStory}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  size="sm"
                >
                  <Instagram className="h-4 w-4 mr-1" />
                  Instagram
                </Button>
              </div>
              
              <Button 
                onClick={downloadImage}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Solo descargar imagen
              </Button>

              <Button 
                onClick={() => {
                  setGeneratedImage(null);
                  setLinkCopied(false);
                }}
                variant="ghost"
                className="w-full text-muted-foreground"
                size="sm"
              >
                Regenerar tarjeta
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Usá el <strong>sticker de enlace</strong> en Instagram/WhatsApp para que tus seguidores puedan tocar y ver tu perfil.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
