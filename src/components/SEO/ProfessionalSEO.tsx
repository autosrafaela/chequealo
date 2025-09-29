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
    const existingOgType = document.querySelector('meta[property="og:type"]');
    const existingOgTitle = document.querySelector('meta[property="og:title"]');
    const existingOgDescription = document.querySelector('meta[property="og:description"]');
    const existingOgImage = document.querySelector('meta[property="og:image"]');
    const existingOgImageWidth = document.querySelector('meta[property="og:image:width"]');
    const existingOgImageHeight = document.querySelector('meta[property="og:image:height"]');
    const existingOgImageType = document.querySelector('meta[property="og:image:type"]');
    const existingOgUrl = document.querySelector('meta[property="og:url"]');
    const existingCanonical = document.querySelector('link[rel="canonical"]');

    if (existingDescription) existingDescription.remove();
    if (existingKeywords) existingKeywords.remove();
    if (existingOgType) existingOgType.remove();
    if (existingOgTitle) existingOgTitle.remove();
    if (existingOgDescription) existingOgDescription.remove();
    if (existingOgImage) existingOgImage.remove();
    if (existingOgImageWidth) existingOgImageWidth.remove();
    if (existingOgImageHeight) existingOgImageHeight.remove();
    if (existingOgImageType) existingOgImageType.remove();
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
    const ogType = document.createElement('meta');
    ogType.setAttribute('property', 'og:type');
    ogType.content = 'profile';
    document.head.appendChild(ogType);

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
      // Ensure we have an absolute URL for the image
      const imageUrl = professional.image_url.startsWith('http') 
        ? professional.image_url 
        : `${window.location.origin}${professional.image_url}`;
      ogImage.content = imageUrl;
      document.head.appendChild(ogImage);

      // Add image dimensions for better Facebook display
      const ogImageWidth = document.createElement('meta');
      ogImageWidth.setAttribute('property', 'og:image:width');
      ogImageWidth.content = '1200';
      document.head.appendChild(ogImageWidth);

      const ogImageHeight = document.createElement('meta');
      ogImageHeight.setAttribute('property', 'og:image:height');
      ogImageHeight.content = '630';
      document.head.appendChild(ogImageHeight);

      const ogImageType = document.createElement('meta');
      ogImageType.setAttribute('property', 'og:image:type');
      ogImageType.content = 'image/jpeg';
      document.head.appendChild(ogImageType);
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
      if (ogType.parentNode) ogType.remove();
      if (ogTitle.parentNode) ogTitle.remove();
      if (ogDescription.parentNode) ogDescription.remove();
      if (ogUrl.parentNode) ogUrl.remove();
      if (canonical.parentNode) canonical.remove();
      if (script.parentNode) script.remove();

      // Remove image meta tags if they exist
      const imageMetaTags = document.querySelectorAll('meta[property^="og:image"]');
      imageMetaTags.forEach(tag => {
        if (tag.parentNode) tag.remove();
      });
    };
  }, [professional]);

  return null;
};