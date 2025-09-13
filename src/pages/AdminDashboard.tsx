import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import NotificationTestPanel from '@/components/NotificationTestPanel';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import ModerationQueue from '@/components/moderation/ModerationQueue';
import { SystemConfiguration } from '@/components/SystemConfiguration';
import { BusinessIntelligenceDashboard } from '@/components/analytics/BusinessIntelligenceDashboard';
import { PerformanceMonitor } from '@/components/analytics/PerformanceMonitor';
import { CategoriesManager } from '@/components/admin/CategoriesManager';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';
import { 
  Users, 
  Shield, 
  Settings, 
  BarChart3, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  UserCheck,
  MessageSquare,
  Star,
  TrendingUp
} from 'lucide-react';
import { Navigate } from 'react-router-dom';

interface AdminStats {
  totalUsers: number;
  totalProfessionals: number;
  pendingVerifications: number;
  totalReviews: number;
  totalContactRequests: number;
  averageRating: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  expiredSubscriptions: number;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProfessionals: 0,
    pendingVerifications: 0,
    totalReviews: 0,
    totalContactRequests: 0,
    averageRating: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    trialSubscriptions: 0,
    expiredSubscriptions: 0
  });
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [newPrice, setNewPrice] = useState('');
  const [activeTab, setActiveTab] = useState('professionals');

  // Debug logs to diagnose blank page
  console.log('[AdminDashboard] render', { userId: user?.id, isAdmin, roleLoading, loading });

  useEffect(() => {
    console.log('[AdminDashboard] useEffect', { hasUser: !!user, isAdmin });
    if (user && isAdmin) {
      fetchAdminData();
    }
  }, [user, isAdmin]);

  // Guard: not admin
  // Guards moved below (before main return) to avoid calling undefined functions during useEffect


  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Fetch users count
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id');

      // Fetch professionals
      const { data: professionalsData } = await supabase
        .from('professionals')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch verification requests
      const { data: verificationsData } = await supabase
        .from('verification_requests')
        .select('*')
        .order('submitted_at', { ascending: false });

      // Fetch reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('rating');

      // Fetch contact requests
      const { data: contactRequestsData } = await supabase
        .from('contact_requests')
        .select('id');

      // Fetch subscriptions
      const { data: subscriptionsData } = await supabase
        .from('subscriptions')
        .select(`
          *,
          professionals(full_name, profession),
          subscription_plans(name, price)
        `)
        .order('created_at', { ascending: false });

      // Fetch subscription plans
      const { data: plansData } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('created_at', { ascending: false });

      // Calculate stats
      const totalUsers = profiles?.length || 0;
      const totalProfessionals = professionalsData?.length || 0;
      const pendingVerifications = verificationsData?.filter(v => v.status === 'pending').length || 0;
      const totalReviews = reviewsData?.length || 0;
      const totalContactRequests = contactRequestsData?.length || 0;
      const averageRating = totalReviews > 0 
        ? reviewsData.reduce((acc, r) => acc + r.rating, 0) / totalReviews 
        : 0;
      
      const totalSubscriptions = subscriptionsData?.length || 0;
      const activeSubscriptions = subscriptionsData?.filter(s => s.status === 'active').length || 0;
      const trialSubscriptions = subscriptionsData?.filter(s => s.status === 'trial').length || 0;
      const expiredSubscriptions = subscriptionsData?.filter(s => s.status === 'expired').length || 0;

      setStats({
        totalUsers,
        totalProfessionals,
        pendingVerifications,
        totalReviews,
        totalContactRequests,
        averageRating: Math.round(averageRating * 10) / 10,
        totalSubscriptions,
        activeSubscriptions,
        trialSubscriptions,
        expiredSubscriptions
      });

      setProfessionals(professionalsData || []);
      setVerificationRequests(verificationsData || []);
      setSubscriptions(subscriptionsData || []);
      setSubscriptionPlans(plansData || []);

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Error al cargar los datos de administración');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyProfessional = async (professionalId: string) => {
    try {
      const { error } = await supabase
        .from('professionals')
        .update({ 
          is_verified: true, 
          verification_date: new Date().toISOString() 
        })
        .eq('id', professionalId);

      if (error) throw error;

      toast.success('Profesional verificado exitosamente');
      fetchAdminData();
    } catch (error) {
      console.error('Error verifying professional:', error);
      toast.error('Error al verificar profesional');
    }
  };

  const handleUnverifyProfessional = async (professionalId: string) => {
    try {
      const { error } = await supabase
        .from('professionals')
        .update({ 
          is_verified: false, 
          verification_date: null 
        })
        .eq('id', professionalId);

      if (error) throw error;

      toast.success('Verificación removida exitosamente');
      fetchAdminData();
    } catch (error) {
      console.error('Error unverifying professional:', error);
      toast.error('Error al remover verificación');
    }
  };

  const handleUpdatePlanPrice = async (planId: string, newPrice: number) => {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ price: newPrice })
        .eq('id', planId);

      if (error) throw error;

      toast.success('Precio actualizado exitosamente');
      fetchAdminData();
      setEditingPlan(null);
      setNewPrice('');
    } catch (error) {
      console.error('Error updating plan price:', error);
      toast.error('Error al actualizar precio');
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;

    try {
      // First, find the user by email
      const { data: users } = await supabase
        .from('profiles')
        .select('user_id')
        .ilike('full_name', `%${newAdminEmail}%`);

      if (!users || users.length === 0) {
        toast.error('Usuario no encontrado');
        return;
      }

      // Add admin role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: users[0].user_id, role: 'admin' });

      if (error) throw error;

      toast.success(`Admin agregado: ${newAdminEmail}`);
      setNewAdminEmail('');
    } catch (error) {
      console.error('Error adding admin:', error);
      toast.error('Error al agregar admin');
    }
  };

  const getStatusBadge = (isVerified: boolean) => {
    return isVerified ? (
      <Badge className="bg-emerald-500 text-white">
        <CheckCircle className="h-3 w-3 mr-1" />
        Verificado
      </Badge>
    ) : (
      <Badge variant="secondary">
        <XCircle className="h-3 w-3 mr-1" />
        Sin verificar
      </Badge>
    );
  };

  // Guard: not admin or still loading
  if (roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (loading && !stats.totalUsers) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando datos del dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              Panel de Administración
            </h1>
          </div>
          <p className="text-muted-foreground">
            Gestiona usuarios, profesionales y configuraciones del sistema
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => setActiveTab('users')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Usuarios
                  </p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => setActiveTab('professionals')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Profesionales
                  </p>
                  <p className="text-2xl font-bold">{stats.totalProfessionals}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => setActiveTab('verifications')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Verificaciones Pendientes
                  </p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingVerifications}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Reseñas
                  </p>
                  <p className="text-2xl font-bold">{stats.totalReviews}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Solicitudes de Contacto
                  </p>
                  <p className="text-2xl font-bold">{stats.totalContactRequests}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Rating Promedio
                  </p>
                  <p className="text-2xl font-bold">{stats.averageRating}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => setActiveTab('subscriptions')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Suscripciones Activas
                  </p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeSubscriptions}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => setActiveTab('subscriptions')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    En Período de Prueba
                  </p>
                  <p className="text-2xl font-bold text-blue-600">{stats.trialSubscriptions}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => setActiveTab('subscriptions')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Suscripciones Expiradas
                  </p>
                  <p className="text-2xl font-bold text-red-600">{stats.expiredSubscriptions}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-11">
            <TabsTrigger value="professionals">Profesionales</TabsTrigger>
            <TabsTrigger value="categories">Categorías</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="moderation">Moderación</TabsTrigger>
            <TabsTrigger value="subscriptions">Suscripciones</TabsTrigger>
            <TabsTrigger value="plans">Planes</TabsTrigger>
            <TabsTrigger value="verifications">Verificaciones</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
            <TabsTrigger value="business">BI</TabsTrigger>
            <TabsTrigger value="performance">Monitor</TabsTrigger>
          </TabsList>

          <TabsContent value="professionals">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Profesionales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {professionals.map((professional) => (
                    <div key={professional.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{professional.full_name}</h3>
                          {getStatusBadge(professional.is_verified)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {professional.profession} • {professional.location}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {professional.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                          <a href={`/professional/${professional.id}`} target="_blank">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Perfil
                          </a>
                        </Button>
                        {professional.is_verified ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUnverifyProfessional(professional.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Remover Verificación
                          </Button>
                        ) : (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleVerifyProfessional(professional.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Verificar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesManager />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="moderation">
            <ModerationQueue />
          </TabsContent>

          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Suscripciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">
                            {subscription.professionals?.full_name || 'Profesional no encontrado'}
                          </h3>
                          <Badge 
                            className={`${
                              subscription.status === 'active' ? 'bg-green-500 text-white' :
                              subscription.status === 'trial' ? 'bg-blue-500 text-white' :
                              subscription.status === 'expired' ? 'bg-red-500 text-white' :
                              'bg-gray-500 text-white'
                            }`}
                          >
                            {subscription.status === 'active' ? 'Activa' :
                             subscription.status === 'trial' ? 'Prueba' :
                             subscription.status === 'expired' ? 'Expirada' :
                             subscription.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {subscription.professionals?.profession}
                        </p>
                        <div className="text-sm text-muted-foreground mt-2">
                          <p><strong>Plan:</strong> {subscription.subscription_plans?.name || 'No disponible'}</p>
                          <p><strong>Precio:</strong> ${subscription.subscription_plans?.price || 0}</p>
                          <p><strong>Período de prueba:</strong> {new Date(subscription.trial_start_date).toLocaleDateString()} - {new Date(subscription.trial_end_date).toLocaleDateString()}</p>
                          {subscription.next_billing_date && (
                            <p><strong>Próximo cobro:</strong> {new Date(subscription.next_billing_date).toLocaleDateString()}</p>
                          )}
                          <p><strong>Creada:</strong> {new Date(subscription.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {subscriptions.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">
                      No hay suscripciones registradas
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Planes de Suscripción</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscriptionPlans.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{plan.name}</h3>
                          <Badge className={plan.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}>
                            {plan.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p><strong>Precio:</strong> ${plan.price} {plan.currency}</p>
                          <p><strong>Intervalo:</strong> {plan.billing_interval}</p>
                          <p><strong>Período de gracia:</strong> {plan.grace_period_days} días</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {editingPlan?.id === plan.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="Nuevo precio"
                              value={newPrice}
                              onChange={(e) => setNewPrice(e.target.value)}
                              className="w-32"
                            />
                            <Button 
                              size="sm"
                              onClick={() => handleUpdatePlanPrice(plan.id, parseFloat(newPrice))}
                              disabled={!newPrice}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Guardar
                            </Button>
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingPlan(null);
                                setNewPrice('');
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingPlan(plan);
                              setNewPrice(plan.price.toString());
                            }}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Editar Precio
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {subscriptionPlans.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">
                      No hay planes de suscripción configurados
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verifications">
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes de Verificación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {verificationRequests.filter(req => req.status === 'pending').map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{request.full_name}</h3>
                        <Badge variant="outline">{request.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Profesión:</strong> {request.profession}</p>
                        <p><strong>Email:</strong> {request.email}</p>
                        <p><strong>Teléfono:</strong> {request.phone || 'No especificado'}</p>
                        <p><strong>Experiencia:</strong> {request.years_experience || 'No especificado'} años</p>
                        <p><strong>Enviado:</strong> {new Date(request.submitted_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Funcionalidad de gestión de usuarios en desarrollo...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <SystemConfiguration />
          </TabsContent>

          <TabsContent value="business">
            <BusinessIntelligenceDashboard />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceMonitor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;