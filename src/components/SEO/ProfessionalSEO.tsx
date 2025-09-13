import { useEffect } from 'react';

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

export const ProfessionalSEO = ({ professional }: ProfessionalSEOProps) => {
  useEffect(() => {
    if (!professional) return;

    // Update document title
    const title = `${professional.full_name} - ${professional.profession} en ${professional.location} | Chequealo`;
    document.title = title;

    // Update meta description
    const description = `${professional.description ? professional.description.substring(0, 140) : `Contactá a ${professional.full_name}, ${professional.profession} profesional${professional.is_verified ? ' verificado' : ''} en ${professional.location}. Rating: ${professional.rating}/5 con ${professional.review_count} opiniones.`}`;
    
    // Remove existing meta tags
    const existingDescription = document.querySelector('meta[name="description"]');
    const existingKeywords = document.querySelector('meta[name="keywords"]');
    const existingOgTitle = document.querySelector('meta[property="og:title"]');
    const existingOgDescription = document.querySelector('meta[property="og:description"]');
    const existingOgImage = document.querySelector('meta[property="og:image"]');
    const existingOgUrl = document.querySelector('meta[property="og:url"]');
    const existingCanonical = document.querySelector('link[rel="canonical"]');

    if (existingDescription) existingDescription.remove();
    if (existingKeywords) existingKeywords.remove();
    if (existingOgTitle) existingOgTitle.remove();
    if (existingOgDescription) existingOgDescription.remove();
    if (existingOgImage) existingOgImage.remove();
    if (existingOgUrl) existingOgUrl.remove();
    if (existingCanonical) existingCanonical.remove();

    // Add new meta tags
    const metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = description;
    document.head.appendChild(metaDescription);

    const metaKeywords = document.createElement('meta');
    metaKeywords.name = 'keywords';
    metaKeywords.content = `${professional.profession}, ${professional.location}, ${professional.full_name}, servicios, profesional, chequealo, argentina`;
    document.head.appendChild(metaKeywords);

    // Open Graph tags
    const ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.content = title;
    document.head.appendChild(ogTitle);

    const ogDescription = document.createElement('meta');
    ogDescription.setAttribute('property', 'og:description');
    ogDescription.content = description;
    document.head.appendChild(ogDescription);

    const ogUrl = document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    ogUrl.content = window.location.href;
    document.head.appendChild(ogUrl);

    if (professional.image_url) {
      const ogImage = document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      ogImage.content = professional.image_url;
      document.head.appendChild(ogImage);
    }

    // Canonical URL
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = window.location.href;
    document.head.appendChild(canonical);

    // Structured Data (JSON-LD)
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
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": professional.rating,
        "reviewCount": professional.review_count,
        "bestRating": 5,
        "worstRating": 1
      },
      "url": window.location.href,
      "sameAs": []
    };

    if (professional.image_url) {
      structuredData["image"] = professional.image_url;
    }

    if (professional.phone) {
      structuredData["telephone"] = professional.phone;
    }

    if (professional.email) {
      structuredData["email"] = professional.email;
    }

    // Remove existing structured data
    const existingStructuredData = document.querySelector('script[type="application/ld+json"]');
    if (existingStructuredData) {
      existingStructuredData.remove();
    }

    // Add structured data script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      // Reset to default title
      document.title = 'Chequealo - Encontrá Profesionales y Servicios en Argentina';
      
      // Remove added meta tags
      if (metaDescription.parentNode) metaDescription.remove();
      if (metaKeywords.parentNode) metaKeywords.remove();
      if (ogTitle.parentNode) ogTitle.remove();
      if (ogDescription.parentNode) ogDescription.remove();
      if (ogUrl.parentNode) ogUrl.remove();
      if (canonical.parentNode) canonical.remove();
      if (script.parentNode) script.remove();
    };
  }, [professional]);

  return null;
};