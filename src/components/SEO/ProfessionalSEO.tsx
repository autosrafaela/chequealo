import { Helmet } from 'react-helmet-async';

interface ProfessionalSEOProps {
  professional: {
    id: string;
    full_name: string;
    profession: string;
    location: string;
    description: string;
    rating: number;
    review_count: number;
    image_url?: string;
    is_verified: boolean;
    phone?: string;
    email: string;
  };
}

const SUPABASE_PROJECT_ID = 'rolitmcxydholgsxpvwa';
const SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const DEFAULT_OG_IMAGE = 'https://chequealo.net/images/default-professional-og.jpg';
const BASE_URL = 'https://chequealo.net';

function resolveImageUrl(imageUrl?: string): string {
  if (!imageUrl || imageUrl.trim() === '') return DEFAULT_OG_IMAGE;

  if (imageUrl.includes('supabase.co')) return imageUrl;
  if (imageUrl.includes('/storage/v1/object/public/')) {
    return imageUrl.startsWith('/') ? `${SUPABASE_URL}${imageUrl}` : `${SUPABASE_URL}/${imageUrl}`;
  }
  if (imageUrl.startsWith('/storage/') || imageUrl.startsWith('storage/')) {
    return `${SUPABASE_URL}/storage/v1/object/public/${imageUrl.replace(/^\//, '')}`;
  }
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  if (imageUrl.startsWith('/')) return `${BASE_URL}${imageUrl}`;
  return `${BASE_URL}/${imageUrl}`;
}

export const ProfessionalSEO = ({ professional }: ProfessionalSEOProps) => {
  if (!professional) return null;

  const title = `${professional.full_name} - ${professional.profession} en ${professional.location} | Chequealo`;
  const truncatedTitle = title.length > 60 ? `${title.substring(0, 57)}...` : title;

  const description = professional.description
    ? professional.description.substring(0, 155)
    : `Contactá a ${professional.full_name}, ${professional.profession} profesional${professional.is_verified ? ' verificado' : ''} en ${professional.location}. Rating: ${professional.rating}/5 con ${professional.review_count} opiniones.`;

  const canonicalUrl = `${BASE_URL}/professional/${professional.id}`;
  const imageUrl = resolveImageUrl(professional.image_url);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": professional.full_name,
    "jobTitle": professional.profession,
    "description": professional.description || `${professional.profession} profesional en ${professional.location}`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": professional.location,
      "addressCountry": "AR"
    },
    "aggregateRating": professional.review_count > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": professional.rating,
      "reviewCount": professional.review_count,
      "bestRating": 5,
      "worstRating": 1
    } : undefined,
    "url": canonicalUrl,
    "image": imageUrl,
    ...(professional.phone && { "telephone": professional.phone }),
    ...(professional.email && { "email": professional.email }),
  };

  return (
    <Helmet>
      <title>{truncatedTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={`${professional.profession}, ${professional.location}, ${professional.full_name}, servicios, profesional, chequealo, argentina`} />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />

      {/* Open Graph */}
      <meta property="og:type" content="profile" />
      <meta property="og:title" content={truncatedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:secure_url" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="1200" />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:alt" content={`Foto de perfil de ${professional.full_name}, ${professional.profession} en ${professional.location}`} />
      <meta property="og:site_name" content="Chequealo" />
      <meta property="og:locale" content="es_AR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={truncatedTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={`Foto de ${professional.full_name}`} />
      <meta name="twitter:site" content="@chequealonet" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};
