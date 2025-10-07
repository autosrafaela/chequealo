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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Tag, FolderOpen, ArrowUpDown } from 'lucide-react';

interface ProfessionCategory {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  icon: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  profession_category_id: string | null;
  is_active: boolean;
  icon: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
  profession_categories?: { name: string };
}

interface CategoryFormData {
  name: string;
  description: string;
  icon: string;
  is_active: boolean;
  display_order: number;
  profession_category_id?: string;
}

export const CategoriesManager = () => {
  const [professionCategories, setProfessionCategories] = useState<ProfessionCategory[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProfessionCategory | ServiceCategory | null>(null);
  const [activeTab, setActiveTab] = useState<'professions' | 'services'>('professions');
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    icon: '',
    is_active: true,
    display_order: 0,
    profession_category_id: undefined
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);

      // Fetch profession categories
      const { data: professions, error: profError } = await supabase
        .from('profession_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (profError) throw profError;

      // Fetch service categories with profession category names
      const { data: services, error: servError } = await supabase
        .from('service_categories')
        .select(`
          *,
          profession_categories(name)
        `)
        .order('display_order', { ascending: true });

      if (servError) throw servError;

      setProfessionCategories(professions || []);
      setServiceCategories(services || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '',
      is_active: true,
      display_order: 0,
      profession_category_id: undefined
    });
    setEditingCategory(null);
  };

  const handleEdit = (category: ProfessionCategory | ServiceCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      is_active: category.is_active,
      display_order: category.display_order,
      profession_category_id: 'profession_category_id' in category ? category.profession_category_id || undefined : undefined
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    try {
      const isEditingService = editingCategory && 'profession_category_id' in editingCategory;
      const isCreatingService = !editingCategory && activeTab === 'services';

      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        icon: formData.icon.trim() || null,
        is_active: formData.is_active,
        display_order: formData.display_order,
        ...(isEditingService || isCreatingService ? {
          profession_category_id: formData.profession_category_id || null
        } : {})
      };

      if (editingCategory) {
        // Update existing category
        const table = isEditingService ? 'service_categories' : 'profession_categories';
        const { error } = await supabase
          .from(table)
          .update(categoryData)
          .eq('id', editingCategory.id);

        if (error) throw error;
        toast.success('Categoría actualizada correctamente');
      } else {
        // Create new category
        const table = activeTab === 'services' ? 'service_categories' : 'profession_categories';
        const { error } = await supabase
          .from(table)
          .insert(categoryData);

        if (error) throw error;
        toast.success('Categoría creada correctamente');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Error al guardar la categoría');
    }
  };

  const handleDelete = async (categoryId: string, type: 'profession' | 'service') => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      return;
    }

    try {
      const table = type === 'service' ? 'service_categories' : 'profession_categories';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      
      toast.success('Categoría eliminada correctamente');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Error al eliminar la categoría');
    }
  };

  const toggleCategoryStatus = async (category: ProfessionCategory | ServiceCategory, type: 'profession' | 'service') => {
    try {
      const table = type === 'service' ? 'service_categories' : 'profession_categories';
      const { error } = await supabase
        .from(table)
        .update({ is_active: !category.is_active })
        .eq('id', category.id);

      if (error) throw error;
      
      toast.success(`Categoría ${!category.is_active ? 'activada' : 'desactivada'} correctamente`);
      fetchCategories();
    } catch (error) {
      console.error('Error toggling category status:', error);
      toast.error('Error al cambiar el estado de la categoría');
    }
  };

  const updateDisplayOrder = async (categoryId: string, newOrder: number, type: 'profession' | 'service') => {
    try {
      const table = type === 'service' ? 'service_categories' : 'profession_categories';
      const { error } = await supabase
        .from(table)
        .update({ display_order: newOrder })
        .eq('id', categoryId);

      if (error) throw error;
      fetchCategories();
    } catch (error) {
      console.error('Error updating display order:', error);
      toast.error('Error al actualizar el orden');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Cargando categorías...</p>
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
              <FolderOpen className="h-5 w-5" />
              Gestión de Categorías y Profesiones
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Administra las categorías de profesiones y servicios disponibles en la plataforma
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'professions' | 'services')}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="professions">
                Categorías de Profesiones ({professionCategories.length})
              </TabsTrigger>
              <TabsTrigger value="services">
                Categorías de Servicios ({serviceCategories.length})
              </TabsTrigger>
            </TabsList>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar {activeTab === 'professions' ? 'Profesión' : 'Servicio'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategory 
                        ? `Editar ${activeTab === 'professions' ? 'Profesión' : 'Servicio'}` 
                        : `Nueva ${activeTab === 'professions' ? 'Profesión' : 'Servicio'}`
                      }
                    </DialogTitle>
                    <DialogDescription>
                      {editingCategory 
                        ? 'Modifica la información de la categoría' 
                        : `Agrega una nueva categoría de ${activeTab === 'professions' ? 'profesión' : 'servicio'}`
                      }
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="ej. Plomería, Desarrollo Web..."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe la categoría..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="icon">Icono (Emoji)</Label>
                      <Input
                        id="icon"
                        value={formData.icon}
                        onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                        placeholder="🔧 💻 🎨 (opcional)"
                        maxLength={2}
                      />
                    </div>

                    {(activeTab === 'services' || (editingCategory && 'profession_category_id' in editingCategory)) && (
                      <div className="space-y-2">
                        <Label htmlFor="profession_category">Categoría de Profesión</Label>
                        <Select 
                          value={formData.profession_category_id || ''} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, profession_category_id: value || undefined }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría de profesión" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Sin categoría específica</SelectItem>
                            {professionCategories.filter(cat => cat.is_active).map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.icon} {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="display_order">Orden de Visualización</Label>
                        <Input
                          id="display_order"
                          type="number"
                          value={formData.display_order}
                          onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                          min="0"
                        />
                      </div>
                      
                      <div className="space-y-2 flex flex-col justify-end">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_active"
                            checked={formData.is_active}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                          />
                          <Label htmlFor="is_active">Categoría activa</Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingCategory ? 'Actualizar' : 'Crear'} Categoría
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <TabsContent value="professions">
            {professionCategories.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay categorías de profesiones</h3>
                <p className="text-muted-foreground mb-4">
                  Crea las primeras categorías para organizar las profesiones
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {professionCategories.map((category, index) => (
                  <div key={category.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {category.icon && (
                            <span className="text-xl">{category.icon}</span>
                          )}
                          <h4 className="font-semibold text-lg">{category.name}</h4>
                          <Badge variant={category.is_active ? 'default' : 'secondary'}>
                            {category.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                          <Badge variant="outline">
                            Orden: {category.display_order}
                          </Badge>
                        </div>
                        
                        {category.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {category.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Servicios: {serviceCategories.filter(s => s.profession_category_id === category.id).length}</span>
                          <span>Creada: {new Date(category.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateDisplayOrder(category.id, category.display_order - 1, 'profession')}
                          disabled={index === 0}
                          title="Subir orden"
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCategoryStatus(category, 'profession')}
                          title={category.is_active ? 'Desactivar' : 'Activar'}
                        >
                          <Tag className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id, 'profession')}
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
          </TabsContent>

          <TabsContent value="services">
            {serviceCategories.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay categorías de servicios</h3>
                <p className="text-muted-foreground mb-4">
                  Crea las primeras categorías de servicios para organizar mejor la oferta
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {serviceCategories.map((category, index) => (
                  <div key={category.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {category.icon && (
                            <span className="text-lg">{category.icon}</span>
                          )}
                          <h4 className="font-semibold">{category.name}</h4>
                          <Badge variant={category.is_active ? 'default' : 'secondary'}>
                            {category.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                          <Badge variant="outline">
                            Orden: {category.display_order}
                          </Badge>
                        </div>
                        
                        {category.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {category.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {category.profession_categories && (
                            <span>Categoría: {category.profession_categories.name}</span>
                          )}
                          <span>Creada: {new Date(category.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateDisplayOrder(category.id, category.display_order - 1, 'service')}
                          disabled={index === 0}
                          title="Subir orden"
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCategoryStatus(category, 'service')}
                          title={category.is_active ? 'Desactivar' : 'Activar'}
                        >
                          <Tag className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id, 'service')}
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};