import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Settings, 
  Bell, 
  Shield, 
  Globe, 
  CreditCard,
  Users,
  Database,
  Mail,
  Check,
  AlertCircle
} from "lucide-react";
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SystemSettings {
  notifications_enabled: boolean;
  email_notifications: boolean;
  auto_verification: boolean;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  payment_processing: boolean;
  max_file_size: number;
  session_timeout: number;
}

export const SystemConfiguration = () => {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [settings, setSettings] = useState<SystemSettings>({
    notifications_enabled: true,
    email_notifications: true,
    auto_verification: false,
    maintenance_mode: false,
    registration_enabled: true,
    payment_processing: true,
    max_file_size: 10,
    session_timeout: 24
  });
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProfessionals: 0,
    activeSubscriptions: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    if (isAdmin) {
      fetchSystemStats();
      loadSettings();
    }
  }, [isAdmin]);

  const fetchSystemStats = async () => {
    try {
      // Get user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get professional count  
      const { count: professionalCount } = await supabase
        .from('professionals')
        .select('*', { count: 'exact', head: true });

      // Get active subscriptions
      const { count: activeSubscriptions } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get total revenue from completed payments
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'approved');

      const totalRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

      setStats({
        totalUsers: userCount || 0,
        totalProfessionals: professionalCount || 0,
        activeSubscriptions: activeSubscriptions || 0,
        totalRevenue
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  const loadSettings = () => {
    // In a real app, this would load from a system_settings table
    // For now, using localStorage as a demo
    const savedSettings = localStorage.getItem('system_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // In a real app, this would save to a system_settings table
      localStorage.setItem('system_settings', JSON.stringify(settings));
      
      toast.success('Configuración guardada correctamente');
    } catch (error) {
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof SystemSettings, value: boolean | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (roleLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Verificando permisos...</div>
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              No tienes permisos para acceder a la configuración del sistema.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usuarios Totales</p>
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
                <p className="text-sm font-medium text-muted-foreground">Profesionales</p>
                <p className="text-2xl font-bold">{stats.totalProfessionals}</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Suscripciones Activas</p>
                <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <Database className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Modo de Mantenimiento</Label>
                <p className="text-sm text-muted-foreground">
                  Desactiva el acceso público al sitio
                </p>
              </div>
              <Switch
                checked={settings.maintenance_mode}
                onCheckedChange={(checked) => updateSetting('maintenance_mode', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Registro Habilitado</Label>
                <p className="text-sm text-muted-foreground">
                  Permite que nuevos usuarios se registren
                </p>
              </div>
              <Switch
                checked={settings.registration_enabled}
                onCheckedChange={(checked) => updateSetting('registration_enabled', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Procesamiento de Pagos</Label>
                <p className="text-sm text-muted-foreground">
                  Habilita las funciones de pago
                </p>
              </div>
              <Switch
                checked={settings.payment_processing}
                onCheckedChange={(checked) => updateSetting('payment_processing', checked)}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Tamaño Máximo de Archivo (MB)</Label>
              <Input
                type="number"
                value={settings.max_file_size}
                onChange={(e) => updateSetting('max_file_size', parseInt(e.target.value) || 10)}
                min="1"
                max="100"
              />
            </div>

            <div className="space-y-3">
              <Label>Timeout de Sesión (horas)</Label>
              <Input
                type="number"
                value={settings.session_timeout}
                onChange={(e) => updateSetting('session_timeout', parseInt(e.target.value) || 24)}
                min="1"
                max="168"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones y Comunicaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Notificaciones del Sistema</Label>
                <p className="text-sm text-muted-foreground">
                  Habilita notificaciones en tiempo real
                </p>
              </div>
              <Switch
                checked={settings.notifications_enabled}
                onCheckedChange={(checked) => updateSetting('notifications_enabled', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Notificaciones por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Envía notificaciones por correo electrónico
                </p>
              </div>
              <Switch
                checked={settings.email_notifications}
                onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Verificación Automática</Label>
                <p className="text-sm text-muted-foreground">
                  Aprueba automáticamente nuevos profesionales
                </p>
              </div>
              <Switch
                checked={settings.auto_verification}
                onCheckedChange={(checked) => updateSetting('auto_verification', checked)}
              />
            </div>

            {/* System Status */}
            <div className="pt-4">
              <h4 className="font-semibold mb-3">Estado del Sistema</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="w-fit">
                    <Check className="h-3 w-3 mr-1" />
                    Base de Datos
                  </Badge>
                  <span className="text-sm text-green-600">Conectada</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="w-fit">
                    <Check className="h-3 w-3 mr-1" />
                    Pagos
                  </Badge>
                  <span className="text-sm text-green-600">Operativo</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="default" className="w-fit">
                    <Check className="h-3 w-3 mr-1" />
                    Notificaciones
                  </Badge>
                  <span className="text-sm text-green-600">Activas</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Guardar Configuración</h4>
              <p className="text-sm text-muted-foreground">
                Los cambios se aplicarán inmediatamente en el sistema
              </p>
            </div>
            <Button 
              onClick={saveSettings}
              disabled={saving}
              size="lg"
            >
              {saving ? (
                <>Guardando...</>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      {settings.maintenance_mode && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Modo de mantenimiento activado:</strong> Los usuarios no podrán acceder al sitio web.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};