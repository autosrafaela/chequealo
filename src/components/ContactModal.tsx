import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MessageCircle, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface ContactModalProps {
  professionalId: string;
  professionalName: string;
  type: 'contact' | 'quote';
}

export const ContactModal = ({ professionalId, professionalName, type }: ContactModalProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    serviceType: '',
    budgetRange: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Debes iniciar sesión para contactar profesionales');
      return;
    }

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('contact_requests')
        .insert({
          professional_id: professionalId,
          user_id: user.id,
          type,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          message: formData.message,
          service_type: formData.serviceType || null,
          budget_range: formData.budgetRange || null
        });

      if (error) throw error;

      toast.success(
        type === 'contact' 
          ? 'Solicitud de contacto enviada exitosamente'
          : 'Solicitud de presupuesto enviada exitosamente'
      );
      
      setOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        serviceType: '',
        budgetRange: ''
      });
    } catch (error) {
      console.error('Error sending request:', error);
      toast.error('Error al enviar la solicitud. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const buttonConfig = {
    contact: {
      icon: <MessageCircle className="h-4 w-4 mr-2" />,
      text: 'Contactar Ahora',
      title: `Contactar a ${professionalName}`,
      description: 'Envía un mensaje directo al profesional'
    },
    quote: {
      icon: <Calendar className="h-4 w-4 mr-2" />,
      text: 'Pedir Presupuesto',
      title: `Solicitar presupuesto a ${professionalName}`,
      description: 'Solicita una cotización detallada para tu proyecto'
    }
  };

  const config = buttonConfig[type];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={type === 'contact' ? 'flex-1 bg-primary hover:bg-primary/90' : 'flex-1'} variant={type === 'contact' ? 'default' : 'outline'}>
          {config.icon}
          {config.text}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo *</Label>
              <Input
                id="name"
                placeholder="Tu nombre"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              placeholder="Número de teléfono"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>

          {type === 'quote' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="serviceType">Tipo de servicio</Label>
                <Input
                  id="serviceType"
                  placeholder="¿Qué servicio necesitas?"
                  value={formData.serviceType}
                  onChange={(e) => handleInputChange('serviceType', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budgetRange">Presupuesto estimado</Label>
                <Select onValueChange={(value) => handleInputChange('budgetRange', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu rango de presupuesto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hasta-50k">Hasta $50.000</SelectItem>
                    <SelectItem value="50k-100k">$50.000 - $100.000</SelectItem>
                    <SelectItem value="100k-250k">$100.000 - $250.000</SelectItem>
                    <SelectItem value="250k-500k">$250.000 - $500.000</SelectItem>
                    <SelectItem value="mas-500k">Más de $500.000</SelectItem>
                    <SelectItem value="consultar">Prefiero consultar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="message">Mensaje *</Label>
            <Textarea
              id="message"
              placeholder={
                type === 'contact' 
                  ? "Cuéntanos en qué te podemos ayudar..."
                  : "Describe tu proyecto con el mayor detalle posible..."
              }
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {type === 'contact' ? 'Enviar Mensaje' : 'Solicitar Presupuesto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};