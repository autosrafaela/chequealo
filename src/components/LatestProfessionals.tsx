import { useState, useEffect } from "react";
import { EnhancedProfessionalCard } from "@/components/EnhancedProfessionalCard";
import { ProfessionalCardSkeleton } from "@/components/ProfessionalCardSkeleton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";
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
    const fetchLatestProfessionals = async () => {
      try {
        const { data, error } = await supabase
          .from('professionals_with_contact')
          .select('*')
          .order('is_verified', { ascending: false })
          .order('rating', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })
          .limit(12);

        if (error) {
          console.error('Error fetching professionals:', error);
          return;
        }

        setProfessionals(data || []);
      } catch (error) {
        console.error('Error fetching professionals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProfessionals();
  }, []);

  if (loading) {
    return (
      <section className="py-8 sm:py-12 md:py-16 bg-background">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-4">
              Profesionales Recientes
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
              Descubrí los profesionales que se sumaron recientemente
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
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-4">
            Profesionales Recientes
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            Descubrí los profesionales que se sumaron recientemente
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