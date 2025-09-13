import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Edit, Plus, Trash2, Upload, MessageSquare, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LocationAutocomplete } from '@/components/ui/location-autocomplete';

interface EditProfileProps {
  professionalData: any;
  onUpdate: () => void;
  isOwner: boolean;
}

export const ProfessionalProfileEdit = ({ professionalData, onUpdate, isOwner }: EditProfileProps) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingService, setIsAddingService] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    description: professionalData?.description || '',
    phone: professionalData?.phone || '',
    email: professionalData?.email || '',
    location: professionalData?.location || ''
  });

  const [serviceForm, setServiceForm] = useState({
    service_name: '',
    description: '',
    price_from: '',
    price_to: ''
  });

  const [photoForm, setPhotoForm] = useState({
    caption: '',
    work_type: ''
  });

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const updateProfile = async () => {
    try {
      const { error } = await supabase
        .from('professionals')
        .update({
          description: profileForm.description,
          phone: profileForm.phone,
          email: profileForm.email,
          location: profileForm.location,
          updated_at: new Date().toISOString()
        })
        .eq('id', professionalData.id);

      if (error) throw error;

      toast.success('Perfil actualizado exitosamente');
      setIsEditingProfile(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    }
  };

  const addService = async () => {
    try {
      const { error } = await supabase
        .from('professional_services')
        .insert({
          professional_id: professionalData.id,
          service_name: serviceForm.service_name,
          description: serviceForm.description,
          price_from: serviceForm.price_from ? parseFloat(serviceForm.price_from) : null,
          price_to: serviceForm.price_to ? parseFloat(serviceForm.price_to) : null
        });

      if (error) throw error;

      toast.success('Servicio agregado exitosamente');
      setIsAddingService(false);
      setServiceForm({ service_name: '', description: '', price_from: '', price_to: '' });
      onUpdate();
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error('Error al agregar el servicio');
    }
  };

  const deleteService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('professional_services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      toast.success('Servicio eliminado');
      onUpdate();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Error al eliminar el servicio');
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${professionalData.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('work-photos')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('work-photos')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const uploadWorkPhoto = async () => {
    if (!selectedFile) {
      toast.error('Selecciona una imagen');
      return;
    }

    try {
      setUploading(true);
      
      // Upload image to storage
      const imageUrl = await uploadImage(selectedFile);

      const { error } = await supabase
        .from('work_photos')
        .insert({
          professional_id: professionalData.id,
          image_url: imageUrl,
          caption: photoForm.caption,
          work_type: photoForm.work_type,
          uploaded_by: 'professional'
        });

      if (error) throw error;

      toast.success('Foto de trabajo agregada');
      setIsUploadingPhoto(false);
      setPhotoForm({ caption: '', work_type: '' });
      setSelectedFile(null);
      setPreviewUrl(null);
      onUpdate();
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Error al subir la foto');
    } finally {
      setUploading(false);
    }
  };

  const respondToReview = async (reviewId: string, response: string) => {
    try {
      const { error } = await supabase
        .from('review_responses')
        .insert({
          review_id: reviewId,
          professional_id: professionalData.id,
          response: response
        });

      if (error) throw error;

      toast.success('Respuesta enviada');
      onUpdate();
    } catch (error) {
      console.error('Error responding to review:', error);
      toast.error('Error al enviar la respuesta');
    }
  };

  if (!isOwner) return null;

  return (
    <div className="space-y-4">
      {/* Edit Profile Button */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar Perfil
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Información Personal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Descripción Profesional</Label>
              <Textarea
                id="description"
                placeholder="Describe tu experiencia y servicios..."
                value={profileForm.description}
                onChange={(e) => setProfileForm({...profileForm, description: e.target.value})}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                placeholder="+54 9 3492 123456"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={profileForm.email}
                onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
              />
            </div>
            <LocationAutocomplete
              value={profileForm.location}
              onChange={(value) => setProfileForm({...profileForm, location: value})}
              label="Ubicación"
              id="location"
              placeholder="Busca tu ciudad o provincia..."
            />
            <div className="flex gap-2">
              <Button onClick={updateProfile} className="flex-1">
                Guardar Cambios
              </Button>
              <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Service Button */}
      <Dialog open={isAddingService} onOpenChange={setIsAddingService}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Servicio
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Servicio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="service_name">Nombre del Servicio</Label>
              <Input
                id="service_name"
                placeholder="Ej: Balances contables"
                value={serviceForm.service_name}
                onChange={(e) => setServiceForm({...serviceForm, service_name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="service_description">Descripción</Label>
              <Textarea
                id="service_description"
                placeholder="Describe el servicio que ofreces..."
                value={serviceForm.description}
                onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price_from">Precio Desde (ARS)</Label>
                <Input
                  id="price_from"
                  type="number"
                  placeholder="5000"
                  value={serviceForm.price_from}
                  onChange={(e) => setServiceForm({...serviceForm, price_from: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="price_to">Precio Hasta (ARS)</Label>
                <Input
                  id="price_to"
                  type="number"
                  placeholder="15000"
                  value={serviceForm.price_to}
                  onChange={(e) => setServiceForm({...serviceForm, price_to: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={addService} className="flex-1">
                Agregar Servicio
              </Button>
              <Button variant="outline" onClick={() => setIsAddingService(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Work Photo Button */}
      <Dialog open={isUploadingPhoto} onOpenChange={setIsUploadingPhoto}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Subir Foto de Trabajo
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subir Foto de Trabajo Realizado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="photo-file">Subir desde tu dispositivo *</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-muted-foreground/50 transition-colors">
                <Input
                  id="photo-file"
                  type="file"
                  accept="image/*,image/jpeg,image/jpg,image/png,image/webp"
                  capture="environment"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  required
                  className="sr-only"
                />
                <Label htmlFor="photo-file" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Click para seleccionar imagen</span>
                  <span className="text-xs text-muted-foreground">JPG, PNG, WEBP (máx. 10MB)</span>
                </Label>
              </div>
              {previewUrl && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-2">Vista previa:</p>
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="photo_caption">Descripción del Trabajo</Label>
              <Input
                id="photo_caption"
                placeholder="Ej: Balance anual empresa comercial"
                value={photoForm.caption}
                onChange={(e) => setPhotoForm({...photoForm, caption: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="work_type">Tipo de Trabajo</Label>
              <Input
                id="work_type"
                placeholder="Ej: Balances, Impuestos, etc."
                value={photoForm.work_type}
                onChange={(e) => setPhotoForm({...photoForm, work_type: e.target.value})}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={uploadWorkPhoto} className="flex-1" disabled={uploading || !selectedFile}>
                {uploading ? 'Subiendo...' : 'Subir Foto'}
              </Button>
              <Button variant="outline" onClick={() => {
                setIsUploadingPhoto(false);
                setSelectedFile(null);
                setPreviewUrl(null);
                setPhotoForm({ caption: '', work_type: '' });
              }}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};