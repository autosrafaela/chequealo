import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Award, Star, Clock, MessageCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RankingEntry {
  id: string;
  professional_id: string;
  location: string;
  profession: string;
  rank_position: number;
  score: number;
  reviews_score: number;
  response_score: number;
  punctuality_score: number;
  new_reviews_count: number;
  avg_response_minutes: number | null;
  week_start: string;
  week_end: string;
  professionals?: {
    full_name: string;
    image_url: string | null;
    rating: number;
  };
}

interface WeeklyRankingsProps {
  filterLocation?: string;
  filterProfession?: string;
  showFilters?: boolean;
  maxItems?: number;
}

export const WeeklyRankings = ({ 
  filterLocation, 
  filterProfession, 
  showFilters = true,
  maxItems = 5 
}: WeeklyRankingsProps) => {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<string[]>([]);
  const [professions, setProfessions] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>(filterLocation || 'all');
  const [selectedProfession, setSelectedProfession] = useState<string>(filterProfession || 'all');

  useEffect(() => {
    loadRankings();
    if (showFilters) {
      loadFilters();
    }
  }, [selectedLocation, selectedProfession]);

  const loadFilters = async () => {
    // Get unique locations and professions from rankings
    const { data } = await supabase
      .from('weekly_rankings')
      .select('location, profession');

    if (data) {
      const uniqueLocations = [...new Set(data.map(r => r.location))].sort();
      const uniqueProfessions = [...new Set(data.map(r => r.profession))].sort();
      setLocations(uniqueLocations);
      setProfessions(uniqueProfessions);
    }
  };

  const loadRankings = async () => {
    setLoading(true);
    try {
      // Get current week's start date
      const now = new Date();
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() + mondayOffset);
      const weekStartStr = weekStart.toISOString().split('T')[0];

      let query = supabase
        .from('weekly_rankings')
        .select(`
          *,
          professionals (
            full_name,
            image_url,
            rating
          )
        `)
        .eq('week_start', weekStartStr)
        .order('rank_position', { ascending: true })
        .limit(maxItems);

      if (selectedLocation && selectedLocation !== 'all') {
        query = query.eq('location', selectedLocation);
      }
      if (selectedProfession && selectedProfession !== 'all') {
        query = query.eq('profession', selectedProfession);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRankings(data || []);
    } catch (error) {
      console.error('Error loading rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{position}</span>;
    }
  };

  const formatResponseTime = (minutes: number | null) => {
    if (minutes === null) return 'N/A';
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top del Barrio
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ranking semanal basado en reseñas, tiempo de respuesta y puntualidad
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {showFilters && (
          <div className="flex flex-wrap gap-3">
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ubicación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las zonas</SelectItem>
                {locations.map(loc => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedProfession} onValueChange={setSelectedProfession}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Profesión" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las profesiones</SelectItem>
                {professions.map(prof => (
                  <SelectItem key={prof} value={prof}>{prof}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {rankings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No hay rankings disponibles para esta semana</p>
            <p className="text-xs mt-1">Los rankings se calculan semanalmente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rankings.map((entry) => (
              <Link
                key={entry.id}
                to={`/professional/${entry.professional_id}`}
                className="block"
              >
                <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-accent ${
                  entry.rank_position === 1 ? 'bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800' : 
                  entry.rank_position === 2 ? 'bg-gray-50 dark:bg-gray-900/50' :
                  entry.rank_position === 3 ? 'bg-amber-50 dark:bg-amber-950/20' : ''
                }`}>
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(entry.rank_position)}
                  </div>
                  
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={entry.professionals?.image_url || ''} />
                    <AvatarFallback>
                      {entry.professionals?.full_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {entry.professionals?.full_name || 'Profesional'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        {entry.profession}
                      </Badge>
                      <span>{entry.location}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">
                        {entry.professionals?.rating?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <MessageCircle className="h-3 w-3" />
                        {entry.new_reviews_count}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-3 w-3" />
                        {formatResponseTime(entry.avg_response_minutes)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      {Math.round(entry.score)}
                    </p>
                    <p className="text-xs text-muted-foreground">pts</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground pt-2">
          Actualizado semanalmente • Lunes a Domingo
        </p>
      </CardContent>
    </Card>
  );
};
