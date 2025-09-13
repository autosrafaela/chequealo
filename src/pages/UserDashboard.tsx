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
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Header from '@/components/Header';
import { Navigate } from 'react-router-dom';
import FavoritesPanel from '@/components/FavoritesPanel';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  bio: string;
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Form states
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
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

      if (profileData) {
        setUserProfile(profileData);
        setFullName(profileData.full_name || '');
        setUsername(profileData.username || '');
        setBio(profileData.bio || '');
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

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      setUpdating(true);

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: fullName,
          username: username,
          bio: bio,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Perfil actualizado correctamente');
      fetchUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar perfil');
    } finally {
      setUpdating(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploadingPhoto(true);
      
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

      toast.success('Foto de perfil actualizada');
      fetchUserData();
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Error al subir foto de perfil');
    } finally {
      setUploadingPhoto(false);
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
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Mi Perfil
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Heart className="h-4 w-4 mr-2" />
              Favoritos
            </TabsTrigger>
            <TabsTrigger value="requests">
              <MessageSquare className="h-4 w-4 mr-2" />
              Mis Solicitudes
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
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
                      onClick={() => document.getElementById('photo-upload')?.click()}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {uploadingPhoto ? 'Subiendo...' : 'Cambiar Foto'}
                    </Button>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
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

          <TabsContent value="settings">
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
                      onClick={() => toast.info('Funcionalidad próximamente')}
                    >
                      Cambiar Contraseña (Próximamente)
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => toast.info('Funcionalidad próximamente')}
                    >
                      Exportar Datos (Próximamente)
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start"
                      onClick={() => toast.error('Para eliminar tu cuenta, contacta soporte')}
                    >
                      Eliminar Cuenta (Próximamente)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;