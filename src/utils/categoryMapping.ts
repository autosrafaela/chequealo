/**
 * Mapping dictionaries for SEO programmatic landing pages.
 * Maps URL slugs to exact database profession/location values.
 */

export interface CategoryEntry {
  label: string;
  dbValues: string[];
}

export interface CityEntry {
  label: string;
  dbPattern: string;
}

/**
 * Maps URL-safe slugs to exact profession strings in the DB.
 * Each slug can map to multiple DB values to catch variants.
 */
export const CATEGORY_MAP: Record<string, CategoryEntry> = {
  'cerrajeros': { label: 'Cerrajeros', dbValues: ['Cerrajero'] },
  'electricistas': { label: 'Electricistas', dbValues: ['Electricista', 'Electricidad del Automotor'] },
  'plomeros': { label: 'Plomeros', dbValues: ['Plomero', 'Plomería', 'Plomero y Gasista', 'Plomería y Gas', 'Sanitarios y Plomería'] },
  'gasistas': { label: 'Gasistas', dbValues: ['Gasista', 'Plomero y Gasista', 'Plomería y Gas'] },
  'albaniles': { label: 'Albañiles', dbValues: ['Albañil', 'Albañil y Pintor'] },
  'pintores': { label: 'Pintores', dbValues: ['Pintor', 'Albañil y Pintor'] },
  'carpinteros': { label: 'Carpinteros', dbValues: ['Carpintero', 'Carpintero / Ebanista'] },
  'herreros': { label: 'Herreros', dbValues: ['Herrero'] },
  'mecanicos': { label: 'Mecánicos', dbValues: ['Mecánico', 'Mecánica Ligera', 'Repuestos y Mecánica'] },
  'aire-acondicionado': { label: 'Aire Acondicionado', dbValues: ['Aire Acondicionado', 'Técnico en Refrigeración'] },
  'fumigaciones': { label: 'Fumigaciones', dbValues: ['Fumigaciones'] },
  'gomerias': { label: 'Gomerías', dbValues: ['Gomería', 'Gomería a Domicilio'] },
  'fletes': { label: 'Fletes y Mudanzas', dbValues: ['Fletes', 'Fletero / Mudanzas', 'Fletes y Remolques'] },
  'jardineros': { label: 'Jardineros', dbValues: ['Jardinería', 'Jardinero / Paisajista'] },
  'peluqueria': { label: 'Peluquería', dbValues: ['Peluquería', 'Barbería'] },
  'veterinarios': { label: 'Veterinarios', dbValues: ['Veterinario', 'Veterinaria y Peluquería', 'Peluquería Canina'] },
  'limpieza': { label: 'Limpieza', dbValues: ['Limpieza de Tapizados', 'Limpieza y Mantenimiento'] },
  'tecnicos-pc': { label: 'Técnicos de PC', dbValues: ['Técnico de PC', 'Servicio Técnico PC/Celulares'] },
  'fotografos': { label: 'Fotógrafos', dbValues: ['Fotógrafo'] },
  'abogados': { label: 'Abogados', dbValues: ['Abogado'] },
  'contadores': { label: 'Contadores', dbValues: ['Contador'] },
  'arquitectos': { label: 'Arquitectos', dbValues: ['Arquitecto', 'Ingeniero'] },
  'pileteros': { label: 'Pileteros', dbValues: ['Piletero'] },
  'alarmas': { label: 'Alarmas y Seguridad', dbValues: ['Instalador de Alarmas', 'Instalador de Cámaras de Seguridad'] },
  'lavadero-de-autos': { label: 'Lavadero de Autos', dbValues: ['Lavadero de Autos'] },
  'mantenimiento': { label: 'Mantenimiento General', dbValues: ['Mantenimiento General'] },
  'masajistas': { label: 'Masajistas', dbValues: ['Masajista'] },
  'kinesiologos': { label: 'Kinesiólogos', dbValues: ['Kinesiólogo'] },
  'nutricionistas': { label: 'Nutricionistas', dbValues: ['Nutricionista'] },
  'psicologos': { label: 'Psicólogos', dbValues: ['Psicólogo', 'Psiquiatra'] },
  'odontologos': { label: 'Odontólogos', dbValues: ['Odontólogo'] },
  'escribanos': { label: 'Escribanos', dbValues: ['Escribanía'] },
  'gestores': { label: 'Gestores del Automotor', dbValues: ['Gestor del Automotor'] },
  'inmobiliarias': { label: 'Corredores Inmobiliarios', dbValues: ['Corredor Inmobiliario'] },
  'catering': { label: 'Catering y Eventos', dbValues: ['Catering y Eventos', 'DJ para Eventos'] },
  'maquillaje': { label: 'Maquillaje', dbValues: ['Maquillador/a'] },
  'modistas': { label: 'Modistas y Costureras', dbValues: ['Modista/Costurera/Confeccionista a medida/Bordados'] },
  'cuidadores': { label: 'Cuidadores', dbValues: ['Cuidado de Personas', 'Cuidador/a de Adultos Mayores'] },
  'profesores': { label: 'Profesores de Apoyo', dbValues: ['Profesor de Apoyo Escolar'] },
  'automatizacion-ia': { label: 'Automatización con IA', dbValues: ['Automatización con IA'] },
  'centro-medico': { label: 'Centros Médicos', dbValues: ['Centro Médico'] },
  'acompanante-terapeutico': { label: 'Acompañantes Terapéuticos', dbValues: ['Acompañante Terapéutico'] },
  'alisado-profesional': { label: 'Alisado Profesional', dbValues: ['Alisadora Profesional'] },
  'encomiendas': { label: 'Encomiendas', dbValues: ['Encomiendas/Comisionista'] },
  'tornos-cnc': { label: 'Tornos CNC', dbValues: ['Capacitación en Manejo y Programación de Tornos CNC'] },
  'accesos-digitales': { label: 'Accesos Digitales para Eventos', dbValues: ['Gestor de sistemas de accesos digitales para eventos'] },
};

/**
 * Maps URL-safe city slugs to display labels and DB search patterns.
 * Uses ilike for flexible matching (handles "Rafaela", "RAFAELA", "Rafaela, Santa Fe").
 */
export const CITY_MAP: Record<string, CityEntry> = {
  'rafaela': { label: 'Rafaela', dbPattern: 'Rafaela' },
  'san-cristobal': { label: 'San Cristóbal', dbPattern: 'San Cristóbal' },
  'san-jorge': { label: 'San Jorge', dbPattern: 'San Jorge' },
  'susana': { label: 'Susana', dbPattern: 'Susana' },
  'maria-luisa': { label: 'María Luisa', dbPattern: 'María Luisa' },
};

/**
 * Look up a category slug and return the mapping, or null if not found.
 */
export function getCategoryMapping(slug: string): CategoryEntry | null {
  return CATEGORY_MAP[slug] || null;
}

/**
 * Look up a city slug and return the mapping, or null if not found.
 */
export function getCityMapping(slug: string): CityEntry | null {
  return CITY_MAP[slug] || null;
}

/**
 * Get all valid category slugs (for sitemap generation).
 */
export function getAllCategorySlugs(): string[] {
  return Object.keys(CATEGORY_MAP);
}

/**
 * Get all valid city slugs (for sitemap generation).
 */
export function getAllCitySlugs(): string[] {
  return Object.keys(CITY_MAP);
}
