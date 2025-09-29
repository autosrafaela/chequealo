import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp, 
  Star, 
  Crown,
  Users,
  Briefcase
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface RankingEntry {
  id: string;
  user_id: string;
  professional_id?: string;
  name: string;
  avatar_url?: string;
  profession?: string;
  total_points: number;
  level: number;
  badges_count: number;
  ranking_position?: number;
  rating?: number;
  review_count?: number;
  score?: number;
  is_verified?: boolean;
}

interface RankingSystemProps {
  type?: 'users' | 'professionals' | 'both';
  limit?: number;
  showCurrentUser?: boolean;
}

export const RankingSystem: React.FC<RankingSystemProps> = ({ 
  type = 'both',
  limit = 10,
  showCurrentUser = true
}) => {
  const { user } = useAuth();
  const [userRankings, setUserRankings] = useState<RankingEntry[]>([]);
  const [professionalRankings, setProfessionalRankings] = useState<RankingEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<RankingEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'professionals'>('users');

  useEffect(() => {
    loadRankings();
  }, [limit]);

  const loadRankings = async () => {
    try {
      setLoading(true);

      // Load user rankings
      if (type === 'users' || type === 'both') {
        const { data: userStats, error: userStatsError } = await supabase
          .from('user_stats')
          .select(`
            user_id,
            total_points,
            level,
            badges_count
          `)
          .order('total_points', { ascending: false })
          .limit(limit);

        if (userStatsError) throw userStatsError;

        // Get profile data separately
        const userIds = userStats?.map(u => u.user_id) || [];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', userIds);

        const formattedUserRankings: RankingEntry[] = userStats?.map((entry, index) => {
          const profile = profiles?.find(p => p.user_id === entry.user_id);
          return {
            id: entry.user_id,
            user_id: entry.user_id,
            name: profile?.full_name || 'Usuario',
            avatar_url: profile?.avatar_url,
            total_points: entry.total_points,
            level: entry.level,
            badges_count: entry.badges_count,
            ranking_position: index + 1
          };
        }) || [];

        setUserRankings(formattedUserRankings);

        // Find current user's ranking
        if (user && showCurrentUser) {
          const currentUserEntry = formattedUserRankings.find(entry => entry.user_id === user.id);
          if (currentUserEntry) {
            setCurrentUserRank(currentUserEntry);
          } else {
            // Get current user's stats even if not in top rankings
            const { data: currentUserStats, error: currentUserError } = await supabase
              .from('user_stats')
              .select('user_id, total_points, level, badges_count')
              .eq('user_id', user.id)
              .maybeSingle();

            if (!currentUserError && currentUserStats) {
              const { data: userProfile } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('user_id', user.id)
                .maybeSingle();

              // Get user's actual ranking position
              const { count } = await supabase
                .from('user_stats')
                .select('user_id', { count: 'exact' })
                .gt('total_points', currentUserStats.total_points);

              setCurrentUserRank({
                id: currentUserStats.user_id,
                user_id: currentUserStats.user_id,
                name: userProfile?.full_name || 'Usuario',
                avatar_url: userProfile?.avatar_url,
                total_points: currentUserStats.total_points,
                level: currentUserStats.level,
                badges_count: currentUserStats.badges_count,
                ranking_position: (count || 0) + 1
              });
            }
          }
        }
      }

      // Load professional rankings
      if (type === 'professionals' || type === 'both') {
        const { data: professionalStats, error: professionalStatsError } = await supabase
          .from('professionals')
          .select(`
            id,
            user_id,
            full_name,
            profession,
            rating,
            review_count,
            is_verified
          `)
          .not('rating', 'is', null)
          .order('rating', { ascending: false })
          .order('review_count', { ascending: false })
          .limit(limit);

        if (professionalStatsError) throw professionalStatsError;

        // Get avatars separately
        const professionalUserIds = professionalStats?.map(p => p.user_id) || [];
        const { data: professionalProfiles } = await supabase
          .from('profiles')
          .select('user_id, avatar_url')
          .in('user_id', professionalUserIds);

        const formattedProfessionalRankings: RankingEntry[] = professionalStats?.map((entry, index) => {
          const profile = professionalProfiles?.find(p => p.user_id === entry.user_id);
          return {
            id: entry.id,
            user_id: entry.user_id,
            professional_id: entry.id,
            name: entry.full_name,
            avatar_url: profile?.avatar_url,
            profession: entry.profession,
            rating: entry.rating,
            review_count: entry.review_count,
            is_verified: entry.is_verified,
            total_points: 0,
            level: 0,
            badges_count: 0,
            ranking_position: index + 1,
            score: entry.rating * (1 + Math.log10(Math.max(1, entry.review_count)))
          };
        }) || [];

        setProfessionalRankings(formattedProfessionalRankings);
      }

    } catch (error) {
      console.error('Error loading rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="font-bold text-muted-foreground">#{position}</span>;
    }
  };

  const getRankBadgeColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const renderRankingEntry = (entry: RankingEntry, isProfessional = false) => (
    <div
      key={entry.id}
      className={`flex items-center gap-4 p-4 rounded-lg transition-colors hover:bg-muted/50 ${
        entry.user_id === user?.id ? 'bg-primary/5 ring-1 ring-primary/20' : ''
      }`}
    >
      {/* Ranking Position */}
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
        getRankBadgeColor(entry.ranking_position || 0)
      }`}>
        {entry.ranking_position && entry.ranking_position <= 3 
          ? getRankIcon(entry.ranking_position)
          : <span className="font-bold">#{entry.ranking_position}</span>
        }
      </div>

      {/* Avatar */}
      <Avatar className="h-12 w-12">
        <AvatarImage src={entry.avatar_url} />
        <AvatarFallback>
          {entry.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold truncate">
            {isProfessional ? (
              <Link to={`/professional/${entry.professional_id}`} className="hover:text-primary">
                {entry.name}
              </Link>
            ) : (
              entry.name
            )}
          </h3>
          
          {entry.is_verified && (
            <Badge variant="secondary" className="text-xs">
              Verificado
            </Badge>
          )}
        </div>
        
        {isProfessional ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Briefcase className="h-3 w-3" />
            <span>{entry.profession}</span>
            {entry.rating && (
              <>
                <Star className="h-3 w-3 text-yellow-500" />
                <span>{entry.rating.toFixed(1)} ({entry.review_count} reseñas)</span>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              <span>Nivel {entry.level}</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              <span>{entry.badges_count} insignias</span>
            </div>
          </div>
        )}
      </div>

      {/* Score */}
      <div className="text-right">
        <div className="font-bold text-lg text-primary">
          {isProfessional ? (
            entry.score?.toFixed(1)
          ) : (
            entry.total_points.toLocaleString()
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {isProfessional ? 'Score' : 'puntos'}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
                <div className="w-16 h-8 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Rankings
        </CardTitle>
      </CardHeader>

      <CardContent>
        {type === 'both' ? (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'users' | 'professionals')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Usuarios
              </TabsTrigger>
              <TabsTrigger value="professionals" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />  
                Profesionales
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-2 mt-6">
              {/* Current User Position */}
              {currentUserRank && currentUserRank.ranking_position && currentUserRank.ranking_position > limit && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Tu posición:</h4>
                  {renderRankingEntry(currentUserRank)}
                </div>
              )}

              {/* Top Rankings */}
              <div className="space-y-2">
                {userRankings.map(entry => renderRankingEntry(entry))}
              </div>
            </TabsContent>

            <TabsContent value="professionals" className="space-y-2 mt-6">
              {professionalRankings.map(entry => renderRankingEntry(entry, true))}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-2">
            {type === 'users' 
              ? userRankings.map(entry => renderRankingEntry(entry))
              : professionalRankings.map(entry => renderRankingEntry(entry, true))
            }
          </div>
        )}

        {((type === 'users' && userRankings.length === 0) || 
          (type === 'professionals' && professionalRankings.length === 0) ||
          (type === 'both' && userRankings.length === 0 && professionalRankings.length === 0)) && (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay datos de ranking disponibles</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RankingSystem;