import { useState, useEffect } from "react";
import { EnhancedProfessionalCard } from "@/components/EnhancedProfessionalCard";
import { ProfessionalCardSkeleton } from "@/components/ProfessionalCardSkeleton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";

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
        // Fetch verified professionals ordered by rating and review count
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

        // If we don't have enough verified professionals, fetch more
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

  if (loading) {
    return (
      <section className="py-8 sm:py-12 md:py-16 bg-background">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-4 flex items-center justify-center gap-2">
              <Star className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-500 fill-yellow-500" />
              Profesionales Destacados
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
              Los mejores profesionales verificados con mejor reputación
            </p>
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
    <section className="py-8 sm:py-12 md:py-16 bg-background">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-4 flex items-center justify-center gap-2">
            <Star className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-500 fill-yellow-500" />
            Profesionales Destacados
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            Los mejores profesionales verificados con mejor reputación
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-10 md:mb-12">
          {professionals.map((professional) => (
            <div key={professional.id} className="animate-fade-in">
              <EnhancedProfessionalCard
                professional={professional}
                compact={true}
              />
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/search">
            <Button size="default" className="hover-scale text-sm sm:text-base px-4 sm:px-6">
              Ver Todos los Profesionales
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};