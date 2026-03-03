import { useState, useEffect } from 'react';
import defaultLogo from '@/assets/chequealo-new-logo.png';

const STORAGE_KEY = 'active_logo_url';

export const getAppLogo = (): string => {
  return localStorage.getItem(STORAGE_KEY) || defaultLogo;
};

export const updateFavicon = (url?: string) => {
  const logoUrl = url || getAppLogo();
  const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (link) {
    link.href = logoUrl;
  }
};

export const useAppLogo = (): string => {
  const [logoUrl, setLogoUrl] = useState<string>(getAppLogo());

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const newUrl = e.newValue || defaultLogo;
        setLogoUrl(newUrl);
        updateFavicon(newUrl);
      }
    };

    // Custom event for same-tab updates
    const handleCustom = () => {
      const newUrl = getAppLogo();
      setLogoUrl(newUrl);
      updateFavicon(newUrl);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('app-logo-changed', handleCustom);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('app-logo-changed', handleCustom);
    };
  }, []);

  return logoUrl;
};

/** Call this after changing localStorage to notify same-tab listeners */
export const dispatchLogoChange = () => {
  window.dispatchEvent(new Event('app-logo-changed'));
};
