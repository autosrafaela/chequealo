import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const FloatingWhatsAppWidget = () => {
  const handleSuggestionContact = () => {
    const adminPhone = '5493492607224'; // Formato internacional sin signos
    
    const suggestionMessage = encodeURIComponent(
      'Hola! Tengo una sugerencia para Chequealo: '
    );

    const isMobile = /Android|iPhone|iPad|iPod|Windows Phone|webOS|BlackBerry/i.test(navigator.userAgent);
    const candidates = isMobile
      ? [
          `whatsapp://send?phone=${adminPhone}&text=${suggestionMessage}`,
          `https://wa.me/${adminPhone}?text=${suggestionMessage}`,
        ]
      : [
          `https://wa.me/${adminPhone}?text=${suggestionMessage}`,
          `https://web.whatsapp.com/send?phone=${adminPhone}&text=${suggestionMessage}`,
        ];

    let opened = false;
    for (const url of candidates) {
      const w = window.open(url, '_blank');
      if (w) { opened = true; break; }
    }
    if (!opened) window.location.href = candidates[0];
  };

  return (
    <Button
      onClick={handleSuggestionContact}
      variant="ghost"
      size="sm"
      className="text-navy-foreground hover:bg-navy-light/50 gap-1.5 px-2 sm:px-3"
      title="Enviar sugerencia por WhatsApp"
    >
      <MessageCircle className="h-4 w-4 text-success" />
      <span className="hidden sm:inline text-xs font-medium">Sugerencias</span>
    </Button>
  );
};