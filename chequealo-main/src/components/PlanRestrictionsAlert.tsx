import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Crown, AlertTriangle, Zap, Camera, Lock, Mail } from "lucide-react";
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';

interface PlanRestrictionsAlertProps {
  featureType: 'contacts' | 'photos' | 'analytics' | 'support' | 'advanced_availability' | 'bidirectional_reviews' | 'video_uploads' | 'before_after_gallery' | 'digital_certificates' | 'proximity_search' | 'interactive_map';
  currentUsage?: number;
  onUpgrade?: () => void;
}

export const PlanRestrictionsAlert: React.FC<PlanRestrictionsAlertProps> = ({
  featureType,
  currentUsage = 0,
  onUpgrade
}) => {
  const { planLimits, getPlanName } = usePlanRestrictions();

  const getFeatureInfo = () => {
    switch (featureType) {
      case 'contacts':
        return {
          title: 'Límite de Contactos Alcanzado',
          description: `Has alcanzado el límite de ${planLimits.maxContactRequests} contactos mensuales de tu ${getPlanName()}.`,
          icon: <AlertTriangle className="h-4 w-4" />,
          upgradeText: 'Upgrade para contactos ilimitados'
        };
      case 'photos':
        return {
          title: 'Límite de Fotos Alcanzado',
          description: `Has alcanzado el límite de ${planLimits.maxWorkPhotos} fotos en tu galería con el ${getPlanName()}.`,
          icon: <AlertTriangle className="h-4 w-4" />,
          upgradeText: 'Upgrade para fotos ilimitadas'
        };
      case 'analytics':
        return {
          title: 'Analíticas Avanzadas No Disponibles',
          description: `Las analíticas avanzadas no están incluidas en tu ${getPlanName()}.`,
          icon: <Crown className="h-4 w-4" />,
          upgradeText: 'Upgrade para analíticas avanzadas'
        };
      case 'support':
        return {
          title: 'Soporte Prioritario No Disponible',
          description: `El soporte prioritario no está incluido en tu ${getPlanName()}.`,
          icon: <Zap className="h-4 w-4" />,
          upgradeText: 'Upgrade para soporte prioritario'
        };
      case 'advanced_availability':
        return {
          title: 'Gestión de Disponibilidad Limitada',
          description: 'Tu plan actual permite solo 5 horarios básicos. Actualiza para horarios ilimitados.',
          icon: <AlertTriangle className="h-4 w-4" />,
          upgradeText: 'Actualizar Plan'
        };
      case 'bidirectional_reviews':
        return {
          title: 'Sistema de Calificaciones Limitado',
          description: 'Tu plan actual permite calificar hasta 10 clientes. Actualiza para calificaciones ilimitadas.',
          icon: <Crown className="h-4 w-4" />,
          upgradeText: 'Actualizar Plan'
        };
      case 'video_uploads':
        return {
          title: 'Videos No Disponibles',
          description: 'La subida de videos no está incluida en tu plan actual.',
          icon: <Camera className="h-4 w-4" />,
          upgradeText: 'Actualizar para subir videos'
        };
      case 'before_after_gallery':
        return {
          title: 'Galería Antes/Después No Disponible',
          description: 'Las comparaciones antes/después no están incluidas en tu plan.',
          icon: <Camera className="h-4 w-4" />,
          upgradeText: 'Actualizar para galería antes/después'
        };
      case 'digital_certificates':
        return {
          title: 'Certificaciones Digitales No Disponibles',
          description: 'La gestión de certificaciones no está incluida en tu plan.',
          icon: <Lock className="h-4 w-4" />,
          upgradeText: 'Actualizar para certificaciones'
        };
      case 'proximity_search':
        return {
          title: 'Búsqueda por Proximidad No Disponible',
          description: 'La búsqueda por ubicación no está incluida en tu plan.',
          icon: <Lock className="h-4 w-4" />,
          upgradeText: 'Actualizar para búsqueda por proximidad'
        };
      case 'interactive_map':
        return {
          title: 'Mapa Interactivo No Disponible',
          description: 'El mapa interactivo no está incluido en tu plan.',
          icon: <Lock className="h-4 w-4" />,
          upgradeText: 'Actualizar para mapa interactivo'
        };
      default:
        return {
          title: 'Función Limitada',
          description: 'Esta función tiene limitaciones en tu plan actual.',
          icon: <AlertTriangle className="h-4 w-4" />,
          upgradeText: 'Actualizar Plan'
        };
    }
  };

  const featureInfo = getFeatureInfo();

  // Don't show alert if user has unlimited access
  if (featureType === 'contacts' && planLimits.maxContactRequests === -1) return null;
  if (featureType === 'photos' && planLimits.maxWorkPhotos === -1) return null;
  if (featureType === 'analytics' && planLimits.advancedAnalytics) return null;
  if (featureType === 'support' && planLimits.prioritySupport) return null;

  return (
    <Alert className="border-orange-200 bg-orange-50">
      {featureInfo.icon}
      <AlertDescription className="flex items-center justify-between">
        <div>
          <div className="font-medium">{featureInfo.title}</div>
          <div className="text-sm mt-1">{featureInfo.description}</div>
          {currentUsage > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              Uso actual: {currentUsage}
            </div>
          )}
        </div>
        {onUpgrade && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onUpgrade}
            className="ml-4 shrink-0"
          >
            <Crown className="w-3 h-3 mr-1" />
            {featureInfo.upgradeText}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};