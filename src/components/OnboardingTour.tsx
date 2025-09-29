import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ArrowRight, ArrowLeft, CheckCircle, Search, User, Heart, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  target?: string;
  action?: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: '¡Bienvenido a Chequealo!',
    description: 'Te vamos a mostrar cómo usar la plataforma para encontrar los mejores profesionales.',
    icon: CheckCircle,
  },
  {
    id: 'search',
    title: 'Buscar Profesionales',
    description: 'Usa nuestra búsqueda inteligente para encontrar exactamente lo que necesitás.',
    icon: Search,
    target: '.hero-search-bar',
    action: 'Ir a buscar'
  },
  {
    id: 'profile',
    title: 'Completá tu Perfil',
    description: 'Un perfil completo te ayuda a obtener mejores respuestas de los profesionales.',
    icon: User,
    target: '.profile-menu',
    action: 'Completar perfil'
  },
  {
    id: 'favorites',
    title: 'Guardá tus Favoritos',
    description: 'Marcá como favoritos a los profesionales que más te interesen.',
    icon: Heart,
    action: 'Entendido'
  },
  {
    id: 'booking',
    title: 'Reservá Citas',
    description: 'Podés agendar citas directamente con profesionales verificados.',
    icon: Calendar,
    action: 'Comenzar'
  }
];

interface OnboardingTourProps {
  onComplete?: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding tour
    const tourCompleted = localStorage.getItem('onboarding-completed');
    const isNewUser = user && !tourCompleted;
    
    // Temporarily disable auto-showing tour to avoid blocking the interface
    // Only show if explicitly requested
    if (false && isNewUser && !hasSeenTour) {
      // Delay showing the tour slightly to allow page to load
      setTimeout(() => {
        setIsVisible(true);
        setHasSeenTour(true);
      }, 1000);
    }
  }, [user, hasSeenTour]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding-completed', 'true');
    setIsVisible(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding-completed', 'true');
    setIsVisible(false);
  };

  const handleAction = () => {
    const step = onboardingSteps[currentStep];
    
    switch (step.id) {
      case 'search':
        // Focus on search bar or scroll to it
        const searchElement = document.querySelector('.hero-search-bar input');
        searchElement?.scrollIntoView({ behavior: 'smooth' });
        (searchElement as HTMLInputElement)?.focus();
        break;
      case 'profile':
        // Navigate to profile or show profile menu
        window.location.href = '/user/dashboard';
        break;
      default:
        handleNext();
    }
  };

  if (!isVisible || !user) return null;

  const step = onboardingSteps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {currentStep + 1} de {onboardingSteps.length}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-3 mt-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">{step.title}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-muted-foreground">{step.description}</p>

          {/* Progress bar */}
          <div className="w-full bg-secondary h-2 rounded-full">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Anterior
            </Button>

            <div className="flex gap-2">
              {currentStep < onboardingSteps.length - 1 && (
                <Button variant="outline" onClick={handleSkip}>
                  Saltar tour
                </Button>
              )}
              
              <Button onClick={step.action ? handleAction : handleNext} className="flex items-center gap-2">
                {step.action || (currentStep === onboardingSteps.length - 1 ? 'Finalizar' : 'Siguiente')}
                {currentStep < onboardingSteps.length - 1 && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingTour;