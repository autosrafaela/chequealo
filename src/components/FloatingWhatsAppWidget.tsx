import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const FloatingWhatsAppWidget = () => {
  const handleSuggestionContact = () => {
    // Número de teléfono del administrador/owner de Chequealo
    const adminPhone = '5491169374435'; // Número real del administrador
    
    const suggestionMessage = encodeURIComponent(
      'Hola! Tengo una sugerencia para Chequealo: '
    );
    
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${suggestionMessage}`;
    
    // Abrir en nueva pestaña
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleSuggestionContact}
        className="rounded-full w-14 h-14 bg-green-500 hover:bg-green-600 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
        title="Enviar sugerencia por WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  );
};