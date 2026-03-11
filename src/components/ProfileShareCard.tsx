import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Share2, Loader2, Copy, Check, Download, Sparkles, RefreshCw, LayoutGrid, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useGenerateShareCard, generateCard } from '@/hooks/useGenerateShareCard';
import { generateAutoSlug } from '@/utils/autoSlug';
import { CARD_STYLES, CardStyleConfig } from '@/types/cardStyles';

interface ProfessionItem {
  id: string;
  profession: string;
  is_primary?: boolean;
}

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
    professions?: ProfessionItem[];
    services?: { service_name: string }[];
    description?: string;
    phone?: string | null;
    email?: string | null;
  };
  trigger?: React.ReactNode;
}

type CardFormat = 'post' | 'story';

// Social media icons
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

export const ProfileShareCard = ({ professional, trigger }: ProfileShareCardProps) => {
  const { generateMultipleCards, generateRandomCards } = useGenerateShareCard();
  const [open, setOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<CardFormat>('story');
  const [cards, setCards] = useState<{ style: string; url: string; config: CardStyleConfig }[]>([]);
  const [selectedCard, setSelectedCard] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const getProfileUrl = () => {
    if (professional.slug) {
      return `https://chequealo.net/${professional.slug}`;
    }
    // Auto-slug SEO-friendly
    const autoSlug = generateAutoSlug(
      professional.profession,
      professional.full_name,
      professional.location
    );
    if (autoSlug) {
      return `https://chequealo.net/${autoSlug}`;
    }
    return `https://chequealo.net/professional/${professional.id}`;
  };

  // Generate cards when dialog opens or format changes
  useEffect(() => {
    if (open && cards.length === 0) {
      handleGenerate();
    }
  }, [open]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generatedCards = await generateMultipleCards(professional, selectedFormat);
      setCards(generatedCards);
      setSelectedCard(0);
    } catch (error) {
      console.error('Error generating cards:', error);
      toast.error('Error al generar las tarjetas');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFormatChange = async (format: CardFormat) => {
    setSelectedFormat(format);
    setIsGenerating(true);
    try {
      const generatedCards = await generateMultipleCards(professional, format);
      setCards(generatedCards);
      setSelectedCard(0);
    } catch (error) {
      console.error('Error generating cards:', error);
      toast.error('Error al generar las tarjetas');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const newCards = await generateRandomCards(professional, selectedFormat, 3);
      setCards(newCards);
      setSelectedCard(0);
    } catch (error) {
      console.error('Error regenerating cards:', error);
      toast.error('Error al regenerar');
    } finally {
      setIsRegenerating(false);
    }
  };

  const copyLinkToClipboard = async () => {
    const profileUrl = getProfileUrl();
    try {
      await navigator.clipboard.writeText(profileUrl);
      setLinkCopied(true);
      toast.success('¡Link copiado al portapapeles!');
      setTimeout(() => setLinkCopied(false), 3000);
    } catch {
      toast.error('No se pudo copiar el link');
    }
  };

  const downloadImage = () => {
    if (cards.length === 0 || selectedCard >= cards.length) return;

    const card = cards[selectedCard];
    const link = document.createElement('a');
    link.download = `${professional.slug || professional.full_name.replace(/\s+/g, '-').toLowerCase()}-${card.style}.png`;
    link.href = card.url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Imagen descargada');
  };

  const handleShare = async () => {
    if (cards.length === 0 || selectedCard >= cards.length) return;

    const card = cards[selectedCard];
    try {
      const response = await fetch(card.url);
      const blob = await response.blob();
      const file = new File([blob], `perfil-${professional.full_name}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] });
        toast.success('¡Compartiendo!');
        return;
      }
    } catch (error) {
      console.log('Web Share failed, falling back to download');
    }

    downloadImage();
  };

  const shareToWhatsApp = () => {
    const profileUrl = getProfileUrl();
    const message = `¡Mirá el perfil de ${professional.full_name.toUpperCase()}! ${professional.profession} en Chequealo 🔗 ${profileUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareToFacebook = () => {
    const profileUrl = getProfileUrl();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`, '_blank', 'width=600,height=400');
  };

  const shareToTelegram = () => {
    const profileUrl = getProfileUrl();
    const text = `¡Mirá el perfil de ${professional.full_name.toUpperCase()}! ${professional.profession} en Chequealo`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareToInstagram = async () => {
    await handleShare();
    toast.success('Imagen lista. Subila a tu Historia o Feed de Instagram');
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Elegí tu tarjeta
          </DialogTitle>
          <DialogDescription>
            Diseños sugeridos por IA según tu profesión
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Format selector */}
          <div className="flex gap-2">
            <button
              onClick={() => handleFormatChange('post')}
              disabled={isGenerating}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all',
                selectedFormat === 'post'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <LayoutGrid className={cn('w-6 h-6', selectedFormat === 'post' ? 'text-primary' : 'text-muted-foreground')} />
              <span className="font-medium text-sm">Cuadrado</span>
              <span className="text-xs text-muted-foreground">1080×1080</span>
            </button>
            <button
              onClick={() => handleFormatChange('story')}
              disabled={isGenerating}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all',
                selectedFormat === 'story'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <Smartphone className={cn('w-6 h-6', selectedFormat === 'story' ? 'text-primary' : 'text-muted-foreground')} />
              <span className="font-medium text-sm">Historia</span>
              <span className="text-xs text-muted-foreground">1080×1920</span>
            </button>
          </div>

          {/* Cards grid */}
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin h-10 w-10 text-primary mb-3" />
              <p className="text-sm text-muted-foreground">Generando diseños personalizados...</p>
            </div>
          ) : cards.length > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-2">
                {cards.map((card, index) => (
                  <button
                    key={card.style}
                    onClick={() => setSelectedCard(index)}
                    className={cn(
                      'relative rounded-lg overflow-hidden border-2 transition-all aspect-square',
                      selectedCard === index
                        ? 'border-primary ring-2 ring-primary/20 scale-[1.02]'
                        : 'border-transparent hover:border-muted-foreground/30'
                    )}
                  >
                    <img
                      src={card.url}
                      alt={`Estilo ${card.config.name}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm text-white px-2 py-1 text-xs text-center">
                      {card.config.name}
                    </div>
                    {selectedCard === index && (
                      <div className="absolute top-1 right-1 bg-primary text-primary-foreground p-0.5 rounded-full">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Regenerate button */}
              <Button
                variant="ghost"
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="w-full"
                size="sm"
              >
                {isRegenerating ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Generar otros diseños
              </Button>

              {/* Preview */}
              <div className="rounded-lg overflow-hidden border bg-muted">
                <div className={cn('relative', selectedFormat === 'story' ? 'aspect-[9/16] max-h-[280px]' : 'aspect-square max-h-[200px]')}>
                  <img
                    src={cards[selectedCard]?.url}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </>
          ) : null}

          {/* Social share buttons */}
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={shareToInstagram}
              disabled={cards.length === 0}
              className="flex flex-col h-auto py-2 px-1"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center mb-1">
                <InstagramIcon />
              </div>
              <span className="text-[10px]">Instagram</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareToWhatsApp}
              className="flex flex-col h-auto py-2 px-1"
            >
              <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center mb-1">
                <WhatsAppIcon />
              </div>
              <span className="text-[10px]">WhatsApp</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareToFacebook}
              className="flex flex-col h-auto py-2 px-1"
            >
              <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center mb-1">
                <FacebookIcon />
              </div>
              <span className="text-[10px]">Facebook</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareToTelegram}
              className="flex flex-col h-auto py-2 px-1"
            >
              <div className="w-8 h-8 rounded-full bg-[#0088cc] flex items-center justify-center mb-1">
                <TelegramIcon />
              </div>
              <span className="text-[10px]">Telegram</span>
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              onClick={copyLinkToClipboard}
              className="flex-1 gap-2"
            >
              {linkCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              {linkCopied ? 'Copiado' : 'Copiar link'}
            </Button>
            <Button
              onClick={handleShare}
              disabled={cards.length === 0}
              className="flex-1 gap-2"
            >
              <Share2 className="h-4 w-4" />
              Compartir
            </Button>
            <Button
              variant="secondary"
              onClick={downloadImage}
              disabled={cards.length === 0}
              size="icon"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>

          {/* URL preview */}
          <div className="text-center">
            <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
              {getProfileUrl()}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
