import { useState, useEffect } from "react";
import { Star, Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface TopProfessional {
  id: string;
  full_name: string;
  profession: string;
  rating: number;
  review_count: number;
  image_url?: string;
}

export const SimplifiedRankings = () => {
  const [topProfessionals, setTopProfessionals] = useState<TopProfessional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopProfessionals = async () => {
      try {
        const { data, error } = await supabase
          .from('professionals_with_contact')
          .select('id, full_name, profession, rating, review_count, image_url')
          .eq('is_verified', true)
          .gt('rating', 0)
          .order('rating', { ascending: false })
          .order('review_count', { ascending: false })
          .limit(3);

        if (error) throw error;
        setTopProfessionals(data || []);
      } catch (error) {
        console.error('Error fetching top professionals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProfessionals();
  }, []);

  const getBadgeColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-yellow-500 text-white';
      case 1:
        return 'bg-gray-400 text-white';
      case 2:
        return 'bg-amber-600 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <section className="py-8 sm:py-12 bg-muted/30">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-6">
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-72 h-24 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (topProfessionals.length === 0) {
    return null;
  }

  return (
    <section className="py-8 sm:py-12 bg-muted/30">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Profesionales del Mes
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {topProfessionals.map((professional, index) => (
            <Link
              key={professional.id}
              to={`/professional/${professional.id}`}
              className="flex items-center gap-4 bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] border hover:border-primary/20 w-full sm:w-auto sm:min-w-[280px] max-w-[340px]"
            >
              {/* Position badge */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${getBadgeColor(index)}`}>
                #{index + 1}
              </div>

              {/* Avatar */}
              <Avatar className="w-12 h-12 shrink-0">
                <AvatarImage src={professional.image_url || ''} alt={professional.full_name} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {professional.full_name?.charAt(0) || 'P'}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm sm:text-base truncate">
                  {professional.full_name}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {professional.profession}
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 shrink-0">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-foreground text-sm">
                  {professional.rating?.toFixed(1) || 'N/A'}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({professional.review_count || 0})
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
