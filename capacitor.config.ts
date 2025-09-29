import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.f6bb3e036006482e858f9a265175f27d',
  appName: 'chequealo',
  webDir: 'dist',
  server: {
    url: 'https://f6bb3e03-6006-482e-858f-9a265175f27d.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    Contacts: {
      // Configuración para contactos si es necesaria
    }
  }
};

export default config;