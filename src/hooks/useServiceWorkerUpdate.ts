import { useState, useEffect, useCallback } from 'react';

interface ServiceWorkerUpdateState {
  updateAvailable: boolean;
  isUpdating: boolean;
  registration: ServiceWorkerRegistration | null;
}

export const useServiceWorkerUpdate = () => {
  const [state, setState] = useState<ServiceWorkerUpdateState>({
    updateAvailable: false,
    isUpdating: false,
    registration: null,
  });

  const updateApp = useCallback(() => {
    if (!state.registration?.waiting) {
      console.log('[SW Update] No waiting worker found');
      return;
    }

    setState(prev => ({ ...prev, isUpdating: true }));
    console.log('[SW Update] Sending SKIP_WAITING to service worker');
    
    // Tell the waiting service worker to take over
    state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }, [state.registration]);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.log('[SW Update] Service Worker not supported');
      return;
    }

    const isLocalDev = import.meta.env.DEV && location.hostname === 'localhost';
    if (isLocalDev) {
      return;
    }

    let registration: ServiceWorkerRegistration | null = null;

    const handleControllerChange = () => {
      console.log('[SW Update] Controller changed, reloading page');
      window.location.reload();
    };

    const checkForWaitingWorker = (reg: ServiceWorkerRegistration) => {
      if (reg.waiting) {
        console.log('[SW Update] Found waiting worker');
        setState(prev => ({ ...prev, updateAvailable: true, registration: reg }));
      }
    };

    const handleStateChange = (event: Event) => {
      const sw = event.target as ServiceWorker;
      console.log('[SW Update] Service worker state changed:', sw.state);
      
      if (sw.state === 'installed' && registration) {
        checkForWaitingWorker(registration);
      }
    };

    const setupServiceWorker = async () => {
      try {
        registration = await navigator.serviceWorker.getRegistration();
        
        if (!registration) {
          console.log('[SW Update] No registration found');
          return;
        }

        console.log('[SW Update] Got registration');
        setState(prev => ({ ...prev, registration }));

        // Check if there's already a waiting worker
        checkForWaitingWorker(registration);

        // Listen for new service worker installing
        registration.addEventListener('updatefound', () => {
          console.log('[SW Update] Update found');
          const newWorker = registration?.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', handleStateChange);
          }
        });

        // Listen for controller change (new SW took over)
        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      } catch (error) {
        console.error('[SW Update] Error setting up:', error);
      }
    };

    setupServiceWorker();

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  return {
    updateAvailable: state.updateAvailable,
    isUpdating: state.isUpdating,
    updateApp,
  };
};
