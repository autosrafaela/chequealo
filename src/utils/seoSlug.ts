/**
 * SEO Slug utilities for programmatic landing pages.
 * Format: "cerrajeros-en-rafaela" → { category: "cerrajeros", city: "rafaela" }
 */

export function parseCategorySlug(slug: string): { category: string; city: string } | null {
  const parts = slug.split('-en-');
  if (parts.length < 2) return null;
  
  const category = parts[0];
  const city = parts.slice(1).join('-en-'); // handle cities like "san-martin-en-mendoza" edge case
  
  if (!category || !city) return null;
  
  return { category, city };
}

export function buildCategorySlug(category: string, city: string): string {
  return `${slugify(category)}-en-${slugify(city)}`;
}

export function deslugify(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
