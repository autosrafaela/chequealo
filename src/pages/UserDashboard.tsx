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
  Phone,
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
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Header from '@/components/Header';
import ProfileCompletionChecklist from '@/components/ProfileCompletionChecklist';
import { Navigate, useSearchParams } from 'react-router-dom';
import FavoritesPanel from '@/components/FavoritesPanel';
import ChatInterface from '@/components/ChatInterface';
import { UserTransactionReviews } from '@/components/UserTransactionReviews';
import PWAFeatures from '@/components/PWAFeatures';
import PushNotificationToggle from '@/components/PushNotificationToggle';
import { TransactionConfirmationCard } from '@/components/TransactionConfirmationCard';
import { ReadyToRateTransactions } from '@/components/ReadyToRateTransactions';
import { useTransactionConfirmation } from '@/hooks/useTransactionConfirmation';

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

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  service_type: string;
  status: string;
  created_at: string;
  professional: {
    id: string;
    full_name: string;
    profession: string;
    phone: string;
    email: string;
  } | null;
}

const UserDashboard = () => {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isProfessional, setIsProfessional] = useState(false);
  const [showProfessionalForm, setShowProfessionalForm] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  
  // Transaction confirmation hook
  const { 
    pendingTransactions, 
    loading: confirmLoading, 
    confirmCompletion 
  } = useTransactionConfirmation();

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

  // States for account actions
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [exportingData, setExportingData] = useState(false);

  // Manejar parámetros de URL para abrir conversación
  useEffect(() => {
    const tab = searchParams.get('tab');
    const conversation = searchParams.get('conversation');
    
    if (tab) setActiveTab(tab);
    if (conversation) setConversationId(conversation);
  }, [searchParams]);

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

      // Fetch user's contact requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('contact_requests')
        .select(`
          id,
          name,
          email,
          phone,
          message,
          service_type,
          status,
          created_at,
          professional_id
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Fetch professional details for each request
      const requestsWithProfessionals = await Promise.all(
        (requestsData || []).map(async (request) => {
          const { data: professional, error: profError } = await supabase
            .from('professionals')
            .select('id, full_name, profession, phone, email')
            .eq('id', request.professional_id)
            .maybeSingle();

          return {
            ...request,
            professional: profError ? null : professional
          };
        })
      );

      setContactRequests(requestsWithProfessionals);
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

    // Validate required fields
    if (!fullName.trim()) {
      toast.error('El nombre completo es obligatorio');
      return;
    }

    try {
      setUpdating(true);
      console.log('Starting profile update for user:', user.id);
      console.log('Update data:', { fullName, username, bio, location });

      // First check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing profile:', checkError);
        throw checkError;
      }

      console.log('Existing profile:', existingProfile);

      if (existingProfile) {
        // Update existing profile
        console.log('Updating existing profile');
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
        // Create new profile
        console.log('Creating new profile');
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

      console.log('Profile update successful');
      toast.success('Perfil actualizado correctamente');
      fetchUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(`Error al actualizar perfil: ${error.message || 'Error desconocido'}`);
    } finally {
      setUpdating(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('handlePhotoUpload called', { file, user: user?.id });
    
    if (!file) {
      console.log('No file selected');
      return;
    }
    
    if (!user) {
      console.log('No user found');
      toast.error('Debes estar conectado para subir una foto');
      return;
    }

    // Validate file size (5MB max)
    console.log('File size:', file.size, 'bytes');
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    // Validate file type
    console.log('File type:', file.type);
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }

    try {
      setUploadingPhoto(true);
      console.log('Starting photo upload for user:', user.id);
      
      // Create a simple filename
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/avatar.${fileExt}`;
      console.log('Target filename:', fileName);
      
      // Try to upload file
      console.log('Attempting upload to avatars bucket...');
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type 
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Error de subida: ${uploadError.message}`);
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log('Generated public URL:', publicUrl);

      // Update profile with new avatar URL
      console.log('Updating profile with new avatar URL...');
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('Existing profile check:', existingProfile);

      let updateError;
      if (existingProfile) {
        console.log('Updating existing profile...');
        const { error } = await supabase
          .from('profiles')
          .update({
            avatar_url: publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
        updateError = error;
      } else {
        console.log('Creating new profile with avatar...');
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

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw new Error(`Error al actualizar perfil: ${updateError.message}`);
      }

      console.log('Photo upload and profile update completed successfully');
      toast.success('Foto de perfil actualizada correctamente');
      
      // Reset the file input
      event.target.value = '';
      
      // Refresh user data
      await fetchUserData();
      
    } catch (error: any) {
      console.error('Complete error in handlePhotoUpload:', error);
      toast.error(error.message || 'Error desconocido al subir la foto');
    } finally {
      setUploadingPhoto(false);
      console.log('Photo upload process finished');
    }
  };

  const handleCreateProfessional = async () => {
    if (!user) return;

    try {
      setCreatingProfessional(true);

      // Validate required fields
      if (!professionalData.full_name.trim() || !professionalData.email.trim() || !professionalData.profession.trim()) {
        toast.error('Por favor completa todos los campos obligatorios');
        return;
      }

      // Validate DNI if provided
      if (professionalData.dni.trim()) {
        // Check if DNI already exists
        const { data: existingDni, error: dniError } = await supabase
          .from('professionals')
          .select('id, full_name')
          .eq('dni', professionalData.dni.trim())
          .maybeSingle();

        if (dniError && dniError.code !== 'PGRST116') {
          throw dniError;
        }

        if (existingDni) {
          toast.error(`Ya existe un profesional registrado con este DNI: ${existingDni.full_name}`);
          return;
        }
      }

      // Check if user already has a professional profile
      const { data: existingProfessional, error: checkError } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingProfessional) {
        toast.error('Ya tienes un perfil profesional creado');
        return;
      }

      // Create professional profile
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
      
      // Reset form
      setProfessionalData({
        full_name: '',
        email: '',
        phone: '',
        profession: '',
        location: '',
        description: '',
        dni: ''
      });

      fetchUserData();
    } catch (error) {
      console.error('Error creating professional profile:', error);
      toast.error('Error al crear perfil profesional');
    } finally {
      setCreatingProfessional(false);
    }
  };

  const openProfessionalForm = () => {
    // Pre-fill form with user data
    setProfessionalData(prev => ({
      ...prev,
      full_name: userProfile?.full_name || fullName || '',
      email: user?.email || '',
      dni: ''
    }));
    setShowProfessionalForm(true);
  };

  // Account actions functions
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Por favor completa ambos campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setChangingPassword(true);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

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

      // Collect all user data
      const userData = {
        profile: userProfile,
        contactRequests: contactRequests,
        exportDate: new Date().toISOString(),
        userId: user.id,
        email: user.email
      };

      // Get additional data
      const [favoritesData, transactionsData, reviewsData] = await Promise.all([
        supabase.from('favorites').select('*').eq('user_id', user.id),
        supabase.from('transactions').select('*').eq('user_id', user.id),
        supabase.from('reviews').select('*').eq('user_id', user.id)
      ]);

      if (favoritesData.data) userData['favorites'] = favoritesData.data;
      if (transactionsData.data) userData['transactions'] = transactionsData.data;
      if (reviewsData.data) userData['reviews'] = reviewsData.data;

      // Create and download JSON file
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

      // Call edge function to delete account
      const { error } = await supabase.functions.invoke('delete-my-account', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (error) throw error;

      toast.success('Cuenta eliminada exitosamente');
      
      // Sign out user
      await supabase.auth.signOut();
      
      // Redirect to home
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Error al eliminar la cuenta. Contacta soporte si el problema persiste.');
    } finally {
      setDeletingAccount(false);
      setShowDeleteDialog(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pendiente' },
      contacted: { variant: 'default' as const, label: 'Contactado' },
      completed: { variant: 'outline' as const, label: 'Completado' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelado' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={userProfile?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {fullName.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {fullName || 'Mi Cuenta'}
              </h1>
              <p className="text-muted-foreground">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setActiveTab('requests')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Solicitudes Enviadas
                  </p>
                  <p className="text-2xl font-bold">{contactRequests.length}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setActiveTab('requests')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Solicitudes Activas
                  </p>
                  <p className="text-2xl font-bold">
                    {contactRequests.filter(r => r.status === 'pending' || r.status === 'contacted').length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setActiveTab('favorites')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Favoritos Guardados
                  </p>
                  <p className="text-2xl font-bold">-</p>
                </div>
                <Heart className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          {!isProfessional && (
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-primary hover:border-primary/80 hover:bg-primary/5"
              onClick={openProfessionalForm}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Crear Cuenta
                    </p>
                    <p className="text-lg font-semibold text-primary">
                      Profesional
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recibe solicitudes de clientes
                    </p>
                  </div>
                  <div className="relative">
                    <Briefcase className="h-8 w-8 text-primary" />
                    <Plus className="h-4 w-4 text-primary absolute -top-1 -right-1 bg-background rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Mi Perfil
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Heart className="h-4 w-4 mr-2" />
              Favoritos
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="h-4 w-4 mr-2" />
              Mensajes
            </TabsTrigger>
            <TabsTrigger value="requests">
              <MessageSquare className="h-4 w-4 mr-2" />
              Solicitudes
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <Star className="h-4 w-4 mr-2" />
              Reseñas
            </TabsTrigger>
            <TabsTrigger value="mobile">
              <Smartphone className="h-4 w-4 mr-2" />
              App Móvil
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            {/* Transaction Confirmations - Highest Priority */}
            {pendingTransactions.length > 0 && (
              <div className="mb-6 space-y-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Confirmaciones Pendientes</h3>
                  <Badge variant="default">{pendingTransactions.length}</Badge>
                </div>
                {pendingTransactions.map((transaction) => (
                  <TransactionConfirmationCard
                    key={transaction.id}
                    transaction={transaction}
                    isProfessional={false}
                    onConfirm={confirmCompletion}
                    disabled={confirmLoading}
                  />
                ))}
              </div>
            )}

            {/* Ready to Rate Transactions */}
            <div className="mb-6">
              <ReadyToRateTransactions 
                isProfessional={false}
                onRate={(transactionId) => {
                  setActiveTab('reviews');
                  // Scroll to reviews section
                  setTimeout(() => {
                    const reviewsSection = document.querySelector('[value="reviews"]');
                    reviewsSection?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
              />
            </div>

            <Card>
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
                      {fullName.charAt(0) || user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                     <Button 
                       variant="outline" 
                       disabled={uploadingPhoto}
                       onClick={() => {
                         console.log('Attempting to click file input');
                         document.getElementById('photo-upload')?.click();
                       }}
                     >
                      <Camera className="h-4 w-4 mr-2" />
                      {uploadingPhoto ? 'Subiendo...' : 'Cambiar Foto'}
                    </Button>
                     <input
                       id="photo-upload"
                       type="file"
                       accept="image/jpeg,image/png,image/gif,image/webp"
                       onChange={(e) => {
                         console.log('File input changed:', e.target.files);
                         handlePhotoUpload(e);
                       }}
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
          </TabsContent>

          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>Mis Profesionales Favoritos</CardTitle>
                <CardDescription>
                  Profesionales que has guardado como favoritos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FavoritesPanel />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Mis Solicitudes de Contacto</CardTitle>
                <CardDescription>
                  Historial de todas las solicitudes que has enviado a profesionales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contactRequests.length > 0 ? (
                    contactRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">
                                {request.professional?.full_name || 'Profesional no encontrado'}
                              </h3>
                              {getStatusBadge(request.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {request.professional?.profession || 'Profesión no especificada'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Servicio: {request.service_type}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {request.professional && (
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                              >
                                <a href={`/professional/${request.professional.id}`}>
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  Ver Perfil
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="bg-muted p-3 rounded-md mb-3">
                          <p className="text-sm">{request.message}</p>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            Enviado el {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                          </span>
                          <div className="flex items-center gap-4">
                            {request.professional?.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {request.professional.phone}
                              </div>
                            )}
                            {request.professional?.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {request.professional.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-2">No has enviado solicitudes aún</h3>
                      <p className="text-muted-foreground mb-4">
                        Busca profesionales y envía tu primera solicitud de contacto
                      </p>
                      <Button asChild>
                        <a href="/search">Buscar Profesionales</a>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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
                    onChange={(e) => setProfessionalData(prev => ({
                      ...prev,
                      full_name: e.target.value
                    }))}
                    placeholder="Tu nombre completo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prof-email">Email *</Label>
                  <Input
                    id="prof-email"
                    type="email"
                    value={professionalData.email}
                    onChange={(e) => setProfessionalData(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
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
                    onChange={(e) => setProfessionalData(prev => ({
                      ...prev,
                      phone: e.target.value
                    }))}
                    placeholder="11 1234-5678"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prof-dni">DNI</Label>
                  <Input
                    id="prof-dni"
                    value={professionalData.dni}
                    onChange={(e) => setProfessionalData(prev => ({
                      ...prev,
                      dni: e.target.value
                    }))}
                    placeholder="12345678"
                    maxLength={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    El DNI ayuda a evitar cuentas duplicadas
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prof-profession">Profesión *</Label>
                <Select
                  value={professionalData.profession}
                  onValueChange={(value) => setProfessionalData(prev => ({
                    ...prev,
                    profession: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu profesión" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {professionCategories.map((category) => {
                      const categoryServices = serviceCategories.filter(
                        service => service.profession_category_id === category.id
                      );
                      
                      return (
                        <div key={category.id}>
                          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50">
                            {category.icon} {category.name}
                          </div>
                          {categoryServices.map((service) => (
                            <SelectItem 
                              key={service.id} 
                              value={service.name}
                              className="pl-6"
                            >
                              {service.name}
                            </SelectItem>
                          ))}
                        </div>
                      );
                    })}
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <LocationAutocomplete
                value={professionalData.location}
                onChange={(value) => setProfessionalData(prev => ({
                  ...prev,
                  location: value
                }))}
                label="Ubicación"
                id="prof-location"
                placeholder="Busca tu ciudad o provincia..."
              />

              <div className="space-y-2">
                <Label htmlFor="prof-description">Descripción de servicios</Label>
                <Textarea
                  id="prof-description"
                  value={professionalData.description}
                  onChange={(e) => setProfessionalData(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  placeholder="Describe tus servicios y experiencia..."
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowProfessionalForm(false)}
                  disabled={creatingProfessional}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateProfessional}
                  disabled={creatingProfessional}
                >
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
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu nueva contraseña"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleChangePassword} disabled={changingPassword}>
                  {changingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
                </Button>
                <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                  Cancelar
                </Button>
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
      </div>
    </div>
  );
};

export default UserDashboard;