import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2, Zap, MessageCircle, Bell, Calendar } from 'lucide-react';
import { playNotificationSound, initializeAudioContext } from '@/utils/notificationSound';

export const NotificationSoundTest = () => {
  const handlePlay = (type: 'contact' | 'express' | 'message' | 'default') => {
    initializeAudioContext();
    playNotificationSound(type);
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Prueba de Sonidos de Notificación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={() => handlePlay('express')} 
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        >
          <Zap className="h-4 w-4 mr-2" />
          Sonido Express (Urgente)
        </Button>
        
        <Button 
          onClick={() => handlePlay('contact')} 
          variant="outline"
          className="w-full"
        >
          <Bell className="h-4 w-4 mr-2" />
          Sonido Contacto (Chime)
        </Button>
        
        <Button 
          onClick={() => handlePlay('message')} 
          variant="outline"
          className="w-full"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Sonido Mensaje (Ping)
        </Button>
        
        <Button 
          onClick={() => handlePlay('default')} 
          variant="secondary"
          className="w-full"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Sonido Default
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationSoundTest;
