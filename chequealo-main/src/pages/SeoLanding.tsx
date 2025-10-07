import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// SEO-optimized landing page for professionals with clean URLs
const SeoLanding = () => {
  const params = useParams<{ profession?: string; location?: string; name?: string }>();
  const [professional, setProfessional] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProfessional = async () => {
      const { profession, location, name } = params;
      
      if (!profession || !location || !name) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        // Convert URL params back to searchable format
        const decodedProfession = decodeURIComponent(profession.replace(/-/g, ' '));
        const decodedLocation = decodeURIComponent(location.replace(/-/g, ' '));
        const decodedName = decodeURIComponent(name.replace(/-/g, ' '));

        const { data, error } = await supabase
          .from('professionals_public')
          .select('*')
          .ilike('profession', `%${decodedProfession}%`)
          .ilike('location', `%${decodedLocation}%`)
          .ilike('full_name', `%${decodedName}%`)
          .eq('is_verified', true)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setProfessional(data);
          updateSEOTags(data, decodedProfession, decodedLocation);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error fetching professional:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessional();
  }, [params]);

  const updateSEOTags = (prof: any, professionText: string, locationText: string) => {
    const title = `${prof.full_name} - ${professionText} en ${locationText} | Chequealo`;
    const description = `Contactá a ${prof.full_name}, ${professionText} profesional${prof.is_verified ? ' verificado' : ''} en ${locationText}. Rating: ${prof.rating}/5 con ${prof.review_count} opiniones. ✅ Presupuestos gratuitos.`;
    
    document.title = title;
    
    // Update existing meta tags or create new ones
    let metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Structured Data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": prof.full_name,
      "description": prof.description || `${professionText} profesional en ${locationText}`,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": locationText,
        "addressCountry": "Argentina"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": prof.rating || 0,
        "reviewCount": prof.review_count || 0,
        "bestRating": 5,
        "worstRating": 1
      },
      "priceRange": "$$",
      "url": window.location.href,
      "serviceType": professionText,
      "areaServed": locationText
    };

    if (prof.image_url) {
      structuredData["image"] = prof.image_url;
    }

    let existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (notFound || !professional) {
    return <Navigate to="/search" replace />;
  }

  // Redirect to the standard professional profile page
  return <Navigate to={`/professional/${professional.id}`} replace />;
};

export default SeoLanding;