import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface WhatsAppContactButtonProps {
  phone?: string;
  professionalName: string;
  professionalId?: string;
  source?: string;
  message?: string;
}

export const WhatsAppContactButton = ({ 
  phone, 
  professionalName, 
  professionalId,
  source = 'profile',
  message 
}: WhatsAppContactButtonProps) => {
  const { user } = useAuth();

  const trackClick = () => {
    if (!professionalId) return;
    // Fire-and-forget — never blocks WhatsApp opening
    supabase.from('lead_clicks').insert({
      professional_id: professionalId,
      clicker_id: user?.id || null,
      source
    } as any).then(() => {}).catch(() => {});
  };

  const handleWhatsAppContact = () => {
    // Track BEFORE opening WhatsApp
    trackClick();

    if (!phone) {
      alert('Este profesional no tiene número de WhatsApp disponible. Usa "Pedir Presupuesto" para contactarlo por la plataforma.');
      return;
    }

    // SECURITY: Validate phone number format
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Validate phone length (7-15 digits after cleaning)
    if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      alert('El número de teléfono no es válido. Por favor, contacta al profesional usando "Pedir Presupuesto".');
      console.error('[WhatsApp] Invalid phone length:', cleanPhone.length);
      return;
    }
    
    // Add Argentina country code if not present
    let whatsappNumber = cleanPhone;
    if (!cleanPhone.startsWith('54')) {
      if (cleanPhone.startsWith('9') || cleanPhone.length === 10) {
        whatsappNumber = `54${cleanPhone}`;
      } else if (cleanPhone.length === 8 || cleanPhone.length === 7) {
        whatsappNumber = `5411${cleanPhone}`;
      }
    }

    // Default message
    const defaultMessage = message || 
      `Hola ${professionalName}! Te contacto desde Chequealo. Me interesa conocer más sobre tus servicios.`;

    // Robust WhatsApp URL with fallbacks (prefer wa.me)
    const encodedText = encodeURIComponent(defaultMessage);
    const isMobile = /Android|iPhone|iPad|iPod|Windows Phone|webOS|BlackBerry/i.test(navigator.userAgent);

    const candidates = isMobile
      ? [
          `whatsapp://send?phone=${whatsappNumber}&text=${encodedText}`,
          `https://wa.me/${whatsappNumber}?text=${encodedText}`,
          `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedText}`,
        ]
      : [
          `https://wa.me/${whatsappNumber}?text=${encodedText}`,
          `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedText}`,
          `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedText}`,
        ];

    // Try to open in a new tab; if the browser blocks popups, navigate in the same tab
    let opened = false;
    for (const url of candidates) {
      const w = window.open(url, '_blank');
      if (w) { opened = true; break; }
    }
    if (!opened) window.location.href = candidates[0];
  };

  return (
    <Button 
      className="flex-1 bg-gradient-to-r from-green-500 to-green-700 text-white shadow-[0_4px_15px_rgba(37,211,102,0.4)] hover:shadow-[0_0_25px_rgba(37,211,102,0.7)] hover:scale-105 transition-all duration-300"
      onClick={handleWhatsAppContact}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      Contactar por WhatsApp
    </Button>
  );
};
