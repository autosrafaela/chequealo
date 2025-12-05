import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Check,
  Share2,
  Copy
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Combo {
  id: string;
  professional_id: string;
  title: string;
  description: string | null;
  includes: string[];
  price_from: number;
  deposit_amount: number | null;
  deposit_percentage: number;
  is_active: boolean;
  display_order: number;
}

interface CombosManagerProps {
  professionalId: string;
  maxCombos?: number;
}

export const CombosManager = ({ professionalId, maxCombos = 3 }: CombosManagerProps) => {
  const { user } = useAuth();
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    includes: [''],
    price_from: '',
    deposit_percentage: 30,
  });

  useEffect(() => {
    loadCombos();
  }, [professionalId]);

  const loadCombos = async () => {
    try {
      const { data, error } = await supabase
        .from('combos')
        .select('*')
        .eq('professional_id', professionalId)
        .order('display_order');

      if (error) throw error;
      setCombos(data || []);
    } catch (error) {
      console.error('Error loading combos:', error);
      toast.error('Error al cargar los combos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInclude = () => {
    setFormData(prev => ({
      ...prev,
      includes: [...prev.includes, '']
    }));
  };

  const handleRemoveInclude = (index: number) => {
    setFormData(prev => ({
      ...prev,
      includes: prev.includes.filter((_, i) => i !== index)
    }));
  };

  const handleIncludeChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      includes: prev.includes.map((item, i) => i === index ? value : item)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.price_from) {
      toast.error('Completá título y precio');
      return;
    }

    const cleanedIncludes = formData.includes.filter(i => i.trim() !== '');
    if (cleanedIncludes.length === 0) {
      toast.error('Agregá al menos un ítem incluido');
      return;
    }

    const priceFrom = parseFloat(formData.price_from);
    const depositAmount = (priceFrom * formData.deposit_percentage) / 100;

    try {
      if (editingCombo) {
        const { error } = await supabase
          .from('combos')
          .update({
            title: formData.title,
            description: formData.description || null,
            includes: cleanedIncludes,
            price_from: priceFrom,
            deposit_percentage: formData.deposit_percentage,
            deposit_amount: depositAmount,
          })
          .eq('id', editingCombo.id);

        if (error) throw error;
        toast.success('Combo actualizado');
      } else {
        const { error } = await supabase
          .from('combos')
          .insert({
            professional_id: professionalId,
            title: formData.title,
            description: formData.description || null,
            includes: cleanedIncludes,
            price_from: priceFrom,
            deposit_percentage: formData.deposit_percentage,
            deposit_amount: depositAmount,
            display_order: combos.length,
          });

        if (error) throw error;
        toast.success('Combo creado');
      }

      setIsDialogOpen(false);
      resetForm();
      loadCombos();
    } catch (error) {
      console.error('Error saving combo:', error);
      toast.error('Error al guardar el combo');
    }
  };

  const handleEdit = (combo: Combo) => {
    setEditingCombo(combo);
    setFormData({
      title: combo.title,
      description: combo.description || '',
      includes: combo.includes.length > 0 ? combo.includes : [''],
      price_from: combo.price_from.toString(),
      deposit_percentage: combo.deposit_percentage,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este combo?')) return;

    try {
      const { error } = await supabase
        .from('combos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Combo eliminado');
      loadCombos();
    } catch (error) {
      console.error('Error deleting combo:', error);
      toast.error('Error al eliminar');
    }
  };

  const handleToggleActive = async (combo: Combo) => {
    try {
      const { error } = await supabase
        .from('combos')
        .update({ is_active: !combo.is_active })
        .eq('id', combo.id);

      if (error) throw error;
      loadCombos();
    } catch (error) {
      console.error('Error toggling combo:', error);
    }
  };

  const resetForm = () => {
    setEditingCombo(null);
    setFormData({
      title: '',
      description: '',
      includes: [''],
      price_from: '',
      deposit_percentage: 30,
    });
  };

  const generateSocialPost = (combo: Combo) => {
    const includesList = combo.includes.map(i => `✅ ${i}`).join('\n');
    const post = `🔥 COMBO ESPECIAL 🔥

${combo.title}

${combo.description ? combo.description + '\n\n' : ''}Incluye:
${includesList}

💰 Desde $${combo.price_from.toLocaleString('es-AR')}
📍 Reservá con seña del ${combo.deposit_percentage}%

¡Contactame para reservar tu turno!

#${combo.title.replace(/\s+/g, '')} #Servicios #Profesional #Chequealo`;

    navigator.clipboard.writeText(post);
    toast.success('Post copiado al portapapeles');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Combos Rápidos
        </CardTitle>
        
        {combos.length < maxCombos && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Nuevo Combo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCombo ? 'Editar Combo' : 'Crear Combo'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <Label>Título del combo *</Label>
                  <Input
                    placeholder="Ej: Visita + 2 arreglos simples"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Descripción (opcional)</Label>
                  <Textarea
                    placeholder="Descripción breve del combo..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div>
                  <Label>¿Qué incluye? *</Label>
                  <div className="space-y-2 mt-2">
                    {formData.includes.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Ej: Diagnóstico inicial"
                          value={item}
                          onChange={(e) => handleIncludeChange(index, e.target.value)}
                        />
                        {formData.includes.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveInclude(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddInclude}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar ítem
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Precio desde ($) *</Label>
                    <Input
                      type="number"
                      placeholder="5000"
                      value={formData.price_from}
                      onChange={(e) => setFormData(prev => ({ ...prev, price_from: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Seña (%)</Label>
                    <Input
                      type="number"
                      min={10}
                      max={100}
                      value={formData.deposit_percentage}
                      onChange={(e) => setFormData(prev => ({ ...prev, deposit_percentage: parseInt(e.target.value) || 30 }))}
                    />
                  </div>
                </div>

                {formData.price_from && (
                  <p className="text-sm text-muted-foreground">
                    Seña: ${((parseFloat(formData.price_from) * formData.deposit_percentage) / 100).toLocaleString('es-AR')}
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmit}>
                    <Check className="h-4 w-4 mr-1" />
                    {editingCombo ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Creá hasta {maxCombos} combos con precios especiales para atraer clientes.
        </p>

        {combos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tenés combos creados</p>
            <p className="text-sm">Creá tu primer combo para promocionar tus servicios</p>
          </div>
        ) : (
          <div className="space-y-3">
            {combos.map((combo) => (
              <Card key={combo.id} className={!combo.is_active ? 'opacity-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{combo.title}</h4>
                        {!combo.is_active && (
                          <Badge variant="secondary" className="text-xs">Inactivo</Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-2">
                        {combo.includes.slice(0, 2).map((item, i) => (
                          <span key={i}>• {item} </span>
                        ))}
                        {combo.includes.length > 2 && (
                          <span>+{combo.includes.length - 2} más</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-semibold">
                          Desde ${combo.price_from.toLocaleString('es-AR')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Seña: ${combo.deposit_amount?.toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Switch
                        checked={combo.is_active}
                        onCheckedChange={() => handleToggleActive(combo)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => generateSocialPost(combo)}
                        title="Generar post para redes"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(combo)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(combo.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {combos.length >= maxCombos && (
          <p className="text-sm text-muted-foreground text-center">
            Alcanzaste el máximo de {maxCombos} combos
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CombosManager;
