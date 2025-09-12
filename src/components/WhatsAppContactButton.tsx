import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface WhatsAppContactButtonProps {
  phone?: string;
  professionalName: string;
  message?: string;
}

export const WhatsAppContactButton = ({ 
  phone, 
  professionalName, 
  message 
}: WhatsAppContactButtonProps) => {
  const handleWhatsAppContact = () => {
    if (!phone) {
      // Fallback: show alert if no phone number
      alert('Este profesional no tiene número de WhatsApp disponible. Usa "Pedir Presupuesto" para contactarlo por la plataforma.');
      return;
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Add Argentina country code if not present
    let whatsappNumber = cleanPhone;
    if (!cleanPhone.startsWith('54')) {
      // If it's a local number (starts with 9, 11, etc.), add country code
      if (cleanPhone.startsWith('9') || cleanPhone.length === 10) {
        whatsappNumber = `54${cleanPhone}`;
      } else if (cleanPhone.length === 8 || cleanPhone.length === 7) {
        // Local number without area code, add default area code (e.g., Buenos Aires 11)
        whatsappNumber = `5411${cleanPhone}`;
      }
    }

    // Default message
    const defaultMessage = message || 
      `Hola ${professionalName}! Te contacto desde TodoAca.ar. Me interesa conocer más sobre tus servicios.`;

    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button 
      variant="whatsapp"
      className="flex-1"
      onClick={handleWhatsAppContact}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      Contactar por WhatsApp
    </Button>
  );
};