import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import VerificationRequestForm from '@/components/VerificationRequestForm';

interface VerificationRequest {
  id: string;
  status: string;
  submitted_at: string;
  reviewed_at?: string;
  admin_notes?: string;
  full_name: string;
  profession: string;
}

const Verification: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [verificationRequest, setVerificationRequest] = useState<VerificationRequest | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      setUser(user);
      await fetchVerificationRequest(user.id);
    } catch (error) {
      console.error('Error checking user:', error);
      toast({
        title: "Error",
        description: "Error al verificar usuario",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVerificationRequest = async (userId: string) => {
    const { data, error } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('professional_id', userId)
      .order('submitted_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching verification request:', error);
      return;
    }

    if (data && data.length > 0) {
      setVerificationRequest(data[0]);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    if (user) {
      fetchVerificationRequest(user.id);
    }
    toast({
      title: "Solicitud enviada",
      description: "Tu solicitud de verificación ha sido enviada exitosamente",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente de Revisión';
      case 'approved':
        return 'Verificado';
      case 'rejected':
        return 'Rechazado';
      default:
        return '';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Inicio
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Verificación Profesional</h1>
            <p className="text-muted-foreground">
              Verifica tu identidad profesional para obtener mayor confianza de los clientes
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {!verificationRequest && !showForm && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <AlertCircle className="h-6 w-6 text-blue-500" />
                  ¿Por qué verificarse?
                </CardTitle>
                <CardDescription>
                  La verificación profesional te ayuda a generar más confianza con tus clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-green-600">Beneficios de estar verificado:</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Insignia de verificado visible
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Mayor confianza de los clientes
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Apareces primero en búsquedas
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Acceso a funciones premium
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-blue-600">Proceso de verificación:</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">1</div>
                        Completa el formulario con tus datos
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">2</div>
                        Sube documentos que acrediten tu profesión
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">3</div>
                        Espera la revisión (24-48 horas)
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">4</div>
                        ¡Obtén tu verificación!
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="text-center">
                  <Button onClick={() => setShowForm(true)} size="lg">
                    Solicitar Verificación
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {verificationRequest && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(verificationRequest.status)}
                  Estado de Verificación
                </CardTitle>
                <CardDescription>
                  Solicitud enviada el {new Date(verificationRequest.submitted_at).toLocaleDateString('es-AR')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{verificationRequest.full_name}</p>
                    <p className="text-sm text-muted-foreground">{verificationRequest.profession}</p>
                  </div>
                  <Badge variant={getStatusVariant(verificationRequest.status)}>
                    {getStatusText(verificationRequest.status)}
                  </Badge>
                </div>

                {verificationRequest.status === 'pending' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <h3 className="font-medium text-yellow-800">Solicitud en Revisión</h3>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Tu solicitud está siendo revisada por nuestro equipo. 
                      Recibirás una notificación cuando el proceso esté completo.
                    </p>
                  </div>
                )}

                {verificationRequest.status === 'approved' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h3 className="font-medium text-green-800">¡Verificación Aprobada!</h3>
                    </div>
                    <p className="text-sm text-green-700">
                      Felicitaciones, tu verificación profesional ha sido aprobada. 
                      Ahora aparebes como verificado en la plataforma.
                    </p>
                    {verificationRequest.reviewed_at && (
                      <p className="text-xs text-green-600 mt-2">
                        Verificado el {new Date(verificationRequest.reviewed_at).toLocaleDateString('es-AR')}
                      </p>
                    )}
                  </div>
                )}

                {verificationRequest.status === 'rejected' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <h3 className="font-medium text-red-800">Solicitud Rechazada</h3>
                    </div>
                    <p className="text-sm text-red-700">
                      Tu solicitud no pudo ser aprobada. Puedes enviar una nueva solicitud 
                      con la documentación correcta.
                    </p>
                    {verificationRequest.admin_notes && (
                      <div className="mt-3 p-2 bg-red-100 rounded">
                        <p className="text-xs font-medium text-red-800">Comentarios del revisor:</p>
                        <p className="text-sm text-red-700 mt-1">{verificationRequest.admin_notes}</p>
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      className="mt-3"
                      onClick={() => setShowForm(true)}
                    >
                      Enviar Nueva Solicitud
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {showForm && (
            <VerificationRequestForm onSuccess={handleFormSuccess} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Verification;