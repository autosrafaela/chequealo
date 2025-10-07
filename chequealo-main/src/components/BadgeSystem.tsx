import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Award, 
  Star, 
  Shield, 
  Camera, 
  Heart, 
  MessageSquare, 
  Clock, 
  Briefcase,
  User,
  MessageCircle,
  Trophy,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  rarity: string;
  condition_type: string;
  condition_value: number;
  earned_at?: string;
  progress?: number;
}

interface UserStats {
  total_points: number;
  level: number;
  experience_points: number;
  badges_count: number;
  ranking_position?: number;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  MessageSquare,
  Shield,
  Star,
  Camera,
  Heart,
  Award,
  MessageCircle,
  Clock,
  Briefcase,
  User,
  Trophy
};

const rarityColors = {
  common: 'bg-gray-100 text-gray-800 border-gray-300',
  rare: 'bg-blue-100 text-blue-800 border-blue-300',
  epic: 'bg-purple-100 text-purple-800 border-purple-300',
  legendary: 'bg-yellow-100 text-yellow-800 border-yellow-300'
};

interface BadgeSystemProps {
  userId?: string;
  compact?: boolean;
  showProgress?: boolean;
}

export const BadgeSystem: React.FC<BadgeSystemProps> = ({ 
  userId, 
  compact = false, 
  showProgress = true 
}) => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'earned' | 'available'>('earned');

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      loadBadgesAndStats();
    }
  }, [targetUserId, activeTab]);

  const loadBadgesAndStats = async () => {
    if (!targetUserId) return;

    try {
      setLoading(true);

      // Load user stats
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (statsError && statsError.code !== 'PGRST116') {
        throw statsError;
      }

      setUserStats(statsData);

      if (activeTab === 'earned') {
        // Load earned badges
        const { data: earnedData, error: earnedError } = await supabase
          .from('user_achievements')
          .select(`
            earned_at,
            progress,
            badges:badge_id (
              id,
              name,
              description,
              icon,
              category,
              points,
              rarity,
              condition_type,
              condition_value
            )
          `)
          .eq('user_id', targetUserId)
          .order('earned_at', { ascending: false });

        if (earnedError) throw earnedError;

        const formattedBadges = earnedData?.map(item => ({
          ...item.badges,
          earned_at: item.earned_at,
          progress: item.progress
        })) || [];

        setBadges(formattedBadges);
      } else {
        // Load available badges (not earned)
        const { data: allBadges, error: badgesError } = await supabase
          .from('badges')
          .select('*')
          .eq('is_active', true);

        if (badgesError) throw badgesError;

        const { data: earnedBadges, error: earnedError } = await supabase
          .from('user_achievements')
          .select('badge_id')
          .eq('user_id', targetUserId);

        if (earnedError) throw earnedError;

        const earnedBadgeIds = new Set(earnedBadges?.map(b => b.badge_id) || []);
        const availableBadges = allBadges?.filter(badge => 
          !earnedBadgeIds.has(badge.id)
        ) || [];

        setBadges(availableBadges);
      }

      // Check and award new badges
      if (targetUserId === user?.id) {
        await checkForNewBadges();
      }

    } catch (error) {
      console.error('Error loading badges:', error);
      toast.error('Error al cargar las insignias');
    } finally {
      setLoading(false);
    }
  };

  const checkForNewBadges = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase.rpc('check_and_award_badges', {
        user_id_param: user.id
      });

      if (error) {
        console.error('Error checking badges:', error);
      }
    } catch (error) {
      console.error('Error in badge check:', error);
    }
  };

  const calculateProgress = (badge: BadgeData) => {
    // This would need to be implemented based on current user stats
    // For now, return a placeholder
    return Math.min(100, (badge.progress || 0) / badge.condition_value * 100);
  };

  const getExperienceToNextLevel = () => {
    if (!userStats) return 0;
    return 100 - userStats.experience_points;
  };

  if (loading) {
    return (
      <Card className={compact ? '' : 'w-full'}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    const earnedBadges = badges.filter(b => b.earned_at);
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {earnedBadges.slice(0, 5).map((badge) => {
          const IconComponent = iconMap[badge.icon] || Award;
          return (
            <div
              key={badge.id}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${rarityColors[badge.rarity as keyof typeof rarityColors]}`}
              title={`${badge.name}: ${badge.description}`}
            >
              <IconComponent className="h-3 w-3" />
              <span className="hidden sm:inline">{badge.name}</span>
            </div>
          );
        })}
        {earnedBadges.length > 5 && (
          <Badge variant="outline" className="text-xs">
            +{earnedBadges.length - 5} más
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Sistema de Logros
          </CardTitle>
          
          {userStats && (
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Nivel {userStats.level}</div>
              <div className="text-lg font-bold text-primary">{userStats.total_points} pts</div>
            </div>
          )}
        </div>

        {showProgress && userStats && (
          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-sm">
              <span>Progreso al nivel {userStats.level + 1}</span>
              <span>{userStats.experience_points}/100 XP</span>
            </div>
            <Progress value={userStats.experience_points} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{userStats.badges_count} insignias obtenidas</span>
              <span>{getExperienceToNextLevel()} XP para siguiente nivel</span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'earned' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('earned')}
          >
            Obtenidas ({badges.filter(b => b.earned_at).length})
          </Button>
          <Button
            variant={activeTab === 'available' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('available')}
          >
            Disponibles
          </Button>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {badges.map((badge) => {
            const IconComponent = iconMap[badge.icon] || Award;
            const isEarned = !!badge.earned_at;
            
            return (
              <Card
                key={badge.id}
                className={`relative transition-all hover:scale-105 ${
                  isEarned 
                    ? 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20' 
                    : 'bg-muted/30 border-muted'
                }`}
              >
                <CardContent className="p-4 text-center">
                  {/* Badge Rarity Indicator */}
                  <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                    badge.rarity === 'legendary' ? 'bg-yellow-400' :
                    badge.rarity === 'epic' ? 'bg-purple-400' :
                    badge.rarity === 'rare' ? 'bg-blue-400' : 'bg-gray-400'
                  }`} />

                  {/* Icon */}
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    isEarned ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <IconComponent className={`h-6 w-6 ${
                      isEarned ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>

                  {/* Badge Info */}
                  <h4 className={`text-sm font-medium mb-1 ${
                    isEarned ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {badge.name}
                  </h4>
                  
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {badge.description}
                  </p>

                  {/* Points */}
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="font-medium">{badge.points} pts</span>
                  </div>

                  {/* Progress for available badges */}
                  {!isEarned && showProgress && (
                    <div className="mt-2">
                      <Progress 
                        value={calculateProgress(badge)} 
                        className="h-1" 
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        {badge.progress || 0}/{badge.condition_value}
                      </div>
                    </div>
                  )}

                  {/* Earned date */}
                  {isEarned && badge.earned_at && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Obtenida: {new Date(badge.earned_at).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {badges.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              {activeTab === 'earned' 
                ? 'Aún no has obtenido ninguna insignia'
                : 'No hay insignias disponibles por obtener'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BadgeSystem;