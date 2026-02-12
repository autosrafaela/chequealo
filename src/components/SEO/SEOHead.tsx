import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  noIndex?: boolean;
  structuredData?: object;
}

const BASE_URL = 'https://chequealo.net';
const DEFAULT_TITLE = 'Chequealo - Encontrá Profesionales de Confianza en Argentina';
const DEFAULT_DESCRIPTION = 'Plataforma líder para encontrar profesionales verificados en Argentina. Electricistas, plomeros, albañiles y más servicios de confianza con reseñas reales.';
const DEFAULT_IMAGE = `${BASE_URL}/images/default-professional-og.jpg`;

export const SEOHead = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  noIndex = false,
  structuredData,
}: SEOHeadProps) => {
  // Ensure canonical URL is absolute
  const canonicalUrl = canonical 
    ? (canonical.startsWith('http') ? canonical : `${BASE_URL}${canonical.startsWith('/') ? canonical : `/${canonical}`}`)
    : `${BASE_URL}${window.location.pathname}`;

  // Ensure image URL is absolute
  const imageUrl = ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`;

  // Truncate title if too long (max 60 chars for SEO)
  const truncatedTitle = title.length > 60 ? `${title.substring(0, 57)}...` : title;
  
  // Truncate description if too long (max 160 chars for SEO)
  const truncatedDescription = description.length > 160 ? `${description.substring(0, 157)}...` : description;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{truncatedTitle}</title>
      <meta name="description" content={truncatedDescription} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      
      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={truncatedTitle} />
      <meta property="og:description" content={truncatedDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content="Chequealo" />
      <meta property="og:locale" content="es_AR" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={truncatedTitle} />
      <meta name="twitter:description" content={truncatedDescription} />
      <meta name="twitter:image" content={imageUrl} />
      
      {/* Additional SEO Tags */}
      <meta name="author" content="Chequealo" />
      <meta name="geo.region" content="AR" />
      <meta name="geo.placename" content="Argentina" />
      <meta name="language" content="es" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

// Structured data generators
export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Chequealo",
  "url": BASE_URL,
  "logo": `${BASE_URL}/favicon.png`,
  "description": DEFAULT_DESCRIPTION,
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+54-9-3492-60-7224",
    "email": "info@chequealo.net",
    "contactType": "customer service",
    "areaServed": "AR",
    "availableLanguage": "Spanish"
  },
  "sameAs": [],
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "AR"
  }
});

export const generateWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Chequealo",
  "url": BASE_URL,
  "potentialAction": {
    "@type": "SearchAction",
    "target": `${BASE_URL}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string"
  }
});

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`
  }))
});

export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

export default SEOHead;
