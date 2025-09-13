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
  
  const [profileForm, setProfileForm] = useState({
    description: professionalData?.description || '',
    phone: professionalData?.phone || '',
    email: professionalData?.email || ''
  });

  const [serviceForm, setServiceForm] = useState({
    service_name: '',
    description: '',
    price_from: '',
    price_to: ''
  });

  const [photoForm, setPhotoForm] = useState({
    caption: '',
    work_type: '',
    image_url: ''
  });

  const updateProfile = async () => {
    try {
      const { error } = await supabase
        .from('professionals')
        .update({
          description: profileForm.description,
          phone: profileForm.phone,
          email: profileForm.email,
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

  const uploadWorkPhoto = async () => {
    try {
      const { error } = await supabase
        .from('work_photos')
        .insert({
          professional_id: professionalData.id,
          image_url: photoForm.image_url,
          caption: photoForm.caption,
          work_type: photoForm.work_type,
          uploaded_by: 'professional'
        });

      if (error) throw error;

      toast.success('Foto de trabajo agregada');
      setIsUploadingPhoto(false);
      setPhotoForm({ caption: '', work_type: '', image_url: '' });
      onUpdate();
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Error al subir la foto');
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
            <div>
              <Label htmlFor="image_url">URL de la Imagen</Label>
              <Input
                id="image_url"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={photoForm.image_url}
                onChange={(e) => setPhotoForm({...photoForm, image_url: e.target.value})}
              />
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
              <Button onClick={uploadWorkPhoto} className="flex-1">
                Subir Foto
              </Button>
              <Button variant="outline" onClick={() => setIsUploadingPhoto(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};