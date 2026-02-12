import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { MessageCircle, Calculator, CheckCircle } from "lucide-react";

interface ContactRequestDialogProps {
  professionalId: string;
  professionalName: string;
  type: 'contact' | 'quote';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

export const ContactRequestDialog = ({ professionalId, professionalName, type, open: controlledOpen, onOpenChange: controlledOnOpenChange, hideTrigger }: ContactRequestDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: user?.email || '',
    phone: '',
    message: '',
    service_type: '',
    budget_range: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auth fallback: use supabase.auth.getUser() if AuthContext isn't ready
    let userId = user?.id;
    if (!userId) {
      const { data: { user: freshUser } } = await supabase.auth.getUser();
      userId = freshUser?.id;
    }
    if (!userId) {
      toast.error('Tu sesión expiró. Por favor iniciá sesión nuevamente.');
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);

      // 1. Crear el contact_request
      const { data: contactRequest, error: contactError } = await supabase
        .from('contact_requests')
        .insert({
          professional_id: professionalId,
          user_id: userId,
          type,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          message: formData.message.trim(),
          service_type: formData.service_type || null,
          budget_range: formData.budget_range || null
        })
        .select()
        .single();

      if (contactError) throw contactError;

      // 2. Verificar si ya existe una conversación entre el usuario y el profesional
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', userId)
        .eq('professional_id', professionalId)
        .eq('status', 'active')
        .single();

      let conversationId = existingConversation?.id;

      // 3. Si no existe conversación, crearla
      if (!conversationId) {
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            user_id: userId,
            professional_id: professionalId,
            contact_request_id: contactRequest.id,
            status: 'active'
          })
          .select()
          .single();

        if (convError) throw convError;
        conversationId = newConversation.id;
      }

      // 4. Enviar mensaje inicial con los detalles de la solicitud
      let messageContent = type === 'contact' 
        ? `Hola! ${formData.message}`
        : `Solicitud de presupuesto:\n\n${formData.message}`;

      if (type === 'quote') {
        if (formData.service_type) {
          messageContent = `Tipo de servicio: ${formData.service_type}\n` + messageContent;
        }
        if (formData.budget_range) {
          messageContent += `\n\nPresupuesto estimado: ${formData.budget_range}`;
        }
        if (formData.phone) {
          messageContent += `\nTeléfono: ${formData.phone}`;
        }
      }

      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          sender_type: 'user',
          message_type: 'text',
          content: messageContent
        });

      if (messageError) throw messageError;

      // 6. Notificar al profesional con link directo al chat
      try {
        const { notifyNewContactRequest } = await import('@/utils/notificationHelpers');
        await notifyNewContactRequest(professionalId, formData.name, type, conversationId);
      } catch (notifError) {
        console.error('Error sending notification:', notifError);
        // No bloquear el flujo si falla la notificación
      }

      // 5. Mostrar éxito con animación y luego redirigir
      setShowSuccess(true);
      
      setTimeout(() => {
        setOpen(false);
        setShowSuccess(false);
        navigate(`/user-dashboard?tab=messages&conversation=${conversationId}`);
      }, 2000);

      setFormData({
        name: '',
        email: user?.email || '',
        phone: '',
        message: '',
        service_type: '',
        budget_range: ''
      });
    } catch (error: any) {
      console.error('Error sending request:', error);
      if (error?.code === '42501' || error?.message?.includes('row-level security')) {
        toast.error('Error de permisos. Intentá cerrar sesión y volver a entrar.');
      } else if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
        toast.error('Error de conexión. Verificá tu internet e intentá de nuevo.');
      } else {
        toast.error('Error al enviar la solicitud. Intentá de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Button 
        variant={type === 'contact' ? 'default' : 'outline'} 
        className="flex-1"
        onClick={() => toast.error('Debes iniciar sesión para contactar profesionales')}
      >
        {type === 'contact' ? (
          <>
            <MessageCircle className="h-4 w-4 mr-2" />
            Contactar Ahora
          </>
        ) : (
          <>
            <Calculator className="h-4 w-4 mr-2" />
            Pedir Presupuesto
          </>
        )}
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button variant={type === 'contact' ? 'default' : 'outline'} className="flex-1">
            {type === 'contact' ? (
              <>
                <MessageCircle className="h-4 w-4 mr-2" />
                Contactar Ahora
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4 mr-2" />
                Pedir Presupuesto
              </>
            )}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        {showSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-foreground">¡Solicitud Enviada!</h3>
            <p className="text-muted-foreground">El profesional te contactará pronto.</p>
            <p className="text-xs text-muted-foreground">Redirigiendo al chat...</p>
          </div>
        ) : (
        <>
        <DialogHeader>
          <DialogTitle>
            {type === 'contact' ? 'Contactar a' : 'Pedir Presupuesto a'} {professionalName}
          </DialogTitle>
          <DialogDescription>
            {type === 'contact' 
              ? 'Envía un mensaje directo al profesional'
              : 'Solicita un presupuesto personalizado para tu proyecto'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Tu nombre completo"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Tu número de teléfono"
            />
          </div>

          {type === 'quote' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="service_type">Tipo de Servicio</Label>
                <Input
                  id="service_type"
                  value={formData.service_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, service_type: e.target.value }))}
                  placeholder="Ej: Plomería, Electricidad, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget_range">Presupuesto Estimado</Label>
                <Select value={formData.budget_range} onValueChange={(value) => setFormData(prev => ({ ...prev, budget_range: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu rango de presupuesto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$0-$10,000">$0 - $10,000</SelectItem>
                    <SelectItem value="$10,000-$25,000">$10,000 - $25,000</SelectItem>
                    <SelectItem value="$25,000-$50,000">$25,000 - $50,000</SelectItem>
                    <SelectItem value="$50,000-$100,000">$50,000 - $100,000</SelectItem>
                    <SelectItem value="$100,000+">$100,000+</SelectItem>
                    <SelectItem value="A consultar">A consultar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="message">Mensaje *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder={type === 'contact' 
                ? "Describe brevemente lo que necesitas..."
                : "Describe tu proyecto en detalle para obtener un presupuesto más preciso..."
              }
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Enviando...' : (type === 'contact' ? 'Enviar Mensaje' : 'Solicitar Presupuesto')}
            </Button>
          </div>
        </form>
        </>
        )}
      </DialogContent>
    </Dialog>
  );
};