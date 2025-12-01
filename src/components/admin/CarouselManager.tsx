import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Upload, Trash2, Eye, EyeOff, GripVertical, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface CarouselSlide {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  link_url: string | null;
  button_text: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const CarouselManager: React.FC = () => {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link_url: '',
    button_text: '',
    image_url: '',
    display_order: 0,
    is_active: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('carousel_slides')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setSlides(data || []);
    } catch (error: any) {
      console.error('Error fetching slides:', error);
      toast.error('Error al cargar los slides');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('carousel')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('carousel')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = formData.image_url;

      // Upload new image if selected
      if (imageFile) {
        const uploadedUrl = await handleImageUpload(imageFile);
        if (!uploadedUrl) {
          setUploading(false);
          return;
        }
        imageUrl = uploadedUrl;
      }

      if (!imageUrl && !editingSlide) {
        toast.error('Debes seleccionar una imagen');
        setUploading(false);
        return;
      }

      const slideData = {
        title: formData.title || null,
        description: formData.description || null,
        image_url: imageUrl,
        link_url: formData.link_url || null,
        button_text: formData.button_text || null,
        display_order: formData.display_order,
        is_active: formData.is_active,
      };

      if (editingSlide) {
        const { error } = await supabase
          .from('carousel_slides')
          .update(slideData)
          .eq('id', editingSlide.id);

        if (error) throw error;
        toast.success('Slide actualizado exitosamente');
      } else {
        const { error } = await supabase
          .from('carousel_slides')
          .insert([slideData]);

        if (error) throw error;
        toast.success('Slide creado exitosamente');
      }

      resetForm();
      setIsDialogOpen(false);
      fetchSlides();
    } catch (error: any) {
      console.error('Error saving slide:', error);
      toast.error('Error al guardar el slide');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este slide?')) return;

    try {
      const { error } = await supabase
        .from('carousel_slides')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Slide eliminado exitosamente');
      fetchSlides();
    } catch (error: any) {
      console.error('Error deleting slide:', error);
      toast.error('Error al eliminar el slide');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('carousel_slides')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Slide ${!currentStatus ? 'activado' : 'desactivado'}`);
      fetchSlides();
    } catch (error: any) {
      console.error('Error updating slide status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const handleEdit = (slide: CarouselSlide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title || '',
      description: slide.description || '',
      link_url: slide.link_url || '',
      button_text: slide.button_text || '',
      image_url: slide.image_url,
      display_order: slide.display_order,
      is_active: slide.is_active,
    });
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingSlide(null);
    setFormData({
      title: '',
      description: '',
      link_url: '',
      button_text: '',
      image_url: '',
      display_order: slides.length,
      is_active: true,
    });
    setImageFile(null);
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestor de Carrusel</CardTitle>
            <CardDescription>
              Administra las imágenes y contenido del carrusel del header
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Slide
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingSlide ? 'Editar Slide' : 'Nuevo Slide'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image">Imagen *</Label>
                  <div className="flex flex-col gap-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />
                    {(formData.image_url || imageFile) && (
                      <div className="relative w-full h-40 rounded-lg overflow-hidden border">
                        <img
                          src={imageFile ? URL.createObjectURL(imageFile) : formData.image_url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Título del slide"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción del slide"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link_url">URL de Enlace</Label>
                  <Input
                    id="link_url"
                    type="url"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    placeholder="https://ejemplo.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="button_text">Texto del Botón</Label>
                  <Input
                    id="button_text"
                    value={formData.button_text}
                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                    placeholder="Ver más"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_order">Orden de Visualización</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    min="0"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Activo</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={uploading} className="flex-1">
                    {uploading ? 'Guardando...' : editingSlide ? 'Actualizar' : 'Crear'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={uploading}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {slides.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay slides configurados</p>
            <p className="text-sm">Crea tu primer slide para comenzar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                
                <img
                  src={slide.image_url}
                  alt={slide.title || 'Slide'}
                  className="w-24 h-16 object-cover rounded"
                />

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">
                    {slide.title || 'Sin título'}
                  </h3>
                  {slide.description && (
                    <p className="text-sm text-muted-foreground truncate">
                      {slide.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      Orden: {slide.display_order}
                    </span>
                    {slide.link_url && (
                      <span className="text-xs text-primary">• Tiene enlace</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleActive(slide.id, slide.is_active)}
                  >
                    {slide.is_active ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(slide)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(slide.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
