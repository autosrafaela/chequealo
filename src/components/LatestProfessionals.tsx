import { useState, useEffect } from "react";
import { EnhancedProfessionalCard } from "@/components/EnhancedProfessionalCard";
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
          .from('professionals_public')
          .select('*')
          .eq('is_blocked', false)
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
              <div key={index} className="animate-pulse">
                <div className="bg-card rounded-lg p-6 space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full mx-auto"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mx-auto"></div>
                  <div className="h-3 bg-muted rounded w-2/3 mx-auto"></div>
                </div>
              </div>
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