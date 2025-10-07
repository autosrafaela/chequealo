import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, DollarSign, Package, Tag } from 'lucide-react';

interface Service {
  id: string;
  service_name: string;
  description: string | null;
  price_from: number | null;
  price_to: number | null;
  price_unit: string;
  is_active: boolean;
  created_at: string;
}

interface ServiceFormData {
  service_name: string;
  description: string;
  price_from: string;
  price_to: string;
  price_unit: string;
  is_active: boolean;
}

export const ServicesManager = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>({
    service_name: '',
    description: '',
    price_from: '',
    price_to: '',
    price_unit: 'ARS',
    is_active: true
  });
  const [professionalId, setProfessionalId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfessionalAndServices();
    }
  }, [user]);

  const fetchProfessionalAndServices = async () => {
    try {
      // First get the professional ID
      const { data: professional, error: profError } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (profError) throw profError;
      
      setProfessionalId(professional.id);

      // Then get services
      const { data: servicesData, error: servicesError } = await supabase
        .from('professional_services')
        .select('*')
        .eq('professional_id', professional.id)
        .order('created_at', { ascending: false });

      if (servicesError) throw servicesError;

      setServices(servicesData || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Error al cargar los servicios');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      service_name: '',
      description: '',
      price_from: '',
      price_to: '',
      price_unit: 'ARS',
      is_active: true
    });
    setEditingService(null);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      service_name: service.service_name,
      description: service.description || '',
      price_from: service.price_from?.toString() || '',
      price_to: service.price_to?.toString() || '',
      price_unit: service.price_unit,
      is_active: service.is_active
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!professionalId) {
      toast.error('ID de profesional no encontrado');
      return;
    }

    if (!formData.service_name.trim()) {
      toast.error('El nombre del servicio es requerido');
      return;
    }

    try {
      const serviceData = {
        professional_id: professionalId,
        service_name: formData.service_name.trim(),
        description: formData.description.trim() || null,
        price_from: formData.price_from ? parseFloat(formData.price_from) : null,
        price_to: formData.price_to ? parseFloat(formData.price_to) : null,
        price_unit: formData.price_unit,
        is_active: formData.is_active
      };

      if (editingService) {
        // Update existing service
        const { error } = await supabase
          .from('professional_services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (error) throw error;
        toast.success('Servicio actualizado correctamente');
      } else {
        // Create new service
        const { error } = await supabase
          .from('professional_services')
          .insert(serviceData);

        if (error) throw error;
        toast.success('Servicio creado correctamente');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchProfessionalAndServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Error al guardar el servicio');
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('professional_services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      
      toast.success('Servicio eliminado correctamente');
      fetchProfessionalAndServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Error al eliminar el servicio');
    }
  };

  const toggleServiceStatus = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('professional_services')
        .update({ is_active: !service.is_active })
        .eq('id', service.id);

      if (error) throw error;
      
      toast.success(`Servicio ${!service.is_active ? 'activado' : 'desactivado'} correctamente`);
      fetchProfessionalAndServices();
    } catch (error) {
      console.error('Error toggling service status:', error);
      toast.error('Error al cambiar el estado del servicio');
    }
  };

  const formatPrice = (priceFrom: number | null, priceTo: number | null, unit: string) => {
    const formatter = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: unit === 'ARS' ? 'ARS' : 'USD',
      minimumFractionDigits: 0
    });

    if (priceFrom && priceTo && priceFrom !== priceTo) {
      return `${formatter.format(priceFrom)} - ${formatter.format(priceTo)}`;
    } else if (priceFrom) {
      return `Desde ${formatter.format(priceFrom)}`;
    } else {
      return 'Precio a consultar';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Servicios</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Cargando servicios...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Mis Servicios ({services.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Gestiona los servicios que ofreces y sus precios
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Servicio
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingService 
                      ? 'Modifica la información del servicio' 
                      : 'Agrega un nuevo servicio a tu catálogo'
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="service_name">Nombre del Servicio *</Label>
                    <Input
                      id="service_name"
                      value={formData.service_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, service_name: e.target.value }))}
                      placeholder="ej. Reparación de PC, Clases de Piano..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe el servicio que ofreces..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price_from">Precio Desde</Label>
                      <Input
                        id="price_from"
                        type="number"
                        value={formData.price_from}
                        onChange={(e) => setFormData(prev => ({ ...prev, price_from: e.target.value }))}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price_to">Precio Hasta</Label>
                      <Input
                        id="price_to"
                        type="number"
                        value={formData.price_to}
                        onChange={(e) => setFormData(prev => ({ ...prev, price_to: e.target.value }))}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price_unit">Moneda</Label>
                    <Select value={formData.price_unit} onValueChange={(value) => setFormData(prev => ({ ...prev, price_unit: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ARS">Pesos Argentinos (ARS)</SelectItem>
                        <SelectItem value="USD">Dólares (USD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="is_active">Servicio activo</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingService ? 'Actualizar' : 'Crear'} Servicio
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {services.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tienes servicios registrados</h3>
            <p className="text-muted-foreground mb-4">
              Agrega servicios para que los clientes sepan qué ofreces
            </p>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar tu primer servicio
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {services.map((service) => (
              <div key={service.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{service.service_name}</h4>
                      <Badge variant={service.is_active ? 'default' : 'secondary'}>
                        {service.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    
                    {service.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {service.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        {formatPrice(service.price_from, service.price_to, service.price_unit)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleServiceStatus(service)}
                      title={service.is_active ? 'Desactivar servicio' : 'Activar servicio'}
                    >
                      <Tag className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};