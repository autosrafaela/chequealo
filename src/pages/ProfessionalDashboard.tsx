import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import { ContactRequestsPanel } from '@/components/ContactRequestsPanel';
import { SubscriptionPanel } from '@/components/SubscriptionPanel';
import { SubscriptionAlert } from '@/components/SubscriptionAlert';
import { ServicesManager } from '@/components/ServicesManager';
import { WorkPhotosManager } from '@/components/WorkPhotosManager';
import { ReviewManagementPanel } from '@/components/ReviewManagementPanel';

import { EditMyServices } from '@/components/EditMyServices';
import { TransactionConfirmationCard } from '@/components/TransactionConfirmationCard';
import { ReadyToRateTransactions } from '@/components/ReadyToRateTransactions';

import { EnableNotificationsBanner } from '@/components/EnableNotificationsBanner';
import SlugConfiguration from '@/components/SlugConfiguration';
import { useTransactionConfirmation } from '@/hooks/useTransactionConfirmation';
import { MessagesDesktopLayout } from '@/components/chat/MessagesDesktopLayout';
import { 
  DashboardSkeleton, 
  NewUserDashboard, 
  ActiveUserDashboard, 
  InactiveUserDashboard 
} from '@/components/dashboard';
import { calculateProfileCompletion, calculateDaysSinceLastLogin } from '@/utils/profileCompletion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  MessageCircle, 
  Users, 
  Eye,
  AlertCircle,
  Camera,
  Save,
  Pencil,
  ImageIcon,
  MapPin
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  totalReviews: number;
  averageRating: number;
  profileViews: number;
  pendingResponses: number;
  weeklyVisits?: number;
  lastMonthContacts?: number;
}

interface ProfileCounts {
  servicesCount: number;
  workPhotosCount: number;
  availabilityCount: number;
}

