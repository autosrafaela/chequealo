/**
 * Genera un slug SEO-friendly automático para profesionales sin slug personalizado.
 * Formato: "profesion-nombre-ciudad"
 * Ejemplo: "fletes-juan-perez-rosario"
 */
export function generateAutoSlug(profession: string, fullName: string, location?: string | null): string {
  const parts = [profession, fullName];
  if (location) parts.push(location);
  
  return parts
    .join('-')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/[^a-z0-9]+/g, '-')    // solo alfanuméricos y guiones
    .replace(/^-|-$/g, '')           // sin guiones al inicio/final
    .substring(0, 80);
}
