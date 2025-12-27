import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { LocationAutocomplete } from '@/components/ui/location-autocomplete';
import { 
  CheckCircle2, 
  Circle, 
  Image, 
  FileText, 
  Phone, 
  MapPin, 
  Briefcase,
  Camera,
  Calendar,
  ChevronRight,
  Trophy,
  Upload,
  Loader2
} from 'lucide-react';

interface CompletionItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  icon: React.ElementType;
  action?: () => void;
  actionLabel?: string;
}

interface ProfileCompletionProgressProps {
  professionalId?: string;
  onTabChange?: (tab: string) => void;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
];

export const ProfileCompletionProgress: React.FC<ProfileCompletionProgressProps> = ({ 
  professionalId,
  onTabChange 
}) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CompletionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [professional, setProfessional] = useState<any>(null);

  // Modal states
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false);
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isServicesDialogOpen, setIsServicesDialogOpen] = useState(false);
  const [isPortfolioDialogOpen, setIsPortfolioDialogOpen] = useState(false);
  const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] = useState(false);

  // Form states
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePriceFrom, setServicePriceFrom] = useState('');
  const [servicePriceTo, setServicePriceTo] = useState('');
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [portfolioPreviews, setPortfolioPreviews] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [availabilityStartTime, setAvailabilityStartTime] = useState('09:00');
  const [availabilityEndTime, setAvailabilityEndTime] = useState('18:00');

  const photoInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      checkProfileCompletion();
    }
  }, [user, professionalId]);

  const checkProfileCompletion = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data: prof } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!prof) {
        setLoading(false);
        return;
      }

      setProfessional(prof);

      const { data: services } = await supabase
        .from('professional_services')
        .select('id')
        .eq('professional_id', prof.id);

      const { data: workPhotos } = await supabase
        .from('work_photos')
        .select('id')
        .eq('professional_id', prof.id);

      const { data: availabilitySlots } = await supabase
        .from('availability_slots')
        .select('id')
        .eq('professional_id', prof.id);

      const checklist: CompletionItem[] = [
        {
          id: 'photo',
          label: 'Foto de Perfil',
          description: 'Agrega una foto profesional para generar confianza',
          completed: !!prof.image_url,
          icon: Image,
          action: () => setIsPhotoDialogOpen(true),
          actionLabel: 'Agregar foto'
        },
        {
          id: 'description',
          label: 'Descripción Profesional',
          description: 'Describe tu experiencia y especialidades',
          completed: !!prof.description && prof.description.length > 50,
          icon: FileText,
          action: () => {
            setDescription(prof.description || '');
            setIsDescriptionDialogOpen(true);
          },
          actionLabel: 'Escribir descripción'
        },
        {
          id: 'phone',
          label: 'Teléfono de Contacto',
          description: 'Permite que los clientes te contacten fácilmente',
          completed: !!prof.phone,
          icon: Phone,
          action: () => {
            setPhone(prof.phone || '');
            setIsPhoneDialogOpen(true);
          },
          actionLabel: 'Agregar teléfono'
        },
        {
          id: 'location',
          label: 'Ubicación',
          description: 'Especifica tu zona de trabajo para aparecer en búsquedas locales',
          completed: !!prof.location && !!prof.latitude && !!prof.longitude,
          icon: MapPin,
          action: () => {
            setLocation(prof.location || '');
            setIsLocationDialogOpen(true);
          },
          actionLabel: 'Configurar ubicación'
        },
        {
          id: 'services',
          label: 'Servicios',
          description: 'Define los servicios que ofreces con sus precios',
          completed: (services?.length || 0) > 0,
          icon: Briefcase,
          action: () => {
            setServiceName('');
            setServiceDescription('');
            setServicePriceFrom('');
            setServicePriceTo('');
            setIsServicesDialogOpen(true);
          },
          actionLabel: 'Agregar servicios'
        },
        {
          id: 'portfolio',
          label: 'Fotos de Trabajos',
          description: 'Muestra ejemplos de tus trabajos anteriores',
          completed: (workPhotos?.length || 0) >= 3,
          icon: Camera,
          action: () => {
            setPortfolioFiles([]);
            setPortfolioPreviews([]);
            setIsPortfolioDialogOpen(true);
          },
          actionLabel: 'Subir fotos'
        },
        {
          id: 'availability',
          label: 'Disponibilidad',
          description: 'Configura tus horarios disponibles',
          completed: (availabilitySlots?.length || 0) > 0,
          icon: Calendar,
          action: () => {
            setSelectedDays([1, 2, 3, 4, 5]);
            setAvailabilityStartTime('09:00');
            setAvailabilityEndTime('18:00');
            setIsAvailabilityDialogOpen(true);
          },
          actionLabel: 'Configurar horarios'
        }
      ];

      setItems(checklist);

      const completedCount = checklist.filter(item => item.completed).length;
      const percentage = Math.round((completedCount / checklist.length) * 100);
      setCompletionPercentage(percentage);

    } catch (error) {
      console.error('Error checking profile completion:', error);
    } finally {
      setLoading(false);
    }
  };

  // Photo handlers
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoSave = async () => {
    if (!selectedPhotoFile || !professional) return;

    try {
      setSaving(true);

      const fileExt = selectedPhotoFile.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, selectedPhotoFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('professionals')
        .update({ image_url: urlData.publicUrl })
        .eq('id', professional.id);

      if (updateError) throw updateError;

      toast({ title: '¡Foto actualizada!', description: 'Tu foto de perfil se guardó correctamente.' });
      setIsPhotoDialogOpen(false);
      setPhotoPreview(null);
      setSelectedPhotoFile(null);
      checkProfileCompletion();
    } catch (error: any) {
      console.error('Error saving photo:', error);
      toast({ title: 'Error', description: error.message || 'No se pudo guardar la foto', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Description handler
  const handleDescriptionSave = async () => {
    if (!professional || description.length < 50) {
      toast({ title: 'Descripción muy corta', description: 'La descripción debe tener al menos 50 caracteres.', variant: 'destructive' });
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from('professionals')
        .update({ description })
        .eq('id', professional.id);

      if (error) throw error;

      toast({ title: '¡Descripción guardada!', description: 'Tu descripción profesional se actualizó.' });
      setIsDescriptionDialogOpen(false);
      checkProfileCompletion();
    } catch (error: any) {
      console.error('Error saving description:', error);
      toast({ title: 'Error', description: error.message || 'No se pudo guardar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Phone handler
  const handlePhoneSave = async () => {
    if (!professional || !phone.trim()) {
      toast({ title: 'Teléfono requerido', description: 'Ingresa un número de teléfono válido.', variant: 'destructive' });
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from('professionals')
        .update({ phone: phone.trim() })
        .eq('id', professional.id);

      if (error) throw error;

      toast({ title: '¡Teléfono guardado!', description: 'Tu número de contacto se actualizó.' });
      setIsPhoneDialogOpen(false);
      checkProfileCompletion();
    } catch (error: any) {
      console.error('Error saving phone:', error);
      toast({ title: 'Error', description: error.message || 'No se pudo guardar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Location handler
  const handleLocationSave = async () => {
    if (!professional || !location.trim()) {
      toast({ title: 'Ubicación requerida', description: 'Selecciona una ubicación válida.', variant: 'destructive' });
      return;
    }

    try {
      setSaving(true);

      // Get coordinates using geocoding (simplified - using fixed coords for Argentina)
      const { error } = await supabase
        .from('professionals')
        .update({ 
          location: location.trim(),
          latitude: -34.6037, // Default Buenos Aires coords
          longitude: -58.3816
        })
        .eq('id', professional.id);

      if (error) throw error;

      toast({ title: '¡Ubicación guardada!', description: 'Tu zona de trabajo se actualizó.' });
      setIsLocationDialogOpen(false);
      checkProfileCompletion();
    } catch (error: any) {
      console.error('Error saving location:', error);
      toast({ title: 'Error', description: error.message || 'No se pudo guardar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Service handler
  const handleServiceSave = async () => {
    if (!professional || !serviceName.trim()) {
      toast({ title: 'Nombre requerido', description: 'Ingresa el nombre del servicio.', variant: 'destructive' });
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from('professional_services')
        .insert({
          professional_id: professional.id,
          service_name: serviceName.trim(),
          description: serviceDescription.trim() || null,
          price_from: servicePriceFrom ? parseFloat(servicePriceFrom) : null,
          price_to: servicePriceTo ? parseFloat(servicePriceTo) : null,
          is_active: true
        });

      if (error) throw error;

      toast({ title: '¡Servicio agregado!', description: 'El servicio se guardó correctamente.' });
      setIsServicesDialogOpen(false);
      checkProfileCompletion();
    } catch (error: any) {
      console.error('Error saving service:', error);
      toast({ title: 'Error', description: error.message || 'No se pudo guardar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Portfolio handlers
  const handlePortfolioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setPortfolioFiles(files);
      const previews = files.map(file => URL.createObjectURL(file));
      setPortfolioPreviews(previews);
    }
  };

  const handlePortfolioSave = async () => {
    if (!professional || portfolioFiles.length === 0) {
      toast({ title: 'Selecciona fotos', description: 'Debes seleccionar al menos una foto.', variant: 'destructive' });
      return;
    }

    try {
      setSaving(true);

      for (const file of portfolioFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `${professional.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('work-photos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('work-photos')
          .getPublicUrl(filePath);

        const { error: insertError } = await supabase
          .from('work_photos')
          .insert({
            professional_id: professional.id,
            image_url: urlData.publicUrl,
            caption: '',
            work_type: 'Trabajo'
          });

        if (insertError) throw insertError;
      }

      toast({ title: '¡Fotos subidas!', description: `${portfolioFiles.length} foto(s) agregadas a tu portfolio.` });
      setIsPortfolioDialogOpen(false);
      setPortfolioFiles([]);
      setPortfolioPreviews([]);
      checkProfileCompletion();
    } catch (error: any) {
      console.error('Error saving portfolio:', error);
      toast({ title: 'Error', description: error.message || 'No se pudo subir las fotos', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Availability handler
  const handleAvailabilitySave = async () => {
    if (!professional || selectedDays.length === 0) {
      toast({ title: 'Selecciona días', description: 'Debes seleccionar al menos un día.', variant: 'destructive' });
      return;
    }

    try {
      setSaving(true);

      // Delete existing slots
      await supabase
        .from('availability_slots')
        .delete()
        .eq('professional_id', professional.id);

      // Insert new slots
      const slots = selectedDays.map(day => ({
        professional_id: professional.id,
        day_of_week: day,
        start_time: availabilityStartTime,
        end_time: availabilityEndTime,
        is_available: true
      }));

      const { error } = await supabase
        .from('availability_slots')
        .insert(slots);

      if (error) throw error;

      toast({ title: '¡Disponibilidad guardada!', description: 'Tus horarios se actualizaron.' });
      setIsAvailabilityDialogOpen(false);
      checkProfileCompletion();
    } catch (error: any) {
      console.error('Error saving availability:', error);
      toast({ title: 'Error', description: error.message || 'No se pudo guardar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-2 bg-muted rounded"></div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedItems = items.filter(item => item.completed).length;
  const totalItems = items.length;
  const isComplete = completedItems === totalItems;

  return (
    <>
      <Card className={isComplete ? "border-green-500 bg-green-50/50 dark:bg-green-950/10" : ""}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="flex items-center gap-2">
                {isComplete ? (
                  <>
                    <Trophy className="h-5 w-5 text-green-600" />
                    ¡Perfil Completo!
                  </>
                ) : (
                  <>
                    <Circle className="h-5 w-5" />
                    Completa tu Perfil
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {isComplete 
                  ? 'Tu perfil está 100% completo. ¡Excelente trabajo!'
                  : `${completedItems} de ${totalItems} elementos completados`
                }
              </CardDescription>
            </div>
            <Badge variant={isComplete ? "default" : "secondary"} className="text-lg px-3 py-1">
              {completionPercentage}%
            </Badge>
          </div>

          <Progress value={completionPercentage} className="h-3 mt-4" />
        </CardHeader>

        <CardContent className="space-y-2">
          {!isComplete && (
            <p className="text-sm text-muted-foreground mb-4">
              Un perfil completo aumenta tu visibilidad y genera más confianza en los clientes.
            </p>
          )}

          <div className="space-y-2">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                    item.completed 
                      ? 'bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900' 
                      : 'bg-muted/30 hover:bg-muted/50 border-transparent'
                  }`}
                >
                  <div className={`mt-0.5 ${item.completed ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {item.completed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <h4 className={`font-medium text-sm ${
                        item.completed ? 'text-green-700 dark:text-green-400' : ''
                      }`}>
                        {item.label}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.description}
                    </p>
                  </div>

                  {!item.completed && item.action && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={item.action}
                      className="flex-shrink-0"
                    >
                      {item.actionLabel}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {isComplete && (
            <div className="mt-4 p-4 bg-green-100 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
              <p className="text-sm text-green-800 dark:text-green-300">
                <strong>¡Felicitaciones!</strong> Tu perfil está optimizado para recibir más clientes. 
                Asegúrate de mantenerlo actualizado con tus últimos trabajos y disponibilidad.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Dialog */}
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Foto de Perfil
            </DialogTitle>
            <DialogDescription>
              Selecciona una foto profesional para tu perfil
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoSelect}
            />
            
            {photoPreview ? (
              <div className="flex flex-col items-center gap-4">
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  className="w-40 h-40 rounded-full object-cover border-4 border-primary"
                />
                <Button 
                  variant="outline" 
                  onClick={() => photoInputRef.current?.click()}
                >
                  Cambiar foto
                </Button>
              </div>
            ) : (
              <div 
                onClick={() => photoInputRef.current?.click()}
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium">Toca para seleccionar o tomar foto</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG hasta 5MB</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPhotoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePhotoSave} disabled={!selectedPhotoFile || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Guardar foto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Description Dialog */}
      <Dialog open={isDescriptionDialogOpen} onOpenChange={setIsDescriptionDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Descripción Profesional
            </DialogTitle>
            <DialogDescription>
              Describe tu experiencia y lo que te hace especial
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Cuéntale a tus clientes sobre tu experiencia, especialidades y qué pueden esperar de tu trabajo..."
              rows={6}
              className="resize-none"
            />
            <p className={`text-xs ${description.length >= 50 ? 'text-green-600' : 'text-muted-foreground'}`}>
              {description.length}/50 caracteres mínimos
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDescriptionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleDescriptionSave} disabled={description.length < 50 || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Phone Dialog */}
      <Dialog open={isPhoneDialogOpen} onOpenChange={setIsPhoneDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Teléfono de Contacto
            </DialogTitle>
            <DialogDescription>
              Agrega tu número para que los clientes te contacten
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">Número de teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+54 9 11 1234-5678"
                className="mt-1.5"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPhoneDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePhoneSave} disabled={!phone.trim() || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Location Dialog */}
      <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ubicación
            </DialogTitle>
            <DialogDescription>
              Indica tu zona de trabajo para aparecer en búsquedas locales
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <LocationAutocomplete
              value={location}
              onChange={setLocation}
              placeholder="Ej: Palermo, Buenos Aires"
              label="Ciudad / Zona"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLocationDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleLocationSave} disabled={!location.trim() || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Services Dialog */}
      <Dialog open={isServicesDialogOpen} onOpenChange={setIsServicesDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Agregar Servicio
            </DialogTitle>
            <DialogDescription>
              Define un servicio que ofreces con su precio
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="serviceName">Nombre del servicio *</Label>
              <Input
                id="serviceName"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="Ej: Corte de pelo"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="serviceDesc">Descripción (opcional)</Label>
              <Textarea
                id="serviceDesc"
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                placeholder="Describe el servicio..."
                rows={2}
                className="mt-1.5 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priceFrom">Precio desde ($)</Label>
                <Input
                  id="priceFrom"
                  type="number"
                  value={servicePriceFrom}
                  onChange={(e) => setServicePriceFrom(e.target.value)}
                  placeholder="0"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="priceTo">Precio hasta ($)</Label>
                <Input
                  id="priceTo"
                  type="number"
                  value={servicePriceTo}
                  onChange={(e) => setServicePriceTo(e.target.value)}
                  placeholder="0"
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsServicesDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleServiceSave} disabled={!serviceName.trim() || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Agregar servicio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Portfolio Dialog */}
      <Dialog open={isPortfolioDialogOpen} onOpenChange={setIsPortfolioDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Fotos de Trabajos
            </DialogTitle>
            <DialogDescription>
              Sube fotos de tus trabajos anteriores (mínimo 3 recomendadas)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <input
              ref={portfolioInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePortfolioSelect}
            />
            
            {portfolioPreviews.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {portfolioPreviews.map((preview, index) => (
                    <img 
                      key={index}
                      src={preview} 
                      alt={`Preview ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => portfolioInputRef.current?.click()}
                  className="w-full"
                >
                  Agregar más fotos
                </Button>
              </div>
            ) : (
              <div 
                onClick={() => portfolioInputRef.current?.click()}
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <Camera className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium">Toca para seleccionar fotos</p>
                <p className="text-xs text-muted-foreground mt-1">Puedes seleccionar varias a la vez</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPortfolioDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePortfolioSave} disabled={portfolioFiles.length === 0 || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Subir {portfolioFiles.length > 0 ? `${portfolioFiles.length} foto(s)` : 'fotos'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Availability Dialog */}
      <Dialog open={isAvailabilityDialogOpen} onOpenChange={setIsAvailabilityDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Disponibilidad
            </DialogTitle>
            <DialogDescription>
              Configura los días y horarios en que trabajas
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <Label className="mb-3 block">Días de trabajo</Label>
              <div className="grid grid-cols-2 gap-2">
                {DAYS_OF_WEEK.map(day => (
                  <div 
                    key={day.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`day-${day.value}`}
                      checked={selectedDays.includes(day.value)}
                      onCheckedChange={() => toggleDay(day.value)}
                    />
                    <label 
                      htmlFor={`day-${day.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {day.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Hora inicio</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={availabilityStartTime}
                  onChange={(e) => setAvailabilityStartTime(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="endTime">Hora fin</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={availabilityEndTime}
                  onChange={(e) => setAvailabilityEndTime(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAvailabilityDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAvailabilitySave} disabled={selectedDays.length === 0 || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Guardar disponibilidad
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
