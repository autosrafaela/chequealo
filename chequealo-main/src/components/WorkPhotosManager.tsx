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
import { Plus, Edit, Trash2, Camera, Upload, Star, Eye, Image } from 'lucide-react';

interface WorkPhoto {
  id: string;
  image_url: string;
  caption: string | null;
  work_type: string | null;
  is_featured: boolean;
  uploaded_by: string;
  created_at: string;
}

interface PhotoFormData {
  caption: string;
  work_type: string;
  is_featured: boolean;
}

export const WorkPhotosManager = () => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<WorkPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<WorkPhoto | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [multipleFormData, setMultipleFormData] = useState<{ [index: number]: PhotoFormData }>({});
  const [formData, setFormData] = useState<PhotoFormData>({
    caption: '',
    work_type: '',
    is_featured: false
  });
  const [professionalId, setProfessionalId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfessionalAndPhotos();
    }
  }, [user]);

  useEffect(() => {
    if (selectedFiles && selectedFiles.length > 0) {
      const urls: string[] = [];
      const newFormData: { [index: number]: PhotoFormData } = {};
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        urls.push(URL.createObjectURL(file));
        newFormData[i] = {
          caption: '',
          work_type: '',
          is_featured: false
        };
      }
      
      setPreviewUrls(urls);
      setMultipleFormData(newFormData);
      
      return () => {
        urls.forEach(url => URL.revokeObjectURL(url));
      };
    } else {
      setPreviewUrls([]);
      setMultipleFormData({});
    }
  }, [selectedFiles]);

  const fetchProfessionalAndPhotos = async () => {
    try {
      // First get the professional ID
      const { data: professional, error: profError } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (profError) throw profError;
      
      setProfessionalId(professional.id);

      // Then get work photos
      const { data: photosData, error: photosError } = await supabase
        .from('work_photos')
        .select('*')
        .eq('professional_id', professional.id)
        .order('created_at', { ascending: false });

      if (photosError) throw photosError;

      setPhotos(photosData || []);
    } catch (error) {
      console.error('Error fetching work photos:', error);
      toast.error('Error al cargar las fotos de trabajos');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      caption: '',
      work_type: '',
      is_featured: false
    });
    setMultipleFormData({});
    setEditingPhoto(null);
    setSelectedFiles(null);
    setPreviewUrls([]);
  };

  const handleEdit = (photo: WorkPhoto) => {
    setEditingPhoto(photo);
    setFormData({
      caption: photo.caption || '',
      work_type: photo.work_type || '',
      is_featured: photo.is_featured
    });
    setIsDialogOpen(true);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${professionalId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('work-photos')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('work-photos')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!professionalId) {
      toast.error('ID de profesional no encontrado');
      return;
    }

    // Handle editing existing photo (single photo logic)
    if (editingPhoto) {
      if (!selectedFiles || selectedFiles.length === 0) {
        // Update existing photo without changing image
        try {
          setUploading(true);
          
          const { error } = await supabase
            .from('work_photos')
            .update({
              caption: formData.caption.trim() || null,
              work_type: formData.work_type || null,
              is_featured: formData.is_featured
            })
            .eq('id', editingPhoto.id);

          if (error) throw error;
          toast.success('Foto actualizada correctamente');
          setIsDialogOpen(false);
          resetForm();
          fetchProfessionalAndPhotos();
        } catch (error) {
          console.error('Error updating photo:', error);
          toast.error('Error al actualizar la foto');
        } finally {
          setUploading(false);
        }
        return;
      } else {
        // Update existing photo with new image
        try {
          setUploading(true);
          
          const imageUrl = await uploadImage(selectedFiles[0]);
          
          const { error } = await supabase
            .from('work_photos')
            .update({
              image_url: imageUrl,
              caption: formData.caption.trim() || null,
              work_type: formData.work_type || null,
              is_featured: formData.is_featured
            })
            .eq('id', editingPhoto.id);

          if (error) throw error;
          toast.success('Foto actualizada correctamente');
          setIsDialogOpen(false);
          resetForm();
          fetchProfessionalAndPhotos();
        } catch (error) {
          console.error('Error updating photo:', error);
          toast.error('Error al actualizar la foto');
        } finally {
          setUploading(false);
        }
        return;
      }
    }

    // Handle uploading multiple new photos
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error('Selecciona al menos una imagen');
      return;
    }

    try {
      setUploading(true);
      const results = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const photoData = multipleFormData[i] || { caption: '', work_type: '', is_featured: false };
        
        try {
          const imageUrl = await uploadImage(file);
          
          const { error } = await supabase
            .from('work_photos')
            .insert({
              professional_id: professionalId,
              image_url: imageUrl,
              caption: photoData.caption.trim() || null,
              work_type: photoData.work_type || null,
              is_featured: photoData.is_featured,
              uploaded_by: 'professional'
            });

          if (error) throw error;
          results.push({ success: true, file: file.name });
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          results.push({ success: false, file: file.name, error });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      if (successCount > 0) {
        toast.success(`${successCount} foto${successCount > 1 ? 's' : ''} subida${successCount > 1 ? 's' : ''} correctamente`);
      }
      
      if (failureCount > 0) {
        toast.error(`Error al subir ${failureCount} foto${failureCount > 1 ? 's' : ''}`);
      }

      setIsDialogOpen(false);
      resetForm();
      fetchProfessionalAndPhotos();
    } catch (error) {
      console.error('Error saving photos:', error);
      toast.error('Error al guardar las fotos');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId: string, imageUrl: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta foto?')) {
      return;
    }

    try {
      // Delete from database
      const { error } = await supabase
        .from('work_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;

      // Delete from storage
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('work-photos')
          .remove([`${professionalId}/${fileName}`]);
      }
      
      toast.success('Foto eliminada correctamente');
      fetchProfessionalAndPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Error al eliminar la foto');
    }
  };

  const toggleFeatured = async (photo: WorkPhoto) => {
    try {
      const { error } = await supabase
        .from('work_photos')
        .update({ is_featured: !photo.is_featured })
        .eq('id', photo.id);

      if (error) throw error;
      
      toast.success(`Foto ${!photo.is_featured ? 'destacada' : 'no destacada'} correctamente`);
      fetchProfessionalAndPhotos();
    } catch (error) {
      console.error('Error toggling featured status:', error);
      toast.error('Error al cambiar el estado de destacado');
    }
  };

  const workTypes = [
    'Plomería', 'Electricidad', 'Carpintería', 'Pintura', 'Albañilería', 
    'Jardinería', 'Limpieza', 'Reparaciones', 'Instalaciones', 'Decoración',
    'Tecnología', 'Automotriz', 'Cocina', 'Baño', 'Otros'
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio de Trabajos</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Cargando fotos...</p>
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
              <Camera className="h-5 w-5" />
              Portfolio de Trabajos ({photos.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Muestra fotos de tus trabajos realizados para generar confianza
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Subir Foto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingPhoto ? 'Editar Foto' : 'Subir Fotos'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingPhoto 
                      ? 'Modifica la información de la foto' 
                      : 'Agrega múltiples fotos de tus trabajos al portfolio'
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  {!editingPhoto && (
                    <div className="space-y-2">
                      <Label htmlFor="images">Subir desde tu dispositivo *</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-muted-foreground/50 transition-colors">
                        <Input
                          id="images"
                          type="file"
                          accept="image/*,image/jpeg,image/jpg,image/png,image/webp"
                          capture="environment"
                          multiple
                          onChange={(e) => setSelectedFiles(e.target.files)}
                          required={!editingPhoto}
                          className="sr-only"
                        />
                        <Label htmlFor="images" className="cursor-pointer flex flex-col items-center gap-2">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm font-medium">Click para seleccionar imágenes</span>
                          <span className="text-xs text-muted-foreground">JPG, PNG, WEBP (máx. 10MB c/u) - Selección múltiple</span>
                        </Label>
                      </div>
                      
                      {previewUrls.length > 0 && (
                        <div className="mt-4 space-y-4">
                          <p className="text-sm font-medium">Vista previa de {previewUrls.length} imagen{previewUrls.length > 1 ? 'es' : ''}:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                            {previewUrls.map((url, index) => (
                              <div key={index} className="border rounded-lg p-3 space-y-3">
                                <img 
                                  src={url} 
                                  alt={`Preview ${index + 1}`} 
                                  className="w-full h-32 object-cover rounded-md"
                                />
                                
                                <div className="space-y-2">
                                  <div>
                                    <Label htmlFor={`work_type_${index}`} className="text-xs">Tipo de Trabajo</Label>
                                    <Select 
                                      value={multipleFormData[index]?.work_type || ''} 
                                      onValueChange={(value) => setMultipleFormData(prev => ({
                                        ...prev,
                                        [index]: { ...prev[index], work_type: value }
                                      }))}
                                    >
                                      <SelectTrigger className="h-8">
                                        <SelectValue placeholder="Seleccionar tipo" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {workTypes.map((type) => (
                                          <SelectItem key={type} value={type}>
                                            {type}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor={`caption_${index}`} className="text-xs">Descripción</Label>
                                    <Textarea
                                      id={`caption_${index}`}
                                      value={multipleFormData[index]?.caption || ''}
                                      onChange={(e) => setMultipleFormData(prev => ({
                                        ...prev,
                                        [index]: { ...prev[index], caption: e.target.value }
                                      }))}
                                      placeholder="Describe el trabajo..."
                                      rows={2}
                                      className="text-xs"
                                    />
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id={`featured_${index}`}
                                      checked={multipleFormData[index]?.is_featured || false}
                                      onCheckedChange={(checked) => setMultipleFormData(prev => ({
                                        ...prev,
                                        [index]: { ...prev[index], is_featured: checked }
                                      }))}
                                    />
                                    <Label htmlFor={`featured_${index}`} className="text-xs">Destacada</Label>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {editingPhoto && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Imagen Actual</Label>
                        <img 
                          src={editingPhoto.image_url} 
                          alt="Current" 
                          className="w-full h-32 object-cover rounded-md"
                        />
                        <div className="space-y-2">
                          <Label htmlFor="new-image">Cambiar Imagen (opcional)</Label>
                          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-muted-foreground/50 transition-colors">
                            <Input
                              id="new-image"
                              type="file"
                              accept="image/*,image/jpeg,image/jpg,image/png,image/webp"
                              capture="environment"
                              onChange={(e) => setSelectedFiles(e.target.files)}
                              className="sr-only"
                            />
                            <Label htmlFor="new-image" className="cursor-pointer flex flex-col items-center gap-2">
                              <Upload className="h-6 w-6 text-muted-foreground" />
                              <span className="text-sm">Seleccionar nueva imagen</span>
                            </Label>
                          </div>
                          {previewUrls.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium mb-2">Nueva imagen:</p>
                              <img 
                                src={previewUrls[0]} 
                                alt="New preview" 
                                className="w-full h-32 object-cover rounded-md border"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="work_type">Tipo de Trabajo</Label>
                          <Select value={formData.work_type} onValueChange={(value) => setFormData(prev => ({ ...prev, work_type: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el tipo de trabajo" />
                            </SelectTrigger>
                            <SelectContent>
                              {workTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="caption">Descripción</Label>
                          <Textarea
                            id="caption"
                            value={formData.caption}
                            onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                            placeholder="Describe el trabajo realizado..."
                            rows={3}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_featured"
                            checked={formData.is_featured}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                          />
                          <Label htmlFor="is_featured">Foto destacada</Label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? 'Subiendo...' : (editingPhoto ? 'Actualizar' : `Subir ${previewUrls.length || 0} Foto${previewUrls.length !== 1 ? 's' : ''}`)}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {photos.length === 0 ? (
          <div className="text-center py-8">
            <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tienes fotos en tu portfolio</h3>
            <p className="text-muted-foreground mb-4">
              Sube fotos de tus trabajos para mostrar tu experiencia a los clientes
            </p>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Subir tu primera foto
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <img 
                    src={photo.image_url} 
                    alt={photo.caption || 'Trabajo realizado'}
                    className="w-full h-48 object-cover"
                  />
                  {photo.is_featured && (
                    <Badge className="absolute top-2 left-2" variant="default">
                      <Star className="h-3 w-3 mr-1" />
                      Destacada
                    </Badge>
                  )}
                </div>
                
                <div className="p-4">
                  {photo.work_type && (
                    <Badge variant="secondary" className="mb-2">
                      {photo.work_type}
                    </Badge>
                  )}
                  
                  {photo.caption && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {photo.caption}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFeatured(photo)}
                      title={photo.is_featured ? 'Quitar de destacadas' : 'Marcar como destacada'}
                    >
                      <Star className={`h-4 w-4 ${photo.is_featured ? 'fill-current text-yellow-500' : ''}`} />
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(photo)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(photo.id, photo.image_url)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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