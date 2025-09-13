import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Share2, Link, MessageCircle, Facebook, Twitter, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface ShareProfileButtonProps {
  professionalName: string;
  professionalId: string;
  profession: string;
}

export const ShareProfileButton = ({ professionalName, professionalId, profession }: ShareProfileButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const profileUrl = `${window.location.origin}/professional/${professionalId}`;
  const shareText = `¡Mira el perfil de ${professionalName}, ${profession}! 👨‍💼`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success('¡Enlace copiado al portapapeles!');
      setIsOpen(false);
    } catch (error) {
      // Fallback para navegadores sin clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = profileUrl;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        toast.success('¡Enlace copiado al portapapeles!');
      } catch (err) {
        toast.error('No se pudo copiar el enlace');
      }
      
      document.body.removeChild(textArea);
      setIsOpen(false);
    }
  };

  const shareViaWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${profileUrl}`)}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  const shareViaFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`;
    window.open(facebookUrl, '_blank');
    setIsOpen(false);
  };

  const shareViaTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`;
    window.open(twitterUrl, '_blank');
    setIsOpen(false);
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Perfil profesional: ${professionalName}`);
    const body = encodeURIComponent(`Hola,\n\nQuería compartirte el perfil de ${professionalName}, ${profession}.\n\nPuedes verlo aquí: ${profileUrl}\n\n¡Espero que te sea útil!`);
    const emailUrl = `mailto:?subject=${subject}&body=${body}`;
    window.open(emailUrl, '_self');
    setIsOpen(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Perfil de ${professionalName}`,
          text: shareText,
          url: profileUrl,
        });
        setIsOpen(false);
      } catch (error) {
        // Si el usuario cancela, no hacemos nada
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          // Fallback al dropdown
        }
      }
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="hover:bg-blue-50 hover:border-blue-200"
          onClick={() => {
            // Intentar compartir nativo primero en móviles
            if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
              handleNativeShare();
            } else {
              setIsOpen(!isOpen);
            }
          }}
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56 bg-background border shadow-md z-50">
        <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer">
          <Link className="h-4 w-4 mr-3" />
          Copiar enlace
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={shareViaWhatsApp} className="cursor-pointer">
          <MessageCircle className="h-4 w-4 mr-3 text-green-600" />
          Compartir en WhatsApp
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={shareViaFacebook} className="cursor-pointer">
          <Facebook className="h-4 w-4 mr-3 text-blue-600" />
          Compartir en Facebook
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={shareViaTwitter} className="cursor-pointer">
          <Twitter className="h-4 w-4 mr-3 text-blue-400" />
          Compartir en Twitter/X
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={shareViaEmail} className="cursor-pointer">
          <Mail className="h-4 w-4 mr-3 text-gray-600" />
          Compartir por email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};