import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LocationAutocomplete } from '@/components/ui/location-autocomplete';
import { toast } from 'sonner';
import { 
  User, 
  Heart, 
  MessageSquare, 
  Settings, 
  Camera,
  Mail,
  MapPin,
  Calendar,
  Star,
  ExternalLink,
  Briefcase,
  Plus,
  Key,
  Download,
  Trash2,
  Smartphone,
  AlertCircle,
  Search,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Header from '@/components/Header';
import { Navigate, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { MessagesDesktopLayout } from '@/components/chat/MessagesDesktopLayout';
import { UserTransactionReviews } from '@/components/UserTransactionReviews';
import PWAFeatures from '@/components/PWAFeatures';
import PushNotificationToggle from '@/components/PushNotificationToggle';
import { EnableNotificationsBanner } from '@/components/EnableNotificationsBanner';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useFavorites } from '@/hooks/useFavorites';
import { getAvatarColor, getAvatarTextColor } from '@/utils/avatarColors';

// Interfaces for user profile and contact requests
interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  bio: string;
  location?: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}


interface FavoriteProfessional {
  id: string;
  full_name: string;
  profession: string;
  image_url: string | null;
}

const UserDashboard = () => {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isProfessional, setIsProfessional] = useState(false);
  const [showProfessionalForm, setShowProfessionalForm] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Favorites
  const { favorites, loading: favoritesLoading } = useFavorites();
  const [favoriteProfessionals, setFavoriteProfessionals] = useState<FavoriteProfessional[]>([]);

  // Form states
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Professional form states
  const [professionalData, setProfessionalData] = useState({
    full_name: '',
    email: '',
    phone: '',
    profession: '',
    location: '',
    description: '',
    dni: ''
  });
  const [creatingProfessional, setCreatingProfessional] = useState(false);
  const [professionCategories, setProfessionCategories] = useState<any[]>([]);
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
  const [professionSearch, setProfessionSearch] = useState('');
  const [showProfessionDropdown, setShowProfessionDropdown] = useState(false);

  // Lista completa de profesiones disponibles (130+)
  const allProfessions = [
    "Abogado", "Acompañante Terapéutico", "Adiestrador de Perros", "Agrimensor", "Albañil",
    "Alisadora Profesional", "Arquitecta", "Asesor de Seguros", "Asesor Inmobiliario",
    "Automatización con IA", "Auxiliares de Estudio", "Barman / Bartender", "Barbero",
    "Camarógrafo", "Capacitación en Manejo y Programación de Tornos CNC", "Carpintero / Ebanista", "Catering", "Cerrajero", "Chapista y Pintor Automotor",
    "Chef a Domicilio", "Chofer Particular", "Colocador de Cerámicos", "Colocador de Pisos",
    "Colocador de Porcelanatos", "Community Manager", "Contadora Pública", "Contador",
    "Control de Plagas y Fumigación", "Cortinero", "Cursos/Formación", "Cuidador de Mascotas",
    "Cuidador/a de Adultos Mayores", "Cuidador/a de Niños (Niñera)", "Decorador de Interiores",
    "Desinfección y Sanitización", "Detailing", "Detailing de Autos", "Desarrollador Web",
    "Diseñador de Interiores", "Diseñador Gráfico", "Editor de Video", "Electricista",
    "Electricista Matriculado", "Empleada Doméstica / Servicio de Limpieza", 
    "Encomiendas/Comisionista", "Enfermero/a", "Entrenador Personal", "Escribano", "Esteticista", 
    "Fletero / Mudanzas", "Fonoaudiólogo",
    "Fotógrafo", "Fumigador / Control de Plagas", "Gestor del Automotor", "Gomería", "Herrero",
    "Herrería de Obra", "Ingeniero", "Instalador de Alarmas", "Instalador de Audio para Autos",
    "Instalador de Cámaras de Seguridad", "Instalador de Durlock / Yesero",
    "Instalador de Internet", "Instalador de Paneles Solares", "Instalador de TV", "Jardinero",
    "Jardinero / Paisajista", "Kinesiólogo / Fisioterapeuta", "Lavadero de Autos",
    "Limpieza de Alfombras", "Limpieza de Persianas", "Limpieza de Tanques de Agua",
    "Limpieza de Tapizados", "Limpieza y Mantenimiento", "Manicurista", "Maquillador/a",
    "Maquillador Profesional", "Maquilladora Artística", "Maquilladora Social", "Martillero Público",
    "Masajista", "Modista/Costurera/Confeccionista a medida/Bordados", "Mecánico",
    "Mecánico de Motos", "Mensajería", "Nutricionista", "Organizador Profesional",
    "Paseador de Perros", "Pastelero", "Pedicurista", "Peluquero/a", "Peluquero Canino",
    "Personal Shopper", "Pintor", "Pintor de Obras", "Piscinas / Piletas Colocación",
    "Plomero / Gasista", "Podador de Árboles", "Polarizado de Vidrios", "Profesor de Apoyo Escolar",
    "Profesor de Canto", "Profesor de Danza", "Profesor de Dibujo y Pintura", "Profesor de Física",
    "Profesor de Idiomas", "Profesor de Matemáticas", "Profesor de Música",
    "Profesor de Música (Guitarra)", "Profesor de Música (Piano)", "Profesor de Química",
    "Profesor de Yoga", "Profesor de Pilates", "Profesor Particular", "Profesora de Inglés",
    "Psicólogo", "Psicopedagogo", "Pulidor de Pisos", "Redactor de Contenidos", "Remisero",
    "Reparación de Celulares", "Reparación de Computadoras", "Reparación de Electrodomésticos",
    "Repostero", "Servicio Técnico (Línea Blanca)", "Soldador", "Sommelier", "Tapicero",
    "Techista", "Técnico de Aire Acondicionado", "Técnico de Celulares", "Técnico de PC",
    "Técnico en Calefacción", "Técnico en Energías Renovables", "Técnico en Redes",
    "Técnico en Refrigeración", "Terapista Ocupacional", "Traductor", "Veterinario", "Vidriería"
  ];

  // States for account actions
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [exportingData, setExportingData] = useState(false);

  // Fetch favorite professionals details
  useEffect(() => {
    if (favorites.length === 0) {
      setFavoriteProfessionals([]);
      return;
    }
    supabase
      .from('professionals_public')
      .select('id, full_name, profession, image_url')
      .in('id', favorites)
      .then(({ data }) => setFavoriteProfessionals((data as FavoriteProfessional[]) || []));
  }, [favorites]);

  // Manejar parámetros de URL para abrir conversación
  useEffect(() => {
    const tab = searchParams.get('tab');
    const conversation = searchParams.get('conversation');
    const activate = searchParams.get('activate');
    
    if (tab) setActiveTab(tab);
    if (conversation) setConversationId(conversation);
    if (activate === 'professional' && !isProfessional && user) {
      openProfessionalForm();
    }
  }, [searchParams, isProfessional, user]);

  // Cerrar dropdown de profesiones al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#prof-profession') && !target.closest('.profession-dropdown')) {
        setShowProfessionDropdown(false);
      }
    };

    if (showProfessionDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showProfessionDropdown]);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchProfessionCategories();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Check if user is a professional
      const { data: professionalData, error: profError } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      setIsProfessional(!!professionalData);

      if (profileData) {
        setUserProfile(profileData);
        setFullName(profileData.full_name || '');
        setUsername(profileData.username || '');
        setBio(profileData.bio || '');
        setLocation(profileData.location || '');
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Error al cargar datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfessionCategories = async () => {
    try {
      const { data: categories, error: catError } = await supabase
        .from('profession_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (catError) throw catError;

      const { data: services, error: servError } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('profession_category_id, display_order', { ascending: true });

      if (servError) throw servError;

      setProfessionCategories(categories || []);
      setServiceCategories(services || []);
    } catch (error) {
      console.error('Error fetching profession categories:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) {
      console.log('No user found');
      return;
    }

    if (!fullName.trim()) {
      toast.error('El nombre completo es obligatorio');
      return;
    }

    try {
      setUpdating(true);

      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingProfile) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: fullName.trim(),
            username: username.trim() || null,
            bio: bio.trim() || null,
            location: location.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            full_name: fullName.trim(),
            username: username.trim() || null,
            bio: bio.trim() || null,
            location: location.trim() || null
          });

        if (error) throw error;
      }

      toast.success('Perfil actualizado correctamente');
      fetchUserData();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(`Error al actualizar perfil: ${error.message || 'Error desconocido'}`);
    } finally {
      setUpdating(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }

    try {
      setUploadingPhoto(true);
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true, contentType: file.type });

      if (uploadError) throw new Error(`Error de subida: ${uploadError.message}`);

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let updateError;
      if (existingProfile) {
        const { error } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
          .eq('user_id', user.id);
        updateError = error;
      } else {
        const { error } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            avatar_url: publicUrl,
            full_name: fullName || user.email?.split('@')[0] || '',
            username: username || '',
            bio: bio || '',
            location: location || ''
          });
        updateError = error;
      }

      if (updateError) throw new Error(`Error al actualizar perfil: ${updateError.message}`);

      toast.success('Foto de perfil actualizada correctamente');
      event.target.value = '';
      await fetchUserData();
    } catch (error: any) {
      console.error('Error in handlePhotoUpload:', error);
      toast.error(error.message || 'Error desconocido al subir la foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCreateProfessional = async () => {
    if (!user) return;

    try {
      setCreatingProfessional(true);

      if (!professionalData.full_name.trim() || !professionalData.email.trim() || !professionalData.profession.trim()) {
        toast.error('Por favor completa todos los campos obligatorios');
        return;
      }

      if (professionalData.dni.trim()) {
        const { data: existingDni, error: dniError } = await supabase
          .from('professionals')
          .select('id, full_name')
          .eq('dni', professionalData.dni.trim())
          .maybeSingle();

        if (dniError && dniError.code !== 'PGRST116') throw dniError;
        if (existingDni) {
          toast.error(`Ya existe un profesional registrado con este DNI: ${existingDni.full_name}`);
          return;
        }
      }

      const { data: existingProfessional, error: checkError } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      if (existingProfessional) {
        toast.error('Ya tienes un perfil profesional creado');
        return;
      }

      const { error } = await supabase
        .from('professionals')
        .insert({
          user_id: user.id,
          full_name: professionalData.full_name.trim(),
          email: professionalData.email.trim(),
          phone: professionalData.phone.trim() || null,
          profession: professionalData.profession,
          location: professionalData.location.trim() || null,
          description: professionalData.description.trim() || null,
          dni: professionalData.dni.trim() || null
        });

      if (error) throw error;

      toast.success('¡Perfil profesional creado exitosamente!');
      setShowProfessionalForm(false);
      setIsProfessional(true);
      setProfessionalData({ full_name: '', email: '', phone: '', profession: '', location: '', description: '', dni: '' });
      fetchUserData();
    } catch (error) {
      console.error('Error creating professional profile:', error);
      toast.error('Error al crear perfil profesional');
    } finally {
      setCreatingProfessional(false);
    }
  };

  const openProfessionalForm = () => {
    setProfessionalData(prev => ({
      ...prev,
      full_name: userProfile?.full_name || fullName || '',
      email: user?.email || '',
      dni: ''
    }));
    setShowProfessionalForm(true);
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) { toast.error('Por favor completa ambos campos'); return; }
    if (newPassword !== confirmPassword) { toast.error('Las contraseñas no coinciden'); return; }
    if (newPassword.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres'); return; }

    try {
      setChangingPassword(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Contraseña cambiada exitosamente');
      setShowPasswordDialog(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Error al cambiar la contraseña');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    try {
      setExportingData(true);
      const userData: any = {
        profile: userProfile,
        contactRequests: [],
        exportDate: new Date().toISOString(),
        userId: user.id,
        email: user.email
      };

      const [favoritesData, transactionsData, reviewsData] = await Promise.all([
        supabase.from('favorites').select('*').eq('user_id', user.id),
        supabase.from('transactions').select('*').eq('user_id', user.id),
        supabase.from('reviews').select('*').eq('user_id', user.id)
      ]);

      if (favoritesData.data) userData['favorites'] = favoritesData.data;
      if (transactionsData.data) userData['transactions'] = transactionsData.data;
      if (reviewsData.data) userData['reviews'] = reviewsData.data;

      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `datos-chequealo-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Datos exportados exitosamente');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Error al exportar datos');
    } finally {
      setExportingData(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      setDeletingAccount(true);
      const { error } = await supabase.functions.invoke('delete-my-account', {
        headers: { Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` }
      });
      if (error) throw error;
      toast.success('Cuenta eliminada exitosamente');
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Error al eliminar la cuenta. Contacta soporte si el problema persiste.');
    } finally {
      setDeletingAccount(false);
      setShowDeleteDialog(false);
    }
  };


  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      
      <div className="mx-auto px-4 py-6 max-w-[600px]">
        {/* Notifications Banner */}
        <EnableNotificationsBanner className="mb-4" />
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16 shrink-0">
              <AvatarImage src={userProfile?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {fullName.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-foreground uppercase truncate">
                {fullName || 'Mi Cuenta'}
              </h1>
              <p className="text-sm text-muted-foreground truncate">
                @{username || 'sin-username'} • Miembro desde {' '}
                {userProfile?.created_at 
                  ? format(new Date(userProfile.created_at), 'MMMM yyyy', { locale: es })
                  : 'hace poco'
                }
              </p>
            </div>
          </div>
          
          {/* Professional Account Banner */}
          {isProfessional && (
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/20 p-2 rounded-lg">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">También sos Profesional</p>
                      <p className="text-sm text-muted-foreground">
                        Gestioná tu perfil profesional y solicitudes de clientes
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => window.location.href = '/dashboard'}
                    variant="default"
                    size="sm"
                    className="gap-2"
                  >
                    Ver Dashboard Profesional
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex w-full overflow-x-auto scrollbar-hide gap-1 p-1">
            <TabsTrigger value="home" className="shrink-0 text-xs px-2.5">
              <Search className="h-4 w-4 mr-1.5" />
              Inicio
            </TabsTrigger>
            <TabsTrigger value="messages" className="shrink-0 text-xs px-2.5">
              <MessageSquare className="h-4 w-4 mr-1.5" />
              Mensajes
            </TabsTrigger>
            <TabsTrigger value="reviews" className="shrink-0 text-xs px-2.5">
              <Star className="h-4 w-4 mr-1.5" />
              Reseñas
            </TabsTrigger>
            <TabsTrigger value="mobile" className="shrink-0 text-xs px-2.5">
              <Smartphone className="h-4 w-4 mr-1.5" />
              App Móvil
            </TabsTrigger>
            <TabsTrigger value="settings" className="shrink-0 text-xs px-2.5">
              <Settings className="h-4 w-4 mr-1.5" />
              Config
            </TabsTrigger>
          </TabsList>

          {/* ===== NEW HOME TAB ===== */}
          <TabsContent value="home">
            <div className="space-y-4">
            {/* Buscador protagonista */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="¿Qué servicio buscás hoy en Rafaela?"
                  className="pl-12 h-14 text-lg rounded-2xl shadow-sm border-border"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    }
                  }}
                />
              </div>

            {/* Card Mis Profesionales Favoritos */}
            <Card className="rounded-xl shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="h-5 w-5 text-destructive" />
                  Mis Profesionales Favoritos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {favoriteProfessionals.length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {favoriteProfessionals.map((prof) => {
                      const initials = prof.full_name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase() || '?';
                      return (
                        <button
                          key={prof.id}
                          onClick={() => navigate(`/professional/${prof.id}`)}
                          className="flex flex-col items-center gap-1.5 min-w-[80px] group"
                        >
                          <Avatar className="h-16 w-16 ring-2 ring-transparent group-hover:ring-primary transition-all">
                            {prof.image_url ? (
                              <AvatarImage src={prof.image_url} alt={prof.full_name} />
                            ) : null}
                            <AvatarFallback className={`${getAvatarColor(prof.full_name)} ${getAvatarTextColor(prof.full_name)} text-sm font-bold`}>
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <p className="text-xs font-semibold text-foreground text-center leading-tight line-clamp-1 max-w-[80px]">
                            {prof.full_name?.split(' ')[0]}
                          </p>
                          <p className="text-[10px] text-muted-foreground text-center leading-tight line-clamp-1 max-w-[80px]">
                            {prof.profession}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Heart className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Aún no tenés favoritos guardados
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => navigate('/search')}
                      className="mt-1"
                    >
                      Explorar profesionales
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card Mis Consultas */}
            <Card
              className="rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setActiveTab('messages')}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <MessageSquare className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Mis Consultas</p>
                  <p className="text-sm text-muted-foreground">
                    Ver conversaciones con profesionales
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>

            {/* CTA Crear cuenta profesional */}
            {!isProfessional && (
              <Card
                className="rounded-xl shadow-sm border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 cursor-pointer transition-all"
                onClick={openProfessionalForm}
              >
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="relative">
                    <Briefcase className="h-8 w-8 text-primary" />
                    <Plus className="h-4 w-4 text-primary absolute -top-1 -right-1 bg-background rounded-full" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Crear Cuenta Profesional</p>
                    <p className="text-sm text-muted-foreground">
                      Recibí solicitudes de clientes y crecé tu negocio
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <MessagesDesktopLayout 
              initialConversationId={conversationId} 
              isProfessional={false} 
            />
          </TabsContent>

          <TabsContent value="reviews">
            <UserTransactionReviews />
          </TabsContent>

          <TabsContent value="mobile">
            <Card>
              <CardHeader>
                <CardTitle>Funcionalidades Móviles</CardTitle>
                <CardDescription>
                  Configura las funciones de la aplicación móvil y PWA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PWAFeatures />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              {/* Personal Profile Form moved here */}
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>
                    Actualiza tu información personal y perfil público
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={userProfile?.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                        {fullName.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        disabled={uploadingPhoto}
                        onClick={() => document.getElementById('photo-upload')?.click()}
                      >
                        <Camera className="h-4 w-4" />
                        {uploadingPhoto ? 'Subiendo...' : 'Cambiar Foto'}
                      </Button>
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e)}
                        className="hidden"
                      />
                      <p className="text-xs text-muted-foreground">
                        Formatos: JPG, PNG, GIF (máx. 5MB)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nombre Completo</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Tu nombre completo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Nombre de Usuario</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="username"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user.email || ''}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        El email no se puede cambiar
                      </p>
                    </div>
                    
                    <LocationAutocomplete
                      value={location}
                      onChange={setLocation}
                      label="Ubicación"
                      id="location"
                      placeholder="Busca tu ciudad o provincia..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografía</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Cuéntanos un poco sobre ti..."
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleUpdateProfile} disabled={updating}>
                    {updating ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </CardContent>
              </Card>

              <PushNotificationToggle />
              
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Cuenta</CardTitle>
                  <CardDescription>
                    Gestiona la configuración y privacidad de tu cuenta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Información de Cuenta</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Email</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Miembro desde</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(userProfile?.created_at || new Date()), 'dd/MM/yyyy', { locale: es })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Acciones de Cuenta</h3>
                    
                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => setShowPasswordDialog(true)}
                      >
                        <Key className="h-4 w-4 mr-2" />
                        Cambiar Contraseña
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={handleExportData}
                        disabled={exportingData}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {exportingData ? 'Exportando...' : 'Exportar Datos'}
                      </Button>
                      
                      <Button 
                        variant="destructive" 
                        className="w-full justify-start"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar Cuenta
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Professional Registration Modal */}
        <Dialog open={showProfessionalForm} onOpenChange={setShowProfessionalForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Perfil Profesional</DialogTitle>
              <DialogDescription>
                Completa tu información profesional para comenzar a recibir solicitudes de clientes
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prof-fullname">Nombre Completo *</Label>
                  <Input
                    id="prof-fullname"
                    value={professionalData.full_name}
                    onChange={(e) => setProfessionalData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Tu nombre completo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prof-email">Email *</Label>
                  <Input
                    id="prof-email"
                    type="email"
                    value={professionalData.email}
                    onChange={(e) => setProfessionalData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prof-phone">Teléfono</Label>
                  <Input
                    id="prof-phone"
                    value={professionalData.phone}
                    onChange={(e) => setProfessionalData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="11 1234-5678"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prof-dni">DNI</Label>
                  <Input
                    id="prof-dni"
                    value={professionalData.dni}
                    onChange={(e) => setProfessionalData(prev => ({ ...prev, dni: e.target.value }))}
                    placeholder="12345678"
                    maxLength={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    El DNI ayuda a evitar cuentas duplicadas
                  </p>
                </div>
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="prof-profession">Profesión *</Label>
                <div className="relative">
                  <Input
                    id="prof-profession"
                    value={professionSearch || professionalData.profession}
                    onChange={(e) => {
                      setProfessionSearch(e.target.value);
                      setShowProfessionDropdown(true);
                    }}
                    onFocus={() => setShowProfessionDropdown(true)}
                    placeholder="Escribe para buscar tu profesión..."
                    className="w-full"
                  />
                  {showProfessionDropdown && (
                    <div className="profession-dropdown absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-[300px] overflow-y-auto">
                      {allProfessions
                        .filter(prof => 
                          prof.toLowerCase().includes((professionSearch || professionalData.profession).toLowerCase())
                        )
                        .map((profession, index) => (
                          <button
                            key={index}
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground text-sm transition-colors"
                            onClick={() => {
                              setProfessionalData(prev => ({ ...prev, profession }));
                              setProfessionSearch('');
                              setShowProfessionDropdown(false);
                            }}
                          >
                            {profession}
                          </button>
                        ))}
                      {allProfessions.filter(prof => 
                        prof.toLowerCase().includes((professionSearch || professionalData.profession).toLowerCase())
                      ).length === 0 && (
                        <div className="px-4 py-3 text-sm text-muted-foreground">
                          No se encontraron profesiones. Escribe tu profesión manualmente.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {professionalData.profession && !showProfessionDropdown && (
                  <p className="text-xs text-muted-foreground">
                    Profesión seleccionada: <span className="font-medium">{professionalData.profession}</span>
                  </p>
                )}
              </div>

              <LocationAutocomplete
                value={professionalData.location}
                onChange={(value) => setProfessionalData(prev => ({ ...prev, location: value }))}
                label="Ubicación"
                id="prof-location"
                placeholder="Busca tu ciudad o provincia..."
              />

              <div className="space-y-2">
                <Label htmlFor="prof-description">Descripción de servicios</Label>
                <Textarea
                  id="prof-description"
                  value={professionalData.description}
                  onChange={(e) => setProfessionalData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe tus servicios y experiencia..."
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-between pt-6">
                <Button variant="outline" onClick={() => setShowProfessionalForm(false)} disabled={creatingProfessional}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateProfessional} disabled={creatingProfessional}>
                  {creatingProfessional ? 'Creando...' : 'Crear Perfil Profesional'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Change Password Dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cambiar Contraseña</DialogTitle>
              <DialogDescription>
                Ingresa tu nueva contraseña. Debe tener al menos 6 caracteres.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-password">Nueva Contraseña</Label>
                <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nueva contraseña" />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirma tu nueva contraseña" />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleChangePassword} disabled={changingPassword}>
                  {changingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
                </Button>
                <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Cancelar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Account Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro de eliminar tu cuenta?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminarán permanentemente:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Tu perfil de usuario</li>
                  <li>Todas tus solicitudes de contacto</li>
                  <li>Tus favoritos</li>
                  <li>Tus reseñas y calificaciones</li>
                  <li>Si eres profesional: tu perfil profesional, servicios y fotos de trabajo</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deletingAccount ? 'Eliminando...' : 'Sí, eliminar mi cuenta'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Bottom Navigation - Mobile Only */}
        <div className="md:hidden">
          <BottomNavigation />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
