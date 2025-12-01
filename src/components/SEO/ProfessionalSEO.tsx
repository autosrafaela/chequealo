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
    const existingOgImageSecure = document.querySelector('meta[property="og:image:secure_url"]');
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
    if (existingOgImageSecure) existingOgImageSecure.remove();
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

    const ogSiteName = document.createElement('meta');
    ogSiteName.setAttribute('property', 'og:site_name');
    ogSiteName.content = 'Chequealo';
    document.head.appendChild(ogSiteName);

    const ogLocale = document.createElement('meta');
    ogLocale.setAttribute('property', 'og:locale');
    ogLocale.content = 'es_AR';
    document.head.appendChild(ogLocale);

    // Twitter Card tags
    const twitterCard = document.createElement('meta');
    twitterCard.setAttribute('name', 'twitter:card');
    twitterCard.content = 'summary_large_image';
    document.head.appendChild(twitterCard);

    const twitterTitle = document.createElement('meta');
    twitterTitle.setAttribute('name', 'twitter:title');
    twitterTitle.content = title;
    document.head.appendChild(twitterTitle);

    const twitterDescription = document.createElement('meta');
    twitterDescription.setAttribute('name', 'twitter:description');
    twitterDescription.content = description;
    document.head.appendChild(twitterDescription);

    const twitterSite = document.createElement('meta');
    twitterSite.setAttribute('name', 'twitter:site');
    twitterSite.content = '@chequealoar';
    document.head.appendChild(twitterSite);

    const twitterCreator = document.createElement('meta');
    twitterCreator.setAttribute('name', 'twitter:creator');
    twitterCreator.content = '@chequealoar';
    document.head.appendChild(twitterCreator);

    // Handle image URL - ensure it's absolute
    let imageUrl = professional.image_url;
    
    if (imageUrl) {
      console.log('Original image URL:', imageUrl);
      
      // Handle Supabase Storage URLs
      // Format: https://PROJECT.supabase.co/storage/v1/object/public/BUCKET/PATH
      if (imageUrl.includes('/storage/v1/object/public/')) {
        // If it already has the full Supabase URL, use it as is
        if (imageUrl.startsWith('https://rolitmcxydholgsxpvwa.supabase.co')) {
          // Already correct format
        }
        // If it's a relative path from Supabase Storage
        else if (imageUrl.startsWith('/storage/v1/object/public/')) {
          imageUrl = `https://rolitmcxydholgsxpvwa.supabase.co${imageUrl}`;
        }
        // If it starts with storage/v1/object/public/ without leading slash
        else if (imageUrl.startsWith('storage/v1/object/public/')) {
          imageUrl = `https://rolitmcxydholgsxpvwa.supabase.co/${imageUrl}`;
        }
      }
      // Legacy format: /storage/ or storage/
      else if (imageUrl.startsWith('/storage/') || imageUrl.startsWith('storage/')) {
        // Assume it's in the default bucket and convert to full URL
        const cleanPath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
        imageUrl = `https://rolitmcxydholgsxpvwa.supabase.co/storage/v1/object/public/${cleanPath}`;
      }
      // If it's already a full URL (http or https), use it as is
      else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        // Already absolute URL
      }
      // Otherwise, assume it's a relative path to our domain
      else {
        imageUrl = `https://www.chequealo.ar${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }

      console.log('Final image URL for og:image:', imageUrl);
      
      const ogImage = document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      ogImage.content = imageUrl;
      document.head.appendChild(ogImage);

      // Add secure URL variant for Facebook
      const ogImageSecure = document.createElement('meta');
      ogImageSecure.setAttribute('property', 'og:image:secure_url');
      ogImageSecure.content = imageUrl;
      document.head.appendChild(ogImageSecure);

      // Add image dimensions for better Facebook display
      const ogImageWidth = document.createElement('meta');
      ogImageWidth.setAttribute('property', 'og:image:width');
      ogImageWidth.content = '800';
      document.head.appendChild(ogImageWidth);

      const ogImageHeight = document.createElement('meta');
      ogImageHeight.setAttribute('property', 'og:image:height');
      ogImageHeight.content = '800';
      document.head.appendChild(ogImageHeight);

      const ogImageType = document.createElement('meta');
      ogImageType.setAttribute('property', 'og:image:type');
      ogImageType.content = 'image/jpeg';
      document.head.appendChild(ogImageType);

      // Twitter image
      const twitterImage = document.createElement('meta');
      twitterImage.setAttribute('name', 'twitter:image');
      twitterImage.content = imageUrl;
      document.head.appendChild(twitterImage);

      const twitterImageAlt = document.createElement('meta');
      twitterImageAlt.setAttribute('name', 'twitter:image:alt');
      twitterImageAlt.content = `Foto de ${professional.full_name}`;
      document.head.appendChild(twitterImageAlt);
    } else {
      console.log('No image URL available for this professional');
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

    if (imageUrl) {
      structuredData["image"] = imageUrl;
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
      if (canonical.parentNode) canonical.remove();
      if (script.parentNode) script.remove();

      // Remove all dynamic Open Graph and Twitter meta tags
      const ogMetaTags = document.querySelectorAll('meta[property^="og:"]');
      ogMetaTags.forEach(tag => {
        if (tag.parentNode) tag.remove();
      });

      const twitterMetaTags = document.querySelectorAll('meta[name^="twitter:"]');
      twitterMetaTags.forEach(tag => {
        if (tag.parentNode) tag.remove();
      });

      const whatsappMetaTags = document.querySelectorAll('meta[property^="og:image"], meta[property^="og:title"], meta[property^="og:description"]');
      whatsappMetaTags.forEach(tag => {
        if (tag.parentNode) tag.remove();
      });
    };
  }, [professional]);

  return null;
};