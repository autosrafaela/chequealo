import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { ContactRequestsPanel } from '@/components/ContactRequestsPanel';
import { ProfessionalProfileEdit } from '@/components/ProfessionalProfileEdit';
import { EnhancedTransactionManager } from '@/components/EnhancedTransactionManager';
import { FinancialDashboard } from '@/components/FinancialDashboard';
import { SubscriptionPanel } from '@/components/SubscriptionPanel';
import { SubscriptionAlert } from '@/components/SubscriptionAlert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  MessageCircle, 
  Star, 
  TrendingUp, 
  Users, 
  Calendar,
  Settings,
  BarChart3,
  Eye,
  Edit3
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  totalReviews: number;
  averageRating: number;
  profileViews: number;
}

const ProfessionalDashboard = () => {
  const { user } = useAuth();
  const [professional, setProfessional] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    totalReviews: 0,
    averageRating: 0,
    profileViews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get professional profile
      const { data: professionalData, error: profError } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (profError) throw profError;
      
      if (!professionalData) {
        toast.error('Perfil de profesional no encontrado');
        return;
      }

      setProfessional(professionalData);

      // Get contact requests stats
      const { data: requests, error: reqError } = await supabase
        .from('contact_requests')
        .select('id, status')
        .eq('professional_id', professionalData.id);

      if (reqError) throw reqError;

      // Get reviews stats
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('professional_id', professionalData.id);

      if (reviewsError) throw reviewsError;

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
        profileViews: 0 // We can implement this later with analytics
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Cargando dashboard...</div>
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-xl font-semibold mb-4">No tienes un perfil de profesional</h2>
              <p className="text-muted-foreground mb-6">
                Crea tu perfil de profesional para comenzar a recibir solicitudes de clientes
              </p>
              <Button asChild>
                <Link to="/register">Crear Perfil Profesional</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Subscription Alert */}
        <SubscriptionAlert />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dashboard Profesional
          </h1>
          <p className="text-muted-foreground">
            Gestiona tu perfil, solicitudes y estadísticas
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Solicitudes Totales
                  </p>
                  <p className="text-2xl font-bold">{stats.totalRequests}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Pendientes
                  </p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingRequests}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
              {stats.pendingRequests > 0 && (
                <Badge variant="destructive" className="mt-2">
                  Requiere atención
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Reseñas
                  </p>
                  <p className="text-2xl font-bold">{stats.totalReviews}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Rating Promedio
                  </p>
                  <div className="flex items-center gap-1">
                    <p className="text-2xl font-bold">{stats.averageRating}</p>
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-2">Ver Mi Perfil</h3>
                  <p className="text-sm text-muted-foreground">
                    Revisa cómo te ven los clientes
                  </p>
                </div>
                <Eye className="h-8 w-8 text-primary" />
              </div>
              <Button asChild className="w-full mt-4" variant="outline">
                <Link to={`/professional/${professional.id}`}>
                  Ver Perfil Público
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-2">Editar Perfil</h3>
                  <p className="text-sm text-muted-foreground">
                    Actualiza tu información
                  </p>
                </div>
                <Edit3 className="h-8 w-8 text-green-500" />
              </div>
              <div className="mt-4">
                <ProfessionalProfileEdit
                  professionalData={professional}
                  onUpdate={fetchDashboardData}
                  isOwner={true}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-2">Estadísticas</h3>
                  <p className="text-sm text-muted-foreground">
                    Análisis de rendimiento
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
              <Button className="w-full mt-4" variant="outline" disabled>
                Próximamente
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="requests">
              Solicitudes ({stats.totalRequests})
            </TabsTrigger>
            <TabsTrigger value="financial">
              Finanzas
            </TabsTrigger>
            <TabsTrigger value="transactions">
              Trabajos
            </TabsTrigger>
            <TabsTrigger value="subscription">
              Suscripción
            </TabsTrigger>
            <TabsTrigger value="profile">
              Mi Perfil
            </TabsTrigger>
            <TabsTrigger value="settings">
              Configuración
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <ContactRequestsPanel />
          </TabsContent>

          <TabsContent value="financial">
            <FinancialDashboard />
          </TabsContent>

          <TabsContent value="transactions">
            <EnhancedTransactionManager />
          </TabsContent>

          <TabsContent value="subscription">
            <SubscriptionPanel />
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Información del Perfil</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Revisa y edita la información de tu perfil profesional
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Información Básica</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Nombre:</strong> {professional.full_name}</p>
                      <p><strong>Profesión:</strong> {professional.profession}</p>
                      <p><strong>Email:</strong> {professional.email}</p>
                      <p><strong>Teléfono:</strong> {professional.phone || 'No especificado'}</p>
                      <p><strong>Ubicación:</strong> {professional.location}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Estado de Verificación</h4>
                    <div className="space-y-2">
                      <Badge variant={professional.is_verified ? 'default' : 'secondary'}>
                        {professional.is_verified ? 'Verificado' : 'Sin verificar'}
                      </Badge>
                      {!professional.is_verified && (
                        <p className="text-sm text-muted-foreground">
                          Solicita la verificación para generar más confianza en los clientes
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Descripción</h4>
                  <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                    {professional.description || 'No hay descripción disponible'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuración de Cuenta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-4">Disponibilidad</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Estado actual: <Badge>{professional.availability || 'No especificado'}</Badge>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Edita tu disponibilidad desde "Editar Perfil" para que los clientes sepan cuándo pueden contactarte.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4">Notificaciones</h4>
                    <p className="text-sm text-muted-foreground">
                      Recibirás notificaciones cuando tengas nuevas solicitudes de contacto o presupuesto.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4">Privacidad</h4>
                    <p className="text-sm text-muted-foreground">
                      Tu perfil es público y puede ser visto por todos los usuarios de la plataforma.
                    </p>
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

export default ProfessionalDashboard;