import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Lightbulb, ArrowRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface Tip {
  id: string;
  title: string;
  content: string;
  route: string;
  condition?: () => boolean;
  action?: {
    label: string;
    url: string;
  };
}

const contextualTips: Tip[] = [
  {
    id: 'search-tip',
    title: 'Tip de Búsqueda',
    content: 'Usa nuestra búsqueda por voz o describe tu problema en lenguaje natural. Por ejemplo: "necesito alguien que arregle mi heladera que no enfría".',
    route: '/search',
  },
  {
    id: 'profile-tip',
    title: 'Mejorá tu Perfil',
    content: 'Un perfil completo con foto y descripción genera 3x más confianza en los profesionales.',
    route: '/user/dashboard',
    condition: () => {
      const profile = JSON.parse(localStorage.getItem('user-profile') || '{}');
      return !profile.avatar_url || !profile.bio;
    },
    action: {
      label: 'Completar perfil',
      url: '/user/dashboard'
    }
  },
  {
    id: 'favorites-tip',
    title: 'Organizá tus Favoritos',
    content: 'Guardá profesionales en favoritos para contactarlos más tarde. Es como tu agenda personal.',
    route: '/user/favorites',
  },
  {
    id: 'professional-dashboard-tip',
    title: 'Optimizá tu Visibilidad',
    content: 'Profesionales con fotos de trabajos realizados reciben 5x más contactos. ¿Ya subiste ejemplos de tu trabajo?',
    route: '/professional/dashboard',
    condition: () => {
      const workPhotos = JSON.parse(localStorage.getItem('work-photos-count') || '0');
      return workPhotos < 3;
    },
    action: {
      label: 'Subir fotos',
      url: '/professional/dashboard#work-photos'
    }
  },
  {
    id: 'booking-tip',
    title: 'Reservá con Confianza',
    content: 'Los profesionales verificados tienen garantía de calidad. Buscá el badge de verificación.',
    route: '/professional',
  },
  {
    id: 'contact-tip',
    title: 'Comunicación Efectiva',
    content: 'Sé específico en tu solicitud: incluye fotos, ubicación exacta y presupuesto aproximado.',
    route: '/search',
  }
];

interface ContextualTipsProps {
  className?: string;
}

export const ContextualTips: React.FC<ContextualTipsProps> = ({ className }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [currentTip, setCurrentTip] = useState<Tip | null>(null);
  const [dismissedTips, setDismissedTips] = useState<string[]>([]);

  useEffect(() => {
    // Load dismissed tips from localStorage
    const dismissed = JSON.parse(localStorage.getItem('dismissed-tips') || '[]');
    setDismissedTips(dismissed);
  }, []);

  useEffect(() => {
    if (!user) return;

    // Find relevant tip for current route
    const relevantTips = contextualTips.filter(tip => 
      location.pathname.startsWith(tip.route) && 
      !dismissedTips.includes(tip.id) &&
      (!tip.condition || tip.condition())
    );

    if (relevantTips.length > 0) {
      // Show tip after a short delay
      const timer = setTimeout(() => {
        setCurrentTip(relevantTips[0]);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, user, dismissedTips]);

  const dismissTip = (tipId: string) => {
    const newDismissed = [...dismissedTips, tipId];
    setDismissedTips(newDismissed);
    localStorage.setItem('dismissed-tips', JSON.stringify(newDismissed));
    setCurrentTip(null);
  };

  const handleAction = () => {
    if (currentTip?.action) {
      window.location.href = currentTip.action.url;
    }
    if (currentTip) {
      dismissTip(currentTip.id);
    }
  };

  if (!currentTip) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-40 max-w-sm ${className || ''}`}>
      <Card className="bg-primary/5 border-primary/20 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lightbulb className="h-4 w-4 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-foreground mb-1">
                {currentTip.title}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {currentTip.content}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissTip(currentTip.id)}
              className="h-6 w-6 p-0 flex-shrink-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {currentTip.action && (
            <div className="mt-3 pt-3 border-t border-primary/10">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAction}
                className="w-full text-xs h-8 bg-primary/5 border-primary/20 hover:bg-primary/10"
              >
                {currentTip.action.label}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContextualTips;