import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Share2, Loader2, Copy, Check, ExternalLink, Sparkles, Download, Image, LayoutGrid, Smartphone } from 'lucide-react';
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
    slug?: string | null;
  };
  trigger?: React.ReactNode;
}

interface ShareOptionProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onClick: () => void;
  colorClass?: string;
  disabled?: boolean;
}

type CardFormat = 'post' | 'story';

const ShareOption = ({ icon, label, sublabel, onClick, colorClass = "bg-muted", disabled }: ShareOptionProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${colorClass}`}
  >
    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center">
      {icon}
    </div>
    <div className="flex flex-col items-start">
      <span className="font-medium text-foreground">{label}</span>
      {sublabel && <span className="text-xs text-muted-foreground">{sublabel}</span>}
    </div>
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
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);


export const ProfileShareCard = ({ professional, trigger }: ProfileShareCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<CardFormat>('story');
  const [currentFormat, setCurrentFormat] = useState<CardFormat>('story');

  const getProfileUrl = () => {
    // Usar slug personalizado si existe, sino usar el ID
    if (professional.slug) {
      return `https://chequealo.ar/${professional.slug}`;
    }
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
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const drawRoundRect = (
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

  const generateProfileCard = async (format: CardFormat = selectedFormat) => {
    setGenerating(true);
    setCurrentFormat(format);
    
    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not found');
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Dimensions based on format
      const isPost = format === 'post';
      canvas.width = 1080;
      canvas.height = isPost ? 1080 : 1920;
      const w = canvas.width;
      const h = canvas.height;

      // ===== GRADIENT BACKGROUND (Blue to Purple) =====
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, '#197fe6');
      gradient.addColorStop(1, '#7c3aed');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Subtle pattern overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      for (let i = 0; i < h; i += 80) {
        ctx.fillRect(0, i, w, 2);
      }

      // Decorative circles
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.arc(-100, h * 0.3, 300, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(w + 100, h * 0.7, 400, 0, Math.PI * 2);
      ctx.fill();

      // ===== LOGO CHEQUEALO (top left) =====
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.font = 'bold 48px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('CHEQUEALO', 60, 90);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '24px Arial, sans-serif';
      ctx.fillText('.AR', 60 + ctx.measureText('CHEQUEALO').width + 8, 90);

      // ===== PROFILE PHOTO =====
      const photoSize = isPost ? 220 : 280;
      const photoX = (w - photoSize) / 2;
      const photoY = isPost ? 180 : 380;
      
      // Photo border glow
      ctx.save();
      ctx.beginPath();
      ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2 + 12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
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
          // Placeholder
          ctx.save();
          ctx.beginPath();
          ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 80px Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const initials = professional.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
          ctx.fillText(initials, photoX + photoSize / 2, photoY + photoSize / 2);
          ctx.restore();
        }
      } else {
        ctx.save();
        ctx.beginPath();
        ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 80px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const initials = professional.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        ctx.fillText(initials, photoX + photoSize / 2, photoY + photoSize / 2);
        ctx.restore();
      }

      // Available badge (green dot)
      ctx.save();
      ctx.beginPath();
      ctx.arc(photoX + photoSize - 15, photoY + photoSize - 15, 25, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();

      // ===== PROFESSIONAL NAME =====
      const nameY = photoY + photoSize + (isPost ? 50 : 70);
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${isPost ? 54 : 64}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(professional.full_name.toUpperCase(), w / 2, nameY);

      // ===== PROFESSION =====
      ctx.font = `${isPost ? 36 : 44}px Arial, sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(professional.profession, w / 2, nameY + (isPost ? 50 : 60));

      // ===== RATING WITH STARS =====
      const ratingY = nameY + (isPost ? 120 : 150);
      
      if (professional.rating) {
        // Stars
        const starSize = isPost ? 36 : 44;
        const totalStars = 5;
        const filledStars = Math.round(professional.rating);
        ctx.font = `${starSize}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        
        let starsText = '';
        for (let i = 0; i < totalStars; i++) {
          starsText += i < filledStars ? '★' : '☆';
        }
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(starsText, w / 2, ratingY);

        // Rating number and reviews
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${isPost ? 40 : 48}px Arial, sans-serif`;
        const ratingText = `${professional.rating.toFixed(1)}`;
        const reviewsText = professional.review_count ? ` (${professional.review_count})` : '';
        ctx.fillText(ratingText + reviewsText, w / 2, ratingY + (isPost ? 55 : 70));
      }

      // ===== BADGES (Verified / Premium) =====
      const badgesY = ratingY + (isPost ? 110 : 140);
      
      if (professional.is_verified) {
        const badgeWidth = 200;
        const badgeHeight = 50;
        const badgeX = w / 2 - badgeWidth / 2;
        
        ctx.save();
        drawRoundRect(ctx, badgeX, badgesY - badgeHeight / 2, badgeWidth, badgeHeight, 25);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
        ctx.restore();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${isPost ? 28 : 32}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('✓ Verificado', w / 2, badgesY + 10);
      }

      // ===== LOCATION =====
      const locationY = badgesY + (isPost ? 70 : 90);
      if (professional.location) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = `${isPost ? 32 : 38}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(`📍 ${professional.location}`, w / 2, locationY);
      }

      // ===== CTA SECTION =====
      const ctaY = isPost ? h - 280 : h - 450;
      const ctaWidth = w - 160;
      const ctaHeight = isPost ? 130 : 160;
      const ctaX = (w - ctaWidth) / 2;

      ctx.save();
      drawRoundRect(ctx, ctaX, ctaY, ctaWidth, ctaHeight, 30);
      const ctaGradient = ctx.createLinearGradient(ctaX, ctaY, ctaX + ctaWidth, ctaY);
      ctaGradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
      ctaGradient.addColorStop(1, 'rgba(255, 255, 255, 0.15)');
      ctx.fillStyle = ctaGradient;
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#fff';
      ctx.font = `bold ${isPost ? 42 : 52}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('¡Contactame!', w / 2, ctaY + (isPost ? 55 : 70));
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = `${isPost ? 28 : 34}px Arial, sans-serif`;
      ctx.fillText('Tocá el link para ver mi perfil', w / 2, ctaY + (isPost ? 95 : 120));

      // ===== PROFILE URL =====
      const urlY = isPost ? h - 100 : h - 200;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = `${isPost ? 28 : 32}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Ver perfil completo en:', w / 2, urlY);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${isPost ? 34 : 40}px Arial, sans-serif`;
      const shortUrl = `chequealo.ar/professional/${professional.id.substring(0, 8)}...`;
      ctx.fillText(shortUrl, w / 2, urlY + (isPost ? 45 : 55));

      // ===== FOOTER BRANDING =====
      if (!isPost) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '28px Arial, sans-serif';
        ctx.fillText('Profesionales verificados', w / 2, h - 80);
      }

      const dataUrl = canvas.toDataURL('image/png');
      setGeneratedImage(dataUrl);
      
      toast.success(`¡Imagen ${isPost ? 'cuadrada' : 'vertical'} generada!`);
    } catch (error) {
      console.error('Error generating profile card:', error);
      toast.error('Error al generar la imagen');
    } finally {
      setGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!generatedImage) {
      await generateProfileCard();
      return;
    }
    
    try {
      await navigator.clipboard.writeText(getProfileUrl());
      setLinkCopied(true);
    } catch (err) {
      console.log('Could not copy URL to clipboard');
    }
    
    const link = document.createElement('a');
    link.download = `perfil-${professional.full_name.replace(/\s+/g, '-').toLowerCase()}-${currentFormat}.png`;
    link.href = generatedImage;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Imagen descargada y link copiado');
  };

  // Share functions
  const shareToInstagram = async (format: CardFormat) => {
    setSelectedFormat(format);
    
    if (!generatedImage || currentFormat !== format) {
      await generateProfileCard(format);
    }
    
    // Wait for state update
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (navigator.share && navigator.canShare) {
      try {
        const response = await fetch(generatedImage!);
        const blob = await response.blob();
        const file = new File([blob], `perfil-${professional.full_name}.png`, { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file] });
          toast.success('¡Compartiendo!');
          return;
        }
      } catch (error) {
        console.log('Web Share failed, falling back to download');
      }
    }

    await downloadImage();
    toast.success(format === 'story' 
      ? 'Imagen descargada. Subila a tu Historia de Instagram' 
      : 'Imagen descargada. Subila como publicación en Instagram'
    );
  };

  const sendToWhatsAppContact = () => {
    const profileUrl = getProfileUrl();
    const message = `¡Mirá el perfil de ${professional.full_name.toUpperCase()}! ${professional.profession} en Chequealo 🔗 ${profileUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareToWhatsAppStatus = async () => {
    setSelectedFormat('story');
    
    if (!generatedImage || currentFormat !== 'story') {
      await generateProfileCard('story');
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
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

  const shareToTelegram = () => {
    const profileUrl = getProfileUrl();
    const text = `¡Mirá el perfil de ${professional.full_name.toUpperCase()}! ${professional.profession} en Chequealo`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(text)}`, '_blank');
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
            Compartir Perfil
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center">
            Generá una tarjeta visual para redes sociales
          </p>
        </DialogHeader>
        
        <div className="space-y-1">
          {/* Hidden canvas for generation */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {/* FORMAT SELECTOR */}
          <SectionHeader label="FORMATO DE IMAGEN" />
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSelectedFormat('post')}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                selectedFormat === 'post' 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <LayoutGrid className={`w-8 h-8 ${selectedFormat === 'post' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="font-medium text-sm">Cuadrado</span>
              <span className="text-xs text-muted-foreground">1080×1080</span>
            </button>
            <button
              onClick={() => setSelectedFormat('story')}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                selectedFormat === 'story' 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Smartphone className={`w-8 h-8 ${selectedFormat === 'story' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="font-medium text-sm">Historia</span>
              <span className="text-xs text-muted-foreground">1080×1920</span>
            </button>
          </div>
          
          {/* GENERATE BUTTON */}
          <Button
            onClick={() => generateProfileCard(selectedFormat)}
            disabled={generating}
            className="w-full h-14 gap-3 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generando imagen...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generar tarjeta {selectedFormat === 'post' ? 'cuadrada' : 'vertical'}
              </>
            )}
          </Button>

          {/* PREVIEW DE LA TARJETA */}
          {generatedImage && (
            <div className="mt-4 rounded-xl overflow-hidden border border-border shadow-lg">
              <div className={`relative bg-muted ${currentFormat === 'story' ? 'aspect-[9/16] max-h-[300px]' : 'aspect-square'}`}>
                <img 
                  src={generatedImage} 
                  alt="Preview de tarjeta"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-xs px-2 py-1 rounded-full font-medium">
                  {currentFormat === 'post' ? '1080×1080' : '1080×1920'}
                </div>
              </div>
              <div className="p-3 bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground">
                  Esta es la imagen que se compartirá
                </p>
              </div>
            </div>
          )}

          {/* INSTAGRAM */}
          <SectionHeader label="INSTAGRAM" />
          <div className="grid grid-cols-2 gap-2">
            <ShareOption
              icon={
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                  <InstagramIcon />
                </div>
              }
              label="Post"
              sublabel="1:1"
              onClick={() => shareToInstagram('post')}
              disabled={generating}
              colorClass="bg-muted/50 hover:bg-muted border border-border/50"
            />
            <ShareOption
              icon={
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                  <InstagramIcon />
                </div>
              }
              label="Historia"
              sublabel="9:16"
              onClick={() => shareToInstagram('story')}
              disabled={generating}
              colorClass="bg-muted/50 hover:bg-muted border border-border/50"
            />
          </div>
          
          {/* WHATSAPP */}
          <SectionHeader label="WHATSAPP" />
          <div className="grid grid-cols-2 gap-2">
            <ShareOption
              icon={
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
                  <WhatsAppIcon />
                </div>
              }
              label="Contacto"
              sublabel="Link"
              onClick={sendToWhatsAppContact}
              colorClass="bg-muted/50 hover:bg-muted border border-border/50"
            />
            <ShareOption
              icon={
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
                  <WhatsAppIcon />
                </div>
              }
              label="Estado"
              sublabel="Imagen"
              onClick={shareToWhatsAppStatus}
              disabled={generating}
              colorClass="bg-muted/50 hover:bg-muted border border-border/50"
            />
          </div>
          
          {/* OTRAS REDES */}
          <SectionHeader label="OTRAS REDES" />
          <div className="grid grid-cols-2 gap-2">
            <ShareOption
              icon={
                <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center">
                  <FacebookIcon />
                </div>
              }
              label="Facebook"
              sublabel="Compartir"
              onClick={shareToFacebookPost}
              colorClass="bg-muted/50 hover:bg-muted border border-border/50"
            />
            <ShareOption
              icon={
                <div className="w-10 h-10 rounded-full bg-[#0088cc] flex items-center justify-center">
                  <TelegramIcon />
                </div>
              }
              label="Telegram"
              sublabel="Compartir"
              onClick={shareToTelegram}
              colorClass="bg-muted/50 hover:bg-muted border border-border/50"
            />
          </div>
          
          {/* Footer section */}
          <div className="pt-4 mt-4 border-t border-border space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={copyLinkToClipboard}
                variant="ghost"
                className="w-full justify-center gap-2 h-11"
              >
                {linkCopied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="text-sm">{linkCopied ? 'Copiado' : 'Copiar link'}</span>
              </Button>
              
              <Button 
                onClick={downloadImage}
                variant="ghost"
                disabled={generating}
                className="w-full justify-center gap-2 h-11"
              >
                <Download className="h-4 w-4" />
                <span className="text-sm">Descargar</span>
              </Button>
            </div>
            
            <Button 
              onClick={openNativeShare}
              className="w-full h-11 gap-2"
              variant="outline"
            >
              <ExternalLink className="h-4 w-4" />
              Más opciones
            </Button>
            
            <div className="text-xs text-muted-foreground text-center pt-2">
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
