import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Share2, Loader2, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';
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

interface ShareOptionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  colorClass?: string;
}

const ShareOption = ({ icon, label, onClick, colorClass = "bg-muted" }: ShareOptionProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${colorClass}`}
  >
    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center">
      {icon}
    </div>
    <span className="font-medium text-foreground">{label}</span>
  </button>
);

const SectionHeader = ({ label }: { label: string }) => (
  <div className="flex items-center gap-2 pt-4 pb-2">
    <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">{label}</span>
    <div className="flex-1 h-px bg-border" />
  </div>
);

// Social media icons as SVG components
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="url(#instagram-gradient)">
    <defs>
      <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FFDC80" />
        <stop offset="25%" stopColor="#F77737" />
        <stop offset="50%" stopColor="#F56040" />
        <stop offset="75%" stopColor="#C13584" />
        <stop offset="100%" stopColor="#833AB4" />
      </linearGradient>
    </defs>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#25D366">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#000000">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export const ProfileShareCard = ({ professional, trigger }: ProfileShareCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const getProfileUrl = () => {
    // Always use https:// for better compatibility with WhatsApp/Instagram link detection
    return `https://chequealo.ar/professional/${professional.id}`;
  };

  const copyLinkToClipboard = async () => {
    const profileUrl = getProfileUrl();
    try {
      await navigator.clipboard.writeText(profileUrl);
      setLinkCopied(true);
      toast.success('¡Link copiado al portapapeles!');
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

      // Professional name - UPPERCASE for cleaner look
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(professional.full_name.toUpperCase(), canvas.width / 2, photoY + photoSize + 60);

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

      // CTA section
      const ctaY = 1400;
      
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
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '28px Arial';
      ctx.fillText('chequealo.ar', canvas.width / 2, 1850);

      const dataUrl = canvas.toDataURL('image/png');
      setGeneratedImage(dataUrl);
      
      toast.success('¡Imagen generada!');
    } catch (error) {
      console.error('Error generating profile card:', error);
      toast.error('Error al generar la imagen');
    } finally {
      setGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!generatedImage) return;
    
    try {
      await navigator.clipboard.writeText(getProfileUrl());
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
    
    toast.success('Imagen descargada y link copiado');
  };

  // Share functions
  const shareToInstagramStory = async () => {
    if (!generatedImage) {
      await generateProfileCard();
    }
    
    if (navigator.share && navigator.canShare) {
      try {
        const response = await fetch(generatedImage!);
        const blob = await response.blob();
        const file = new File([blob], `perfil-${professional.full_name}.png`, { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file] });
          toast.success('¡Compartiendo en Instagram!');
          return;
        }
      } catch (error) {
        console.log('Web Share failed, falling back to download');
      }
    }

    await downloadImage();
    setTimeout(() => { window.location.href = 'instagram://'; }, 500);
    toast.success('Imagen descargada. Subila a tu Historia');
  };

  const shareToFacebookStory = async () => {
    if (!generatedImage) {
      await generateProfileCard();
    }
    
    if (navigator.share && navigator.canShare) {
      try {
        const response = await fetch(generatedImage!);
        const blob = await response.blob();
        const file = new File([blob], `perfil-${professional.full_name}.png`, { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file] });
          return;
        }
      } catch (error) {
        console.log('Web Share failed');
      }
    }

    await downloadImage();
    toast.success('Imagen descargada. Subila a tu Historia de Facebook');
  };

  const sendToWhatsAppContact = () => {
    const profileUrl = getProfileUrl();
    const message = `¡Mirá el perfil de ${professional.full_name.toUpperCase()}! ${professional.profession} en Chequealo 🔗 ${profileUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareToWhatsAppStatus = async () => {
    if (!generatedImage) {
      await generateProfileCard();
    }
    
    if (navigator.share && navigator.canShare) {
      try {
        const response = await fetch(generatedImage!);
        const blob = await response.blob();
        const file = new File([blob], `perfil-${professional.full_name}.png`, { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          const profileUrl = getProfileUrl();
          await navigator.clipboard.writeText(profileUrl);
          await navigator.share({
            files: [file],
            text: `Mirá el perfil de ${professional.full_name.toUpperCase()} en Chequealo 🔗 ${profileUrl}`,
          });
          toast.success('¡Link copiado! Pegalo en tu Estado');
          return;
        }
      } catch (error) {
        console.log('Web Share failed');
      }
    }

    await downloadImage();
    toast.success('Imagen descargada. Subila a tu Estado de WhatsApp');
  };

  const shareToFacebookPost = () => {
    const profileUrl = getProfileUrl();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const profileUrl = getProfileUrl();
    const text = `Mirá el perfil de ${professional.full_name.toUpperCase()} en @Chequealo`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(profileUrl)}`, '_blank', 'width=600,height=400');
  };

  const openNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${professional.full_name.toUpperCase()} - ${professional.profession}`,
          text: `Profesional verificado en Chequealo`,
          url: getProfileUrl(),
        });
      } catch (error) {
        toast.error('No se pudo abrir el menú de compartir');
      }
    } else {
      copyLinkToClipboard();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Compartir
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-center">
            Compartir en Redes Sociales
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center">
            Compartí este perfil y aumentá su visibilidad
          </p>
        </DialogHeader>
        
        <div className="space-y-1">
          {/* Hidden canvas for generation */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {/* IMAGEN CON IA */}
          <SectionHeader label="IMAGEN CON IA" />
          <ShareOption
            icon={
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                {generating ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Sparkles className="w-5 h-5 text-white" />}
              </div>
            }
            label={generating ? "Generando..." : "Generar imagen para Stories"}
            onClick={generateProfileCard}
            colorClass="bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-500/20"
          />
          
          {/* HISTORIAS */}
          <SectionHeader label="HISTORIAS" />
          <div className="space-y-2">
            <ShareOption
              icon={
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center p-2">
                  <InstagramIcon />
                </div>
              }
              label="Instagram Story"
              onClick={shareToInstagramStory}
              colorClass="bg-muted/50 hover:bg-muted border border-border/50"
            />
            <ShareOption
              icon={
                <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center">
                  <FacebookIcon />
                </div>
              }
              label="Facebook Story"
              onClick={shareToFacebookStory}
              colorClass="bg-muted/50 hover:bg-muted border border-border/50"
            />
          </div>
          
          {/* WHATSAPP */}
          <SectionHeader label="WHATSAPP" />
          <div className="space-y-2">
            <ShareOption
              icon={
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
                  <WhatsAppIcon />
                </div>
              }
              label="Enviar a contacto"
              onClick={sendToWhatsAppContact}
              colorClass="bg-muted/50 hover:bg-muted border border-border/50"
            />
            <ShareOption
              icon={
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
                  <WhatsAppIcon />
                </div>
              }
              label="Compartir en Estado"
              onClick={shareToWhatsAppStatus}
              colorClass="bg-muted/50 hover:bg-muted border border-border/50"
            />
          </div>
          
          {/* OTRAS REDES */}
          <SectionHeader label="OTRAS REDES" />
          <div className="space-y-2">
            <ShareOption
              icon={
                <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center">
                  <FacebookIcon />
                </div>
              }
              label="Facebook (publicación)"
              onClick={shareToFacebookPost}
              colorClass="bg-muted/50 hover:bg-muted border border-border/50"
            />
            <ShareOption
              icon={
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                  <TwitterIcon />
                </div>
              }
              label="Twitter / X"
              onClick={shareToTwitter}
              colorClass="bg-muted/50 hover:bg-muted border border-border/50"
            />
          </div>
          
          {/* Footer section */}
          <div className="pt-4 mt-4 border-t border-border space-y-3">
            <Button 
              onClick={copyLinkToClipboard}
              variant="ghost"
              className="w-full justify-start gap-3 h-12"
            >
              {linkCopied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5 text-muted-foreground" />
              )}
              <span>{linkCopied ? '¡Link copiado!' : 'Copiar Link'}</span>
            </Button>
            
            <Button 
              onClick={openNativeShare}
              className="w-full h-12 gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Más opciones
            </Button>
            
            <div className="text-xs text-muted-foreground text-center pt-2">
              <span className="block mb-1">Link del perfil:</span>
              <span className="block truncate text-foreground/70 font-mono text-[10px] bg-muted px-2 py-1 rounded">
                {getProfileUrl()}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
