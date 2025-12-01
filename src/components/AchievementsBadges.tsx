import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, Lock, TrendingUp, Target, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface BadgeData {
  badge_id: string;
  badge_name: string;
  badge_description: string;
  badge_icon: string;
  badge_points: number;
  current_value: number;
  required_value: number;
  progress_percentage: number;
  is_earned: boolean;
  category?: string;
  rarity?: string;
}

interface AchievementsBadgesProps {
  userId?: string;
}

export const AchievementsBadges: React.FC<AchievementsBadgesProps> = ({ userId }) => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [filter, setFilter] = useState<'all' | 'earned' | 'progress'>('all');

  useEffect(() => {
    const effectiveUserId = userId || user?.id;
    if (effectiveUserId) {
      fetchBadges(effectiveUserId);
    }
  }, [userId, user]);

  const fetchBadges = async (effectiveUserId: string) => {
    try {
      setLoading(true);

      // Fetch all badges with their details
      const { data: allBadges, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true);

      if (badgesError) throw badgesError;

      // Fetch user achievements
      const { data: achievements, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('badge_id')
        .eq('user_id', effectiveUserId);

      if (achievementsError) throw achievementsError;

      const earnedBadgeIds = new Set((achievements || []).map(a => a.badge_id));

      // Transform badges into BadgeData format
      const badgesData: BadgeData[] = (allBadges || []).map(badge => ({
        badge_id: badge.id,
        badge_name: badge.name,
        badge_description: badge.description,
        badge_icon: badge.icon,
        badge_points: badge.points,
        current_value: 0, // Will be calculated by backend in future
        required_value: badge.condition_value,
        progress_percentage: earnedBadgeIds.has(badge.id) ? 100 : 0,
        is_earned: earnedBadgeIds.has(badge.id),
        category: badge.category,
        rarity: badge.rarity,
      }));

      setBadges(badgesData);

      // Calculate total points from earned badges
      const earnedPoints = badgesData
        .filter(b => b.is_earned)
        .reduce((sum, b) => sum + b.badge_points, 0);
      
      setTotalPoints(earnedPoints);

    } catch (error: any) {
      console.error('Error fetching badges:', error);
      toast.error('Error al cargar las insignias');
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'bg-gray-100 text-gray-700 border-gray-300',
      rare: 'bg-blue-100 text-blue-700 border-blue-300',
      epic: 'bg-purple-100 text-purple-700 border-purple-300',
      legendary: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getRarityLabel = (rarity: string) => {
    const labels = {
      common: 'Común',
      rare: 'Raro',
      epic: 'Épico',
      legendary: 'Legendario',
    };
    return labels[rarity as keyof typeof labels] || 'Común';
  };

  const filteredBadges = badges.filter(badge => {
    if (filter === 'earned') return badge.is_earned;
    if (filter === 'progress') return !badge.is_earned;
    return true;
  });

  const groupedByCategory = filteredBadges.reduce((acc, badge) => {
    const category = badge.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(badge);
    return acc;
  }, {} as Record<string, BadgeData[]>);

  const categoryNames: Record<string, string> = {
    profile: 'Perfil',
    services: 'Servicios',
    portfolio: 'Portafolio',
    reviews: 'Reseñas',
    verification: 'Verificación',
    activity: 'Actividad',
    achievements: 'Logros',
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const earnedCount = badges.filter(b => b.is_earned).length;
  const totalCount = badges.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Insignias y Logros
            </CardTitle>
            <CardDescription>
              {earnedCount} de {totalCount} insignias desbloqueadas
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-2xl font-bold text-primary">
              <Sparkles className="h-6 w-6" />
              {totalPoints}
            </div>
            <p className="text-xs text-muted-foreground">puntos totales</p>
          </div>
        </div>

        <Progress 
          value={(earnedCount / totalCount) * 100} 
          className="h-2 mt-4" 
        />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filtros */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              <Target className="h-4 w-4 mr-2" />
              Todas ({totalCount})
            </TabsTrigger>
            <TabsTrigger value="earned">
              <Trophy className="h-4 w-4 mr-2" />
              Ganadas ({earnedCount})
            </TabsTrigger>
            <TabsTrigger value="progress">
              <TrendingUp className="h-4 w-4 mr-2" />
              En Progreso ({totalCount - earnedCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Insignias por Categoría */}
        <div className="space-y-6">
          {Object.entries(groupedByCategory).map(([category, categoryBadges]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {categoryNames[category] || category}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryBadges.map((badge) => (
                  <div
                    key={badge.badge_id}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      badge.is_earned
                        ? 'bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-300 hover:shadow-lg'
                        : 'bg-muted/30 border-muted hover:border-muted-foreground/20'
                    }`}
                  >
                    {/* Icono de Badge */}
                    <div className="flex items-start gap-3">
                      <div
                        className={`text-4xl flex-shrink-0 ${
                          badge.is_earned ? '' : 'opacity-30 grayscale'
                        }`}
                      >
                        {badge.badge_icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4
                            className={`font-semibold text-sm ${
                              badge.is_earned ? 'text-foreground' : 'text-muted-foreground'
                            }`}
                          >
                            {badge.badge_name}
                          </h4>
                          {!badge.is_earned && (
                            <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground mb-2">
                          {badge.badge_description}
                        </p>

                        {/* Progreso */}
                        {!badge.is_earned && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                {badge.current_value} / {badge.required_value}
                              </span>
                              <span className="font-semibold text-primary">
                                {badge.progress_percentage}%
                              </span>
                            </div>
                            <Progress value={badge.progress_percentage} className="h-1.5" />
                          </div>
                        )}

                        {/* Puntos */}
                        <div className="flex items-center justify-between mt-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              badge.is_earned
                                ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                : ''
                            }`}
                          >
                            {badge.badge_points} pts
                          </Badge>
                          
                          {badge.is_earned && (
                            <Badge variant="default" className="text-xs">
                              ✓ Ganada
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredBadges.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {filter === 'earned'
                ? 'Aún no has ganado ninguna insignia. ¡Sigue completando tu perfil!'
                : filter === 'progress'
                ? 'Todas las insignias han sido desbloqueadas. ¡Excelente trabajo!'
                : 'No hay insignias disponibles'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
