import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Zap, Clock, Shield, CheckCircle } from "lucide-react";

interface ExpressQuoteButtonProps {
  professionalId: string;
  professionalName: string;
  isVerified?: boolean;
}

export const ExpressQuoteButton = ({ professionalId, professionalName, isVerified }: ExpressQuoteButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: user?.email || '',
    phone: '',
    message: '',
    service_type: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Debes iniciar sesión para solicitar presupuesto express');
      return;
    }

    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      toast.error('Por favor completa nombre, teléfono y descripción');
      return;
    }

    try {
      setLoading(true);

      // 1. Crear el contact_request marcado como EXPRESS
      const { data: contactRequest, error: contactError } = await supabase
        .from('contact_requests')
        .insert({
          professional_id: professionalId,
          user_id: user.id,
          type: 'quote',
          name: formData.name.trim(),
          email: formData.email.trim() || user.email,
          phone: formData.phone.trim(),
          message: formData.message.trim(),
          service_type: formData.service_type || null,
          is_express: true
        })
        .select()
        .single();

      if (contactError) throw contactError;

      // 2. Verificar si ya existe una conversación
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('professional_id', professionalId)
        .eq('status', 'active')
        .single();

      let conversationId = existingConversation?.id;

      // 3. Si no existe conversación, crearla
      if (!conversationId) {
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            professional_id: professionalId,
            contact_request_id: contactRequest.id,
            status: 'active'
          })
          .select()
          .single();

        if (convError) throw convError;
        conversationId = newConversation.id;
      }

      // 4. Enviar mensaje EXPRESS con formato especial
      let messageContent = `⚡ **PRESUPUESTO EXPRESS** ⚡\n\n`;
      if (formData.service_type) {
        messageContent += `🔧 Servicio: ${formData.service_type}\n`;
      }
      messageContent += `📱 Teléfono: ${formData.phone}\n\n`;
      messageContent += `📝 Descripción:\n${formData.message}\n\n`;
      messageContent += `⏰ *Solicitud prioritaria - Respuesta rápida esperada*`;

      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          sender_type: 'user',
          message_type: 'text',
          content: messageContent
        });

      if (messageError) throw messageError;

      // 5. Notificar al profesional con urgencia
      try {
        const { notifyNewContactRequest } = await import('@/utils/notificationHelpers');
        await notifyNewContactRequest(professionalId, formData.name, 'quote', conversationId);
      } catch (notifError) {
        console.error('Error sending notification:', notifError);
      }

      toast.success('⚡ ¡Presupuesto Express enviado! El profesional responderá pronto.');
      setOpen(false);
      
      setTimeout(() => {
        navigate(`/user-dashboard?tab=messages&conversation=${conversationId}`);
      }, 500);

      setFormData({
        name: '',
        email: user?.email || '',
        phone: '',
        message: '',
        service_type: ''
      });
    } catch (error) {
      console.error('Error sending express request:', error);
      toast.error('Error al enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Button 
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-amber-500/25"
        onClick={() => toast.error('Debes iniciar sesión para solicitar presupuesto express')}
      >
        <Zap className="h-4 w-4 mr-2" />
        Presupuesto Express
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-amber-500/25 relative overflow-hidden group"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
          <Zap className="h-4 w-4 mr-2" />
          Presupuesto Express
          <Badge variant="secondary" className="ml-2 bg-white/20 text-white text-xs">
            RÁPIDO
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="flex items-center gap-2">
                Presupuesto Express
                <Badge className="bg-amber-500 text-white">PRIORITARIO</Badge>
              </DialogTitle>
              <DialogDescription>
                Solicita un presupuesto rápido a {professionalName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Benefits banner */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-amber-600" />
            <span className="text-muted-foreground">Respuesta prioritaria</span>
          </div>
          {isVerified && (
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-muted-foreground">Profesional verificado por Chequealo</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span className="text-muted-foreground">Notificación instantánea al profesional</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="express-name">Nombre *</Label>
              <Input
                id="express-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Tu nombre"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="express-phone">Teléfono *</Label>
              <Input
                id="express-phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Tu celular"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="express-service">¿Qué necesitás?</Label>
            <Input
              id="express-service"
              value={formData.service_type}
              onChange={(e) => setFormData(prev => ({ ...prev, service_type: e.target.value }))}
              placeholder="Ej: Reparación de cañería, instalación eléctrica..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="express-message">Descripción breve *</Label>
            <Textarea
              id="express-message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Describí brevemente el trabajo que necesitás..."
              className="min-h-[80px]"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {loading ? 'Enviando...' : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Enviar Express
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};