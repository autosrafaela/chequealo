import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
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
    averageRating: 0
  });
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState('');

  // Debug logs to diagnose blank page
  console.log('[AdminDashboard] render', { userId: user?.id, isAdmin, roleLoading, loading });

  useEffect(() => {
    console.log('[AdminDashboard] useEffect', { hasUser: !!user, isAdmin });
    if (user && isAdmin) {
      fetchAdminData();
    }
  }, [user, isAdmin]);

  // Redirect if not admin
  if (!roleLoading && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Cargando panel de administración...</div>
        </div>
      </div>
    );
  }

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

      // Calculate stats
      const totalUsers = profiles?.length || 0;
      const totalProfessionals = professionalsData?.length || 0;
      const pendingVerifications = verificationsData?.filter(v => v.status === 'pending').length || 0;
      const totalReviews = reviewsData?.length || 0;
      const totalContactRequests = contactRequestsData?.length || 0;
      const averageRating = totalReviews > 0 
        ? reviewsData.reduce((acc, r) => acc + r.rating, 0) / totalReviews 
        : 0;

      setStats({
        totalUsers,
        totalProfessionals,
        pendingVerifications,
        totalReviews,
        totalContactRequests,
        averageRating: Math.round(averageRating * 10) / 10
      });

      setProfessionals(professionalsData || []);
      setVerificationRequests(verificationsData || []);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
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

          <Card>
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

          <Card>
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

          <Card>
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

          <Card>
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

          <Card>
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
        </div>

        {/* Main Content */}
        <Tabs defaultValue="professionals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="professionals">
              Profesionales ({stats.totalProfessionals})
            </TabsTrigger>
            <TabsTrigger value="verifications">
              Verificaciones ({stats.pendingVerifications})
            </TabsTrigger>
            <TabsTrigger value="users">
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="settings">
              Configuración
            </TabsTrigger>
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
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Agregar Administrador</h3>
                  <form onSubmit={handleAddAdmin} className="flex gap-3">
                    <div className="flex-1">
                      <Label htmlFor="admin-email">Email del nuevo admin</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="admin@ejemplo.com"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="mt-6">
                      Agregar Admin
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;