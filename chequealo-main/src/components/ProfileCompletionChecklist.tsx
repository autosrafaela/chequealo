import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, User, Mail, Phone, MapPin, FileText, Camera, Award, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface ChecklistItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  completed: boolean;
  route?: string;
  priority: 'high' | 'medium' | 'low';
}

interface ProfileCompletionChecklistProps {
  isVisible?: boolean;
  onClose?: () => void;
  className?: string;
}

export const ProfileCompletionChecklist: React.FC<ProfileCompletionChecklistProps> = ({ 
  isVisible, 
  onClose,
  className 
}) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [professional, setProfessional] = useState<any>(null);
  const [showChecklist, setShowChecklist] = useState(false);

  useEffect(() => {
    if (user && isVisible !== false) {
      loadProfileData();
    }
  }, [user, profile, isVisible]);

  const loadProfileData = async () => {
    if (!user) return;

    try {
      // Load professional data if user is a professional
      const { data: professionalData } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setProfessional(professionalData);

      // Build checklist based on user type
      const items: ChecklistItem[] = [
        {
          id: 'avatar',
          label: 'Foto de perfil',
          icon: Camera,
          completed: !!profile?.avatar_url,
          route: '/user/dashboard',
          priority: 'high'
        },
        {
          id: 'full_name',
          label: 'Nombre completo',
          icon: User,
          completed: !!profile?.full_name,
          route: '/user/dashboard',
          priority: 'high'
        },
        {
          id: 'bio',
          label: 'Descripción personal',
          icon: FileText,
          completed: !!profile?.bio,
          route: '/user/dashboard',
          priority: 'medium'
        },
        {
          id: 'location',
          label: 'Ubicación',
          icon: MapPin,
          completed: !!profile?.location,
          route: '/user/dashboard',
          priority: 'medium'
        }
      ];

      // Add professional-specific items
      if (professionalData) {
        items.push(
          {
            id: 'professional_description',
            label: 'Descripción profesional',
            icon: FileText,
            completed: !!professionalData.description,
            route: '/professional/dashboard',
            priority: 'high'
          },
          {
            id: 'phone',
            label: 'Teléfono de contacto',
            icon: Phone,
            completed: !!professionalData.phone,
            route: '/professional/dashboard',
            priority: 'high'
          },
          {
            id: 'professional_location',
            label: 'Zona de trabajo',
            icon: MapPin,
            completed: !!professionalData.location,
            route: '/professional/dashboard',
            priority: 'high'
          }
        );

        // Check for work photos
        const { data: workPhotos } = await supabase
          .from('work_photos')
          .select('id')
          .eq('professional_id', professionalData.id);

        items.push({
          id: 'work_photos',
          label: 'Fotos de trabajos (min. 3)',
          icon: Camera,
          completed: (workPhotos?.length || 0) >= 3,
          route: '/professional/dashboard',
          priority: 'medium'
        });

        // Check for services
        const { data: services } = await supabase
          .from('professional_services')
          .select('id')
          .eq('professional_id', professionalData.id);

        items.push({
          id: 'services',
          label: 'Servicios ofrecidos',
          icon: Award,
          completed: (services?.length || 0) > 0,
          route: '/professional/dashboard',
          priority: 'medium'
        });
      }

      setChecklist(items);

      // Show checklist if profile completion is low
      const completedItems = items.filter(item => item.completed).length;
      const completionRate = (completedItems / items.length) * 100;
      
      if (completionRate < 70 && isVisible !== false) {
        setShowChecklist(true);
      }

    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const handleItemClick = (item: ChecklistItem) => {
    if (item.route) {
      navigate(item.route);
    }
  };

  const handleClose = () => {
    setShowChecklist(false);
    onClose?.();
    // Remember that user dismissed the checklist
    localStorage.setItem('checklist-dismissed', Date.now().toString());
  };

  // Don't show if explicitly hidden or if recently dismissed
  if (isVisible === false || !showChecklist) return null;

  const recentlyDismissed = () => {
    const dismissed = localStorage.getItem('checklist-dismissed');
    if (!dismissed) return false;
    const dismissedTime = parseInt(dismissed);
    const dayInMs = 24 * 60 * 60 * 1000;
    return Date.now() - dismissedTime < dayInMs;
  };

  if (recentlyDismissed()) return null;

  const completedItems = checklist.filter(item => item.completed).length;
  const completionRate = checklist.length > 0 ? (completedItems / checklist.length) * 100 : 0;
  const highPriorityIncomplete = checklist.filter(item => 
    item.priority === 'high' && !item.completed
  ).length;

  return (
    <div className={`${className || ''}`}>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Completá tu Perfil</CardTitle>
              {highPriorityIncomplete > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {highPriorityIncomplete} urgente{highPriorityIncomplete > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {completedItems} de {checklist.length} completado
              </span>
              <span className="font-medium">{Math.round(completionRate)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {checklist
            .sort((a, b) => {
              // Sort by priority and completion status
              if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
              }
              const priorityOrder = { high: 0, medium: 1, low: 2 };
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            })
            .map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-2 rounded-md transition-colors cursor-pointer ${
                    item.completed 
                      ? 'text-muted-foreground' 
                      : 'hover:bg-primary/5'
                  }`}
                  onClick={() => !item.completed && handleItemClick(item)}
                >
                  <div className="flex items-center justify-center w-5 h-5">
                    {item.completed ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  
                  <Icon className={`h-4 w-4 ${
                    item.completed ? 'text-muted-foreground' : 'text-primary'
                  }`} />
                  
                  <span className={`flex-1 text-sm ${
                    item.completed 
                      ? 'text-muted-foreground line-through' 
                      : 'text-foreground'
                  }`}>
                    {item.label}
                  </span>

                  {item.priority === 'high' && !item.completed && (
                    <Badge variant="outline" className="text-xs">
                      Importante
                    </Badge>
                  )}
                </div>
              );
            })}

          {completionRate >= 70 && (
            <div className="mt-4 p-3 bg-success/10 rounded-md text-center">
              <CheckCircle className="h-5 w-5 text-success mx-auto mb-1" />
              <p className="text-sm text-success font-medium">
                ¡Perfil completado! Ahora tenés más chances de ser contactado.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileCompletionChecklist;