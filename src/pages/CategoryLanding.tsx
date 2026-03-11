import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { parseCategorySlug, deslugify } from '@/utils/seoSlug';
import { SEOHead, generateFAQSchema } from '@/components/SEO/SEOHead';
import { MobileOptimizedHeader } from '@/components/MobileOptimizedHeader';
import ProfessionalCard from '@/components/ProfessionalCard';
import { Search, Star, Users, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const BASE_URL = 'https://chequealo.net';

const CategoryLanding = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const parsed = useMemo(() => 
    categorySlug ? parseCategorySlug(categorySlug) : null
  , [categorySlug]);

  const categoryLabel = parsed ? deslugify(parsed.category) : '';
  const cityLabel = parsed ? deslugify(parsed.city) : '';

  useEffect(() => {
    if (!parsed) {
      setLoading(false);
      return;
    }

    const fetch = async () => {
      setLoading(true);
      const categorySearch = parsed.category.replace(/-/g, ' ');
      const citySearch = parsed.city.replace(/-/g, ' ');

      const { data } = await supabase
        .from('professionals_public')
        .select('*')
        .eq('is_verified', true)
        .eq('is_blocked', false)
        .ilike('profession', `%${categorySearch}%`)
        .ilike('location', `%${citySearch}%`)
        .order('rating', { ascending: false })
        .limit(50);

      setProfessionals(data || []);
      setLoading(false);
    };

    fetch();
  }, [parsed]);

  const avgRating = useMemo(() => {
    if (!professionals.length) return 0;
    const sum = professionals.reduce((acc, p) => acc + (p.rating || 0), 0);
    return Math.round((sum / professionals.length) * 10) / 10;
  }, [professionals]);

  const totalReviews = useMemo(() => 
    professionals.reduce((acc, p) => acc + (p.review_count || 0), 0)
  , [professionals]);

  const isEmpty = !loading && professionals.length === 0;

  // Dynamic FAQ content
  const faqs = parsed ? [
    {
      question: `¿Cómo encuentro ${categoryLabel} confiables en ${cityLabel}?`,
      answer: `En Chequealo verificamos la identidad de cada profesional. ${professionals.length > 0 ? `Actualmente contamos con ${professionals.length} ${categoryLabel.toLowerCase()} verificados en ${cityLabel}` : `Estamos sumando ${categoryLabel.toLowerCase()} a nuestra plataforma en ${cityLabel}`}. Podés ver sus calificaciones, fotos de trabajos y contactarlos directamente.`
    },
    {
      question: `¿Cuánto cuesta contratar un ${categoryLabel.toLowerCase().replace(/s$/, '')} en ${cityLabel}?`,
      answer: `Los precios varían según el tipo de trabajo. En Chequealo podés solicitar presupuestos gratuitos a múltiples ${categoryLabel.toLowerCase()} en ${cityLabel} y comparar opciones antes de decidir.`
    },
    {
      question: `¿Los ${categoryLabel.toLowerCase()} en ${cityLabel} están verificados?`,
      answer: `Sí. Todos los profesionales que mostramos en esta página pasaron por nuestro proceso de verificación de identidad. ${avgRating > 0 ? `El rating promedio de los ${categoryLabel.toLowerCase()} en ${cityLabel} es de ${avgRating}/5 basado en ${totalReviews} reseñas reales.` : ''}`
    },
  ] : [];

  // Structured data
  const structuredData = !isEmpty && parsed ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${categoryLabel} en ${cityLabel}`,
    "description": `Los mejores ${categoryLabel.toLowerCase()} verificados en ${cityLabel}`,
    "numberOfItems": professionals.length,
    "itemListElement": professionals.slice(0, 10).map((p, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "LocalBusiness",
        "name": p.full_name,
        "description": p.description || `${p.profession} en ${p.location}`,
        "url": `${BASE_URL}/professional/${p.id}`,
        ...(p.rating ? {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": p.rating,
            "reviewCount": p.review_count || 1,
            "bestRating": 5
          }
        } : {}),
        "address": {
          "@type": "PostalAddress",
          "addressLocality": cityLabel,
          "addressCountry": "AR"
        }
      }
    }))
  } : undefined;

  const combinedStructuredData = !isEmpty && parsed ? [
    structuredData,
    generateFAQSchema(faqs)
  ] : undefined;

  const seoTitle = parsed
    ? `${categoryLabel} en ${cityLabel} | Chequealo.net - Contacto directo`
    : 'Profesionales Verificados | Chequealo.net';

  const seoDescription = parsed
    ? `Encontrá los mejores ${categoryLabel.toLowerCase()} en ${cityLabel}. ${professionals.length} profesionales verificados${avgRating > 0 ? `, rating promedio ${avgRating}/5` : ''}. Presupuestos gratis en Chequealo.`
    : 'Encontrá profesionales verificados en Argentina.';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonical={`/profesionales/${categorySlug}`}
        noIndex={isEmpty}
        structuredData={combinedStructuredData ? { "@context": "wrapper", graphs: combinedStructuredData } : undefined}
      />

      <MobileOptimizedHeader />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1 flex-wrap">
            <li><Link to="/" className="hover:text-primary transition-colors">Inicio</Link></li>
            <li>/</li>
            <li><Link to="/search" className="hover:text-primary transition-colors">Profesionales</Link></li>
            {parsed && (
              <>
                <li>/</li>
                <li className="text-foreground font-medium">{categoryLabel} en {cityLabel}</li>
              </>
            )}
          </ol>
        </nav>

        {/* Hero H1 */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {parsed ? `Los mejores ${categoryLabel} en ${cityLabel}` : 'Categoría no encontrada'}
          </h1>
          {!loading && !isEmpty && (
            <p className="text-lg text-muted-foreground">
              Encontramos <strong className="text-foreground">{professionals.length}</strong> {categoryLabel.toLowerCase()} verificados en {cityLabel}
            </p>
          )}
        </div>

        {/* Stats cards */}
        {!loading && !isEmpty && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold text-foreground">{professionals.length}</p>
              <p className="text-xs text-muted-foreground">Profesionales</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Star className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
              <p className="text-2xl font-bold text-foreground">{avgRating || '—'}</p>
              <p className="text-xs text-muted-foreground">Rating promedio</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <MapPin className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold text-foreground">{cityLabel}</p>
              <p className="text-xs text-muted-foreground">Zona</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Star className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold text-foreground">{totalReviews}</p>
              <p className="text-xs text-muted-foreground">Reseñas totales</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div className="text-center py-16">
            <Search className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No encontramos {categoryLabel.toLowerCase()} en {cityLabel}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Todavía no tenemos profesionales verificados en esta categoría y zona. Probá ampliando tu búsqueda.
            </p>
            <Button asChild>
              <Link to="/search">
                Buscar en todas las zonas <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}

        {/* Professional cards */}
        {!loading && !isEmpty && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {professionals.map((p) => (
              <ProfessionalCard
                key={p.id}
                id={p.id}
                name={p.full_name}
                profession={p.profession}
                location={p.location || ''}
                rating={p.rating || 0}
                reviewCount={p.review_count || 0}
                description={p.description || ''}
                verified={p.is_verified}
                availability={p.availability || 'available'}
                image={p.image_url}
              />
            ))}
          </div>
        )}

        {/* FAQ Section */}
        {!isEmpty && faqs.length > 0 && (
          <section className="mt-12 mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Preguntas frecuentes sobre {categoryLabel.toLowerCase()} en {cityLabel}
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="bg-card border border-border rounded-xl p-4 group">
                  <summary className="font-medium text-foreground cursor-pointer list-none flex items-center justify-between">
                    {faq.question}
                    <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        {!isEmpty && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">
              ¿Sos {categoryLabel.toLowerCase().replace(/s$/, '')} en {cityLabel}?
            </h2>
            <p className="text-muted-foreground mb-4">
              Registrate gratis en Chequealo y empezá a recibir clientes verificados.
            </p>
            <Button asChild size="lg">
              <Link to="/register">Registrarme como profesional</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default CategoryLanding;
