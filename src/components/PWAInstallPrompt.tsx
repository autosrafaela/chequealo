import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone, Zap, Bell, Wifi } from 'lucide-react';
import chequealoLogo from '@/assets/chequealo-new-logo.png';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Hook to manage PWA install state globally
export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return outcome === 'accepted';
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return false;
    }
  };

  return { deferredPrompt, isInstalled, triggerInstall, canInstall: !!deferredPrompt && !isInstalled };
};

export const PWAInstallPrompt: React.FC = () => {
  const { deferredPrompt, isInstalled, triggerInstall } = usePWAInstall();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!deferredPrompt || isInstalled) return;

    // Check if user dismissed the prompt
    const dismissedAt = localStorage.getItem('pwa-install-prompt-dismissed-at');
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000; // 3 days
      if (Date.now() - dismissedTime < threeDaysMs) {
        return; // Still within the 3-day cooldown
      }
      // Clear old dismissal
      localStorage.removeItem('pwa-install-prompt-dismissed-at');
    }

    // Show prompt after 2 seconds
    const timer = setTimeout(() => {
      setIsAnimating(true);
      setShowPrompt(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [deferredPrompt, isInstalled]);

  const handleInstall = async () => {
    const accepted = await triggerInstall();
    if (accepted) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setShowPrompt(false);
      localStorage.setItem('pwa-install-prompt-dismissed-at', Date.now().toString());
    }, 300);
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleDismiss}
      />
      
      {/* Bottom Sheet */}
      <div 
        className={`fixed inset-x-0 bottom-0 z-[101] transition-transform duration-300 ease-out ${isAnimating ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="bg-gradient-to-br from-primary via-primary to-primary/90 rounded-t-3xl shadow-2xl overflow-hidden">
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-white/30 rounded-full" />
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          <div className="px-6 pb-8 pt-2">
            {/* App Icon and Title */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center p-2">
                <img src={chequealoLogo} alt="Chequealo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Instalá Chequealo</h2>
                <p className="text-white/80 text-sm">Acceso rápido desde tu pantalla</p>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <Zap className="h-6 w-6 text-yellow-300 mx-auto mb-1" />
                <span className="text-white/90 text-xs">Más rápido</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <Bell className="h-6 w-6 text-yellow-300 mx-auto mb-1" />
                <span className="text-white/90 text-xs">Notificaciones</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <Wifi className="h-6 w-6 text-yellow-300 mx-auto mb-1" />
                <span className="text-white/90 text-xs">Sin conexión</span>
              </div>
            </div>

            {/* Install Button */}
            <Button
              onClick={handleInstall}
              className="w-full bg-white text-primary hover:bg-white/90 font-semibold py-6 text-lg rounded-xl shadow-lg"
            >
              <Download className="h-5 w-5 mr-2" />
              Instalar Ahora
            </Button>

            {/* Later button */}
            <button
              onClick={handleDismiss}
              className="w-full text-white/70 hover:text-white text-sm mt-4 py-2"
            >
              Ahora no, gracias
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Enhanced iOS Install Instructions
export const IOSInstallInstructions: React.FC = () => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    
    // Check cooldown
    const dismissedAt = localStorage.getItem('ios-install-dismissed-at');
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < threeDaysMs) {
        return;
      }
      localStorage.removeItem('ios-install-dismissed-at');
    }

    if (isIOS && !isInStandaloneMode) {
      setTimeout(() => {
        setIsAnimating(true);
        setShowInstructions(true);
      }, 2000);
    }
  }, []);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setShowInstructions(false);
      localStorage.setItem('ios-install-dismissed-at', Date.now().toString());
    }, 300);
  };

  if (!showInstructions) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleDismiss}
      />
      
      {/* Bottom Sheet */}
      <div 
        className={`fixed inset-x-0 bottom-0 z-[101] transition-transform duration-300 ease-out ${isAnimating ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="bg-gradient-to-br from-primary via-primary to-primary/90 rounded-t-3xl shadow-2xl overflow-hidden">
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-white/30 rounded-full" />
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          <div className="px-6 pb-8 pt-2">
            {/* App Icon and Title */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center p-2">
                <img src={chequealoLogo} alt="Chequealo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Instalá Chequealo</h2>
                <p className="text-white/80 text-sm">Agregá la app a tu iPhone</p>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary font-bold text-sm">1</div>
                <span className="text-white">Tocá el botón de compartir <span className="inline-block">⬆️</span></span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary font-bold text-sm">2</div>
                <span className="text-white">Seleccioná "Agregar a Inicio" <span className="inline-block">➕</span></span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary font-bold text-sm">3</div>
                <span className="text-white">Confirmá tocando "Agregar" ✓</span>
              </div>
            </div>

            {/* Got it button */}
            <Button
              onClick={handleDismiss}
              className="w-full bg-white text-primary hover:bg-white/90 font-semibold py-6 text-lg rounded-xl shadow-lg"
            >
              <Smartphone className="h-5 w-5 mr-2" />
              ¡Entendido!
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