// ── Inline Profile Tab Component ──
const ProfileTabContent = ({ professional, user, onTabChange, onUpdate }: {
  professional: any;
  user: any;
  onTabChange: (tab: string) => void;
  onUpdate: (updated: any) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: professional?.full_name || '',
    phone: professional?.phone || '',
    location: professional?.location || '',
    description: professional?.description || '',
  });
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData({
      full_name: professional?.full_name || '',
      phone: professional?.phone || '',
      location: professional?.location || '',
      description: professional?.description || '',
    });
  }, [professional]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('professionals')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          location: formData.location,
          description: formData.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', professional.id);

      if (error) throw error;
      toast.success('Datos actualizados');
      onUpdate({ ...professional, ...formData });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const filePath = `${professional.id}/avatar.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('professional-photos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('professional-photos')
        .getPublicUrl(filePath);

      const imageUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('professionals')
        .update({ image_url: imageUrl })
        .eq('id', professional.id);

      if (updateError) throw updateError;

      onUpdate({ ...professional, image_url: imageUrl });
      toast.success('Foto actualizada');
    } catch (err) {
      console.error(err);
      toast.error('Error al subir la foto');
    }
  };

  return (
    <div className="space-y-8">
      {/* Main Profile Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-8">
          {/* Photo + Name Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative group mb-4">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-background shadow-lg">
                {professional.image_url ? (
                  <img
                    src={professional.image_url}
                    alt={professional.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>

            {!isEditing && (
              <>
                <h2 className="text-2xl font-bold text-foreground">{professional.full_name}</h2>
                <p className="text-muted-foreground mt-1">{professional.profession}</p>
                {professional.is_verified && (
                  <Badge className="mt-2 bg-emerald-500 text-white">✓ Verificado</Badge>
                )}
              </>
            )}

            <div className="flex gap-3 mt-4">
              <Button asChild variant="outline" size="sm">
                <Link to={professional.slug ? `/${professional.slug}` : `/professional/${professional.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Perfil Público
                </Link>
              </Button>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
          </div>

          {/* Editable Fields */}
          {isEditing ? (
            <div className="space-y-5 max-w-md mx-auto">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium">Nombre completo</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">WhatsApp / Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+54 11 1234-5678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">Ubicación</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Ciudad, Provincia"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Descripción profesional</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Contá brevemente sobre vos y tu trabajo..."
                  rows={4}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground w-24">WhatsApp</span>
                <span className="font-medium">{professional.phone || '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground w-24">Ubicación</span>
                <span className="font-medium flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {professional.location || '—'}
                </span>
              </div>
              {professional.description && (
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {professional.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* URL Personalizada */}
      <SlugConfiguration 
        professionalId={professional.id} 
        currentSlug={professional.slug || null}
        onSlugUpdated={(newSlug) => {
          onUpdate({ ...professional, slug: newSlug });
        }}
      />

      {/* Acceso a Galería */}
      <Button
        className="w-full h-14 text-base gap-3"
        onClick={() => onTabChange('portfolio')}
      >
        <ImageIcon className="h-5 w-5" />
        Galería de Trabajos
      </Button>
    </div>
  );
};

const ProfessionalDashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [professional, setProfessional] = useState<any>(null);
  const [profileCounts, setProfileCounts] = useState<ProfileCounts>({
    servicesCount: 0,
    workPhotosCount: 0,
    availabilityCount: 0,
  });
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    totalReviews: 0,
    averageRating: 0,
    profileViews: 0,
    pendingResponses: 0,
    weeklyVisits: 0,
    lastMonthContacts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('messages');
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [isActiveInZone, setIsActiveInZone] = useState(false);
  const [showTabs, setShowTabs] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  
  const tabsRef = useRef<HTMLDivElement>(null);

  const { 
    pendingTransactions, 
    loading: confirmLoading, 
    confirmCompletion 
  } = useTransactionConfirmation();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setShowTabs(true);
    
    setTimeout(() => {
      tabsRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchLastSeen();
    }
  }, [user]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    const conversation = searchParams.get('conversation');
    
    if (tab) {
      setActiveTab(tab);
      setShowTabs(true);
    }
    if (conversation) setConversationId(conversation);
  }, [searchParams]);

  const fetchLastSeen = async () => {
    if (!user?.id) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('last_seen')
      .eq('user_id', user.id)
      .maybeSingle();
    
    setLastSeen(data?.last_seen || null);

    // Update last_seen
    await supabase
      .from('profiles')
      .update({ last_seen: new Date().toISOString() })
      .eq('user_id', user.id);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const { data: professionalData, error: profError } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (profError) throw profError;
      
      if (!professionalData) {
        setLoading(false);
        return;
      }

      setProfessional(professionalData);

      // Get counts for profile completion
      const [servicesResult, photosResult, availabilityResult] = await Promise.all([
        supabase.from('professional_services').select('id', { count: 'exact' }).eq('professional_id', professionalData.id),
        supabase.from('work_photos').select('id', { count: 'exact' }).eq('professional_id', professionalData.id),
        supabase.from('availability_slots').select('id', { count: 'exact' }).eq('professional_id', professionalData.id),
      ]);

      setProfileCounts({
        servicesCount: servicesResult.count || 0,
        workPhotosCount: photosResult.count || 0,
        availabilityCount: availabilityResult.count || 0,
      });

      // Check if active in zone today
      const today = new Date().toISOString().split('T')[0];
      const { data: proRoute } = await supabase
        .from('pro_routes')
        .select('id, is_active')
        .eq('professional_id', professionalData.id)
        .eq('route_date', today)
        .maybeSingle();
      
      setIsActiveInZone(proRoute?.is_active || false);

      // Get contact requests stats
      const { data: requests, error: reqError } = await supabase
        .from('contact_requests')
        .select('id, status')
        .eq('professional_id', professionalData.id);

      if (reqError) throw reqError;

      // Get reviews stats
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('id, rating')
        .eq('professional_id', professionalData.id);

      if (reviewsError) throw reviewsError;

      // Get pending responses count
      const reviewIds = reviews?.map(r => r.id) || [];
      let pendingResponses = 0;
      if (reviewIds.length > 0) {
        const { data: responses } = await supabase
          .from('review_responses')
          .select('review_id')
          .in('review_id', reviewIds);

        const respondedReviewIds = responses?.map(r => r.review_id) || [];
        pendingResponses = reviewIds.filter(id => !respondedReviewIds.includes(id)).length;
      }

      // Calculate stats
      const totalRequests = requests?.length || 0;
      const pendingRequests = requests?.filter(r => r.status === 'pending').length || 0;
      const totalReviews = reviews?.length || 0;
      const averageRating = totalReviews > 0 
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews 
        : 0;

      setStats({
        totalRequests,
        pendingRequests,
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        profileViews: 0,
        pendingResponses,
        weeklyVisits: 0,
        lastMonthContacts: 0,
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleZone = async (active: boolean) => {
    if (!professional) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    try {
      if (active) {
        const { error } = await supabase
          .from('pro_routes')
          .upsert({
            professional_id: professional.id,
            route_date: today,
            is_active: true,
            neighborhoods: [],
          }, { onConflict: 'professional_id,route_date' });
        
        if (error) throw error;
        toast.success('¡Estás visible en la zona!');
      } else {
        const { error } = await supabase
          .from('pro_routes')
          .update({ is_active: false })
          .eq('professional_id', professional.id)
          .eq('route_date', today);
        
        if (error) throw error;
        toast.info('Ya no estás visible en la zona');
      }
      
      setIsActiveInZone(active);
    } catch (error) {
      console.error('Error toggling zone:', error);
      toast.error('Error al cambiar visibilidad');
    }
  };

  const handleOpenChecklist = (stepId: string) => {
    // Map step IDs to tab names
    const stepToTab: Record<string, string> = {
      'services': 'services',
      'portfolio': 'portfolio',
      'availability': 'settings',
    };
    
    if (stepToTab[stepId]) {
      handleTabChange(stepToTab[stepId]);
    } else {
      // For other steps, open the profile tab or trigger modal in ProfileCompletionProgress
      handleTabChange('profile');
    }
  };

  const handleReactivate = () => {
    handleToggleZone(true);
  };

  // Profession change handler
  const handleProfessionChange = async (newProfession: string) => {
    if (!professional?.id) return;
    
    try {
      const { error } = await supabase
        .from('professionals')
        .update({ 
          profession: newProfession,
          updated_at: new Date().toISOString()
        })
        .eq('id', professional.id);

      if (error) throw error;

      setProfessional({ ...professional, profession: newProfession });
      toast.success('Profesión actualizada');
    } catch (error) {
      console.error('Error updating profession:', error);
      toast.error('Error al actualizar la profesión');
    }
  };

  // Profession list for selector
  const PROFESSIONS = [
    { value: 'Plomero / Gasista', icon: '🔧' },
    { value: 'Electricista', icon: '⚡' },
    { value: 'Electricista Matriculado', icon: '⚡' },
    { value: 'Técnico de Aire Acondicionado', icon: '❄️' },
    { value: 'Técnico en Refrigeración', icon: '❄️' },
    { value: 'Técnico en Calefacción', icon: '🔥' },
    { value: 'Pintor', icon: '🎨' },
    { value: 'Pintor de Obras', icon: '🎨' },
    { value: 'Albañil', icon: '🧱' },
    { value: 'Carpintero / Ebanista', icon: '🪚' },
    { value: 'Cerrajero', icon: '🔑' },
    { value: 'Jardinero', icon: '🌱' },
    { value: 'Jardinero / Paisajista', icon: '🌱' },
    { value: 'Limpieza y Mantenimiento', icon: '🧹' },
    { value: 'Empleada Doméstica / Servicio de Limpieza', icon: '🧹' },
    { value: 'Fletero / Mudanzas', icon: '📦' },
    { value: 'Técnico de PC', icon: '💻' },
    { value: 'Reparación de Computadoras', icon: '💻' },
    { value: 'Reparación de Celulares', icon: '📱' },
    { value: 'Técnico de Celulares', icon: '📱' },
    { value: 'Mecánico', icon: '🚗' },
    { value: 'Mecánico de Motos', icon: '🏍️' },
    { value: 'Gomería', icon: '🛞' },
    { value: 'Herrero', icon: '⚒️' },
    { value: 'Herrería de Obra', icon: '⚒️' },
    { value: 'Soldador', icon: '🔥' },
    { value: 'Instalador de Durlock / Yesero', icon: '🪛' },
    { value: 'Colocador de Cerámicos', icon: '🏠' },
    { value: 'Colocador de Pisos', icon: '🏠' },
    { value: 'Colocador de Porcelanatos', icon: '🏠' },
    { value: 'Techista', icon: '🏠' },
    { value: 'Vidriería', icon: '🪟' },
    { value: 'Tapicero', icon: '🛋️' },
    { value: 'Cortinero', icon: '🪟' },
    { value: 'Instalador de Cámaras de Seguridad', icon: '📹' },
    { value: 'Instalador de Alarmas', icon: '🚨' },
    { value: 'Instalador de TV', icon: '📺' },
    { value: 'Instalador de Internet', icon: '🌐' },
    { value: 'Instalador de Paneles Solares', icon: '☀️' },
    { value: 'Fumigador / Control de Plagas', icon: '🦟' },
    { value: 'Limpieza de Tanques de Agua', icon: '🚰' },
    { value: 'Limpieza de Alfombras', icon: '🧹' },
    { value: 'Limpieza de Tapizados', icon: '🧹' },
    { value: 'Piscinas / Piletas Colocación', icon: '🏊' },
    { value: 'Podador de Árboles', icon: '🌳' },
    { value: 'Peluquero/a', icon: '💇' },
    { value: 'Barbero', icon: '💈' },
    { value: 'Manicurista', icon: '💅' },
    { value: 'Pedicurista', icon: '🦶' },
    { value: 'Maquillador/a', icon: '💄' },
    { value: 'Esteticista', icon: '✨' },
    { value: 'Masajista', icon: '💆' },
    { value: 'Entrenador Personal', icon: '🏋️' },
    { value: 'Profesor de Yoga', icon: '🧘' },
    { value: 'Profesor de Pilates', icon: '🧘' },
    { value: 'Nutricionista', icon: '🥗' },
    { value: 'Kinesiólogo / Fisioterapeuta', icon: '🩺' },
    { value: 'Enfermero/a', icon: '👩‍⚕️' },
    { value: 'Cuidador/a de Adultos Mayores', icon: '👴' },
    { value: 'Cuidador/a de Niños (Niñera)', icon: '👶' },
    { value: 'Psicólogo', icon: '🧠' },
    { value: 'Fonoaudiólogo', icon: '🗣️' },
    { value: 'Veterinario', icon: '🐕' },
    { value: 'Peluquero Canino', icon: '🐩' },
    { value: 'Cuidador de Mascotas', icon: '🐾' },
    { value: 'Paseador de Perros', icon: '🦮' },
    { value: 'Adiestrador de Perros', icon: '🐕‍🦺' },
    { value: 'Fotógrafo', icon: '📷' },
    { value: 'Camarógrafo', icon: '🎥' },
    { value: 'Editor de Video', icon: '🎬' },
    { value: 'Diseñador Gráfico', icon: '🎨' },
    { value: 'Desarrollador Web', icon: '💻' },
    { value: 'Community Manager', icon: '📱' },
    { value: 'Redactor de Contenidos', icon: '✍️' },
    { value: 'Contador', icon: '📊' },
    { value: 'Contadora Pública', icon: '📊' },
    { value: 'Abogado', icon: '⚖️' },
    { value: 'Escribano', icon: '📝' },
    { value: 'Arquitecta', icon: '🏗️' },
    { value: 'Ingeniero', icon: '👷' },
    { value: 'Asesor Inmobiliario', icon: '🏠' },
    { value: 'Martillero Público', icon: '🔨' },
    { value: 'Gestor del Automotor', icon: '🚗' },
    { value: 'Asesor de Seguros', icon: '📋' },
    { value: 'Profesor Particular', icon: '📚' },
    { value: 'Profesor de Matemáticas', icon: '➗' },
    { value: 'Profesor de Idiomas', icon: '🌍' },
    { value: 'Profesora de Inglés', icon: '🇬🇧' },
    { value: 'Profesor de Música', icon: '🎵' },
    { value: 'Profesor de Música (Guitarra)', icon: '🎸' },
    { value: 'Profesor de Música (Piano)', icon: '🎹' },
    { value: 'Profesor de Canto', icon: '🎤' },
    { value: 'Profesor de Danza', icon: '💃' },
    { value: 'Chef a Domicilio', icon: '👨‍🍳' },
    { value: 'Pastelero', icon: '🎂' },
    { value: 'Repostero', icon: '🧁' },
    { value: 'Catering', icon: '🍽️' },
    { value: 'Barman / Bartender', icon: '🍸' },
    { value: 'Chofer Particular', icon: '🚘' },
    { value: 'Remisero', icon: '🚕' },
    { value: 'Mensajería', icon: '📦' },
    { value: 'Decorador de Interiores', icon: '🛋️' },
    { value: 'Diseñador de Interiores', icon: '🏠' },
    { value: 'Organizador Profesional', icon: '📦' },
    { value: 'Modista/Costurera/Confeccionista a medida/Bordados', icon: '🧵' },
    { value: 'Traductor', icon: '🌐' },
    { value: 'Automatización con IA', icon: '🤖' },
    { value: 'Otro', icon: '🛠️' },
  ];

  // Get profession icon by value
  const getProfessionIcon = (value: string) => {
    const profession = PROFESSIONS.find(p => p.value === value);
    return profession?.icon || '🛠️';
  };

  // Calculate profile completion
  const profileCompletion = professional ? calculateProfileCompletion(professional, profileCounts) : 0;
  const daysSinceLastLogin = calculateDaysSinceLastLogin(lastSeen);

  // Determine which dashboard variant to show
  const getDashboardVariant = () => {
    if (!professional) return 'none';
    if (profileCompletion < 50) return 'new';
    if (daysSinceLastLogin > 7) return 'inactive';
    return 'active';
  };

  const dashboardVariant = getDashboardVariant();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-xl font-semibold mb-4">No tienes un perfil de profesional</h2>
              <p className="text-muted-foreground mb-6">
                Crea tu perfil de profesional para comenzar a recibir solicitudes de clientes
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button asChild>
                  <Link to="/user-dashboard?activate=professional">Activar Perfil Profesional</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/">Continuar como Usuario</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Notifications Banner */}
        <EnableNotificationsBanner className="mb-4" />
        
        {/* Subscription Alert */}
        <SubscriptionAlert />
        
        {/* Header minimalista */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Hola, {professional.full_name?.split(' ')[0]} 👋
            </h1>
            
            {/* Dropdown directo de profesión */}
            <Select
              value={professional.profession || 'Otro'}
              onValueChange={handleProfessionChange}
            >
              <SelectTrigger className="w-fit h-auto p-0 border-0 shadow-none text-sm text-muted-foreground hover:text-primary focus:ring-0 [&>svg]:ml-1 [&>svg]:h-3 [&>svg]:w-3">
                <SelectValue>
                  <span className="flex items-center gap-1.5">
                    <span>{getProfessionIcon(professional.profession || 'Otro')}</span>
                    <span>{professional.profession || 'Elegir profesión'}</span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {PROFESSIONS.map((profession) => (
                  <SelectItem key={profession.value} value={profession.value}>
                    <span className="flex items-center gap-2">
                      <span>{profession.icon}</span>
                      <span>{profession.value}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/user-dashboard'}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Panel Usuario
          </Button>
        </div>

        {/* Conditional Dashboard based on user state */}
        <div className="mb-8">
          {dashboardVariant === 'new' && (
            <NewUserDashboard
              professional={professional}
              completion={profileCompletion}
              counts={profileCounts}
              onOpenChecklist={handleOpenChecklist}
            />
          )}
          
          {dashboardVariant === 'inactive' && (
            <InactiveUserDashboard
              professional={professional}
              stats={stats}
              daysSinceLastLogin={daysSinceLastLogin}
              onReactivate={handleReactivate}
              onTabChange={handleTabChange}
            />
          )}
          
          {dashboardVariant === 'active' && (
            <ActiveUserDashboard
              professional={professional}
              stats={stats}
              completion={profileCompletion}
              isActiveInZone={isActiveInZone}
              onToggleZone={handleToggleZone}
              onTabChange={handleTabChange}
            />
          )}
        </div>

        {/* Tabs Section - Collapsible by default, shown when navigated */}
        <div ref={tabsRef} className="scroll-mt-4">
          {(showTabs || pendingTransactions.length > 0) && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 sticky top-4 z-10 bg-background h-auto flex-wrap">
                <TabsTrigger value="messages" className="text-xs">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Mensajes
                  {stats.pendingRequests > 0 && (
                    <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-[10px]">
                      {stats.pendingRequests}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="reviews" className="text-xs">
                  Reseñas
                </TabsTrigger>
                <TabsTrigger value="services" className="text-xs">
                  Servicios
                </TabsTrigger>
                <TabsTrigger value="portfolio" className="text-xs">
                  Galería
                </TabsTrigger>
                <TabsTrigger value="subscription" className="text-xs">
                  Suscripción
                </TabsTrigger>
                <TabsTrigger value="profile" className="text-xs">
                  Mi Perfil
                </TabsTrigger>
              </TabsList>

              <TabsContent value="messages">
                {/* Solicitudes integradas como sección colapsable */}
                {(pendingTransactions.length > 0 || stats.pendingRequests > 0) && (
                  <div className="mb-4 space-y-4">
                    {pendingTransactions.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-primary" />
                          <h3 className="text-base font-semibold">Confirmaciones Pendientes</h3>
                          <Badge variant="default">{pendingTransactions.length}</Badge>
                        </div>
                        {pendingTransactions.map((transaction) => (
                          <TransactionConfirmationCard
                            key={transaction.id}
                            transaction={transaction}
                            isProfessional={true}
                            onConfirm={confirmCompletion}
                            disabled={confirmLoading}
                          />
                        ))}
                      </div>
                    )}

                    <ReadyToRateTransactions 
                      isProfessional={true}
                      onRate={() => setActiveTab('reviews')}
                    />

                    <ContactRequestsPanel />
                  </div>
                )}

                <MessagesDesktopLayout 
                  initialConversationId={conversationId} 
                  isProfessional={true} 
                />
              </TabsContent>

              <TabsContent value="reviews">
                <ReviewManagementPanel />
              </TabsContent>

              <TabsContent value="services">
                <div className="space-y-6">
                  <EditMyServices 
                    professionalData={professional}
                    onUpdate={fetchDashboardData}
                  />
                  <ServicesManager />
                </div>
              </TabsContent>

              <TabsContent value="portfolio">
                <WorkPhotosManager />
              </TabsContent>





              <TabsContent value="subscription">
                <SubscriptionPanel />
              </TabsContent>

              <TabsContent value="profile">
                <ProfileTabContent 
                  professional={professional}
                  user={user}
                  onTabChange={handleTabChange}
                  onUpdate={(updated: any) => {
                    setProfessional(updated);
                    fetchDashboardData();
                  }}
                />
              </TabsContent>
            </Tabs>
          )}
          
          {/* Button to show tabs when hidden */}
          {!showTabs && pendingTransactions.length === 0 && (
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => setShowTabs(true)}
            >
              Gestionar mi negocio
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
