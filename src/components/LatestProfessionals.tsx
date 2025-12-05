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
        // SECURITY: Using professionals_with_contact view to show contact info
        // PRIORITY: Verified professionals appear first, then by creation date
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
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Profesionales Recientes
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Descubrí los profesionales que se sumaron recientemente a nuestra plataforma
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Profesionales Recientes
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubrí los profesionales que se sumaron recientemente a nuestra plataforma
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
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
            <Button size="lg" className="hover-scale">
              Ver Todos los Profesionales
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};