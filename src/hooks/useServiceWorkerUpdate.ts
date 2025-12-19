import { useState, useEffect, useCallback } from 'react';

const DISMISSED_KEY = 'sw-update-dismissed';
const UPDATE_AVAILABLE_KEY = 'sw-update-available';

interface ServiceWorkerUpdateState {
  updateAvailable: boolean;
  isUpdating: boolean;
  registration: ServiceWorkerRegistration | null;
  bannerDismissed: boolean;
}

export const useServiceWorkerUpdate = () => {
  const [state, setState] = useState<ServiceWorkerUpdateState>({
    // Check sessionStorage for persisted update state
    updateAvailable: sessionStorage.getItem(UPDATE_AVAILABLE_KEY) === 'true',
    isUpdating: false,
    registration: null,
    bannerDismissed: localStorage.getItem(DISMISSED_KEY) === 'true',
  });

  const updateApp = useCallback(() => {
    if (!state.registration?.waiting) {
      console.log('[SW Update] No waiting worker found');
      return;
    }

    setState(prev => ({ ...prev, isUpdating: true }));
    console.log('[SW Update] Sending SKIP_WAITING to service worker');
    
    // Clear dismissed and update available state when updating
    localStorage.removeItem(DISMISSED_KEY);
    sessionStorage.removeItem(UPDATE_AVAILABLE_KEY);
    
    // Tell the waiting service worker to take over
    state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }, [state.registration]);

  const dismissBanner = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setState(prev => ({ ...prev, bannerDismissed: true }));
  }, []);

  const showBanner = useCallback(() => {
    localStorage.removeItem(DISMISSED_KEY);
    setState(prev => ({ ...prev, bannerDismissed: false }));
  }, []);

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
        sessionStorage.setItem(UPDATE_AVAILABLE_KEY, 'true');
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
    bannerDismissed: state.bannerDismissed,
    updateApp,
    dismissBanner,
    showBanner,
  };
};
