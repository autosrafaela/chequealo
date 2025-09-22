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
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleSuggestionContact}
        className="flex items-center gap-2 rounded-full px-4 py-3 h-auto bg-success hover:bg-success/90 text-success-foreground shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
        title="Enviar sugerencia por WhatsApp"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm font-medium">Sugerencias</span>
      </Button>
    </div>
  );
};