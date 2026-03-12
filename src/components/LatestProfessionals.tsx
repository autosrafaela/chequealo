import { useState, useEffect, useMemo } from "react";
import { EnhancedProfessionalCard } from "@/components/EnhancedProfessionalCard";
import { ProfessionalCardSkeleton } from "@/components/ProfessionalCardSkeleton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useVipStatus } from "@/hooks/useVipStatus";

interface Professional {
  id: string;
  full_name: string;
  profession: string;
  location: string;
  rating: number;
  review_count: number;
  description: string;
  is_verified: boolean;
  availability: string;
  image_url?: string;
}

export const LatestProfessionals = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProfessionals = async () => {
      try {
        const { data, error } = await supabase
          .from('professionals_with_contact')
          .select('*')
          .eq('is_verified', true)
          .order('rating', { ascending: false, nullsFirst: false })
          .order('review_count', { ascending: false, nullsFirst: false })
          .limit(8);

        if (error) {
          console.error('Error fetching professionals:', error);
          return;
        }

        if (!data || data.length < 8) {
          const { data: moreData } = await supabase
            .from('professionals_with_contact')
            .select('*')
            .order('rating', { ascending: false, nullsFirst: false })
            .order('review_count', { ascending: false, nullsFirst: false })
            .limit(8);
          
          setProfessionals(moreData || data || []);
        } else {
          setProfessionals(data);
        }
      } catch (error) {
        console.error('Error fetching professionals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProfessionals();
  }, []);

  const professionalIds = useMemo(() => professionals.map(p => p.id), [professionals]);
  const { data: vipMap } = useVipStatus(professionalIds);

  if (loading) {
    return (
      <section className="py-10 sm:py-14 md:py-20 bg-background">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-display text-foreground" style={{ fontSize: 'clamp(1.5rem, 3vw + 0.5rem, 2.5rem)' }}>
              <Star className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-500 fill-yellow-500 inline-block mr-2 align-middle" />
              Profesionales Destacados
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[...Array(8)].map((_, index) => (
              <ProfessionalCardSkeleton key={index} compact />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (professionals.length === 0) {
    return null;
  }

  return (
    <section className="py-10 sm:py-14 md:py-20 bg-background">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-display text-gradient-brand mb-2 sm:mb-3" style={{ fontSize: 'clamp(1.5rem, 3vw + 0.5rem, 2.5rem)', letterSpacing: '-0.03em' }}>
            <Star className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-500 fill-yellow-500 inline-block mr-2 align-middle" />
            Profesionales Destacados
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Los mejores profesionales verificados con mejor reputación
          </p>
        </div>
        
        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 mb-10 sm:mb-12" 
             style={{ gridAutoRows: 'minmax(0, auto)' }}>
          {professionals.map((professional, index) => {
            const isFeatured = index < 2;
            return (
              <div 
                key={professional.id} 
                className={`animate-fade-in ${isFeatured ? 'sm:col-span-2 sm:row-span-2' : ''}`}
              >
                <EnhancedProfessionalCard
                  professional={professional}
                  compact={!isFeatured}
                  featured={isFeatured}
                  isVip={vipMap?.get(professional.id) || false}
                />
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Link to="/search">
            <Button size="lg" className="text-sm sm:text-base px-6 sm:px-8 rounded-xl">
              Ver Todos los Profesionales
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
