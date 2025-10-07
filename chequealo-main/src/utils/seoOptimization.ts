// SEO optimization utilities

export const generateMetaTitle = (serviceName?: string, location?: string, professionalName?: string): string => {
  if (professionalName && serviceName && location) {
    return `${professionalName} - ${serviceName} en ${location} | Chequealo`;
  }
  
  if (serviceName && location) {
    return `${serviceName} en ${location} - Encuentra Profesionales | Chequealo`;
  }
  
  if (serviceName) {
    return `${serviceName} - Profesionales Verificados | Chequealo`;
  }
  
  return 'Chequealo - Encuentra Profesionales de Confianza en Argentina';
};

export const generateMetaDescription = (serviceName?: string, location?: string, professionalName?: string): string => {
  if (professionalName && serviceName && location) {
    return `Contactá a ${professionalName}, ${serviceName} verificado en ${location}. Revisá calificaciones, fotos de trabajos y solicitá presupuestos gratis en Chequealo.`;
  }
  
  if (serviceName && location) {
    return `Encontrá los mejores ${serviceName} en ${location}. Profesionales verificados, con reseñas reales y presupuestos gratuitos en Chequealo.`;
  }
  
  if (serviceName) {
    return `Buscá ${serviceName} profesionales verificados. Comparó precios, leé reseñas y contactá directamente en Chequealo.`;
  }
  
  return 'Plataforma líder para encontrar profesionales verificados en Argentina. Electricistas, plomeros, albañiles y más servicios de confianza.';
};

export const generateStructuredData = (professional?: any, service?: string, location?: string) => {
  if (professional) {
    return {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": professional.full_name,
      "description": professional.description || `${professional.profession} profesional`,
      "url": `${window.location.origin}/professional/${professional.id}`,
      "telephone": professional.phone,
      "email": professional.email,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": professional.location,
        "addressCountry": "AR"
      },
      "priceRange": "$$",
      "aggregateRating": professional.average_rating ? {
        "@type": "AggregateRating",
        "ratingValue": professional.average_rating,
        "reviewCount": professional.review_count || 1
      } : undefined,
      "areaServed": {
        "@type": "Place",
        "name": professional.location
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Servicios",
        "itemListElement": [{
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": professional.profession
          }
        }]
      }
    };
  }
  
  // Generic service structured data
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Chequealo",
    "url": window.location.origin,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${window.location.origin}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    },
    "provider": {
      "@type": "Organization",
      "name": "Chequealo",
      "url": window.location.origin
    }
  };
};

export const cleanUrlSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove multiple consecutive hyphens
    .trim();
};