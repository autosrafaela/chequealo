import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SearchFiltersType {
  profession?: string;
  location?: string;
  priceRange?: [number, number];
  rating?: number;
  verified?: boolean;
  availability?: string;
  sortBy?: 'rating' | 'reviews' | 'price' | 'distance';
  sortOrder?: 'asc' | 'desc';
}

export interface Professional {
  id: string;
  full_name: string;
  profession: string;
  location: string;
  description: string;
  rating: number;
  review_count: number;
  image_url?: string;
  is_verified: boolean;
  availability: string;
  distance?: number;
}

// --- Normalizar texto (quitar acentos) ---
function normalizeText(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// --- Diccionario de sinónimos ---
const SYNONYM_MAP: Record<string, string[]> = {
  'Plomero / Gasista': ['agua', 'cano', 'canilla', 'griferia', 'perdida', 'cañeria', 'inundacion', 'baño', 'tanque', 'desagote', 'sifon', 'desague'],
  'Electricista': ['luz', 'corriente', 'termica', 'enchufe', 'cortocircuito', 'cable', 'tablero'],
  'Abogado': ['defensa', 'juicio', 'legal', 'demanda', 'contrato', 'lobbista'],
  'Técnico de Aire Acondicionado': ['aire', 'split', 'frio calor', 'refrigeracion', 'climatizacion', 'frio', 'frío', 'calefaccion'],
  'Técnico en Refrigeración': ['heladera', 'freezer', 'refrigerador', 'enfriador'],
  'Pintor': ['pintar', 'pintura', 'paredes', 'latex', 'esmalte'],
  'Cerrajero': ['cerraduras', 'llave', 'puerta trabada', 'cerradura'],
  'Colocador de Pisos': ['piso', 'ceramico', 'porcelanato', 'baldosa'],
  'Fumigador / Control de Plagas': ['plagas', 'cucarachas', 'ratas', 'fumigacion', 'hormiga'],
  'Mecánico': ['auto', 'motor', 'frenos', 'aceite', 'taller'],
  'Carpintero / Ebanista': ['muebles', 'madera', 'estantes', 'carpinteria'],
  'Techista': ['techo', 'gotera', 'membrana', 'canaleta', 'filtracion', 'lluvia'],
  'Instalador de Alarmas': ['alarma', 'seguridad', 'camaras'],
  'Instalador de Internet': ['internet', 'wifi', 'red'],
  'Reparación de Celulares': ['celular', 'pantalla rota', 'telefono'],
  'Reparación de Computadoras': ['pc', 'computadora', 'notebook'],
  'Empleada Doméstica / Servicio de Limpieza': ['limpieza', 'limpiar', 'hogar', 'mucama'],
  'Fletero / Mudanzas': ['mudanza', 'flete', 'transporte'],
  'Cuidador/a de Niños (Niñera)': ['ninera', 'cuidar ninos', 'babysitter', 'niñera'],
  'Veterinario': ['mascotas', 'perro', 'gato', 'veterinaria'],
  'Entrenador Personal': ['yoga', 'ejercicio', 'gym', 'entrenamiento'],
  'Fotógrafo': ['foto', 'sesion', 'fotografia'],
  'Diseñador Gráfico': ['diseno', 'logo', 'marca', 'diseño'],
  'Desarrollador Web': ['web', 'pagina', 'sitio', 'app'],
  'Contador': ['contabilidad', 'impuestos', 'monotributo'],
  'Albañil': ['construccion', 'obra', 'pared', 'revoque', 'albañileria', 'humedad', 'fisura', 'rajadura'],
  'Gasista': ['gas', 'garrafa', 'calefon'],
  'Jardinero': ['jardin', 'cesped', 'poda', 'plantas'],
  'Gomería': ['neumatico', 'neumaticos', 'cubierta', 'cubiertas', 'rueda', 'pinchadura', 'llanta', 'goma', 'gomas'],
  'Gomería a Domicilio': ['gomeria', 'auxilio', 'auxilio mecanico', 'pinchada', 'rueda pinchada', 'neumatico domicilio'],
};

// Invertir el mapa para búsqueda rápida: keyword (normalizado) -> profesión
const KEYWORD_TO_PROFESSION: Record<string, string> = {};
for (const [profession, keywords] of Object.entries(SYNONYM_MAP)) {
  // Also map the profession name itself (normalized)
  KEYWORD_TO_PROFESSION[normalizeText(profession)] = profession;
  for (const kw of keywords) {
    KEYWORD_TO_PROFESSION[normalizeText(kw)] = profession;
  }
}

// --- Fuzzy Match (Levenshtein simplificado) ---
function levenshteinDistance(a: string, b: string): number {
  const la = a.length, lb = b.length;
  if (la === 0) return lb;
  if (lb === 0) return la;
  const dp: number[][] = Array.from({ length: la + 1 }, () => Array(lb + 1).fill(0));
  for (let i = 0; i <= la; i++) dp[i][0] = i;
  for (let j = 0; j <= lb; j++) dp[0][j] = j;
  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[la][lb];
}

// All known profession names for fuzzy matching
const ALL_KNOWN_PROFESSIONS = Object.keys(SYNONYM_MAP);

function findFuzzyProfession(keyword: string, maxDistance = 2): string | null {
  if (keyword.length < 4) return null; // Skip very short words
  const lower = keyword.toLowerCase();
  let bestMatch: string | null = null;
  let bestDist = maxDistance + 1;
  
  for (const prof of ALL_KNOWN_PROFESSIONS) {
    // Compare against each word in the profession name
    const profWords = prof.toLowerCase().split(/[\s/]+/);
    for (const pw of profWords) {
      if (pw.length < 4) continue;
      const dist = levenshteinDistance(lower, pw);
      if (dist < bestDist) {
        bestDist = dist;
        bestMatch = prof;
      }
    }
  }
  return bestDist <= maxDistance ? bestMatch : null;
}

// Resolve keywords to matched professions + expanded keywords
function resolveSearch(keywords: string[]): { matchedProfessions: string[]; expandedKeywords: string[] } {
  const expanded = new Set(keywords);
  const matchedProfessions = new Set<string>();
  
  for (const kw of keywords) {
    const normalized = normalizeText(kw);
    
    // Check synonym map (normalized)
    const matchedProfession = KEYWORD_TO_PROFESSION[normalized];
    if (matchedProfession) {
      matchedProfessions.add(matchedProfession);
      matchedProfession.split(/[\s/()]+/).filter(w => w.length > 2).forEach(w => expanded.add(w.toLowerCase()));
      expanded.add(matchedProfession.toLowerCase());
      console.log(`📖 Synonym match: "${kw}" → "${matchedProfession}"`);
    }
    
    // Fuzzy match against profession names (only if no synonym match)
    if (!matchedProfession) {
      const fuzzyMatch = findFuzzyProfession(normalized);
      if (fuzzyMatch) {
        matchedProfessions.add(fuzzyMatch);
        fuzzyMatch.split(/[\s/()]+/).filter(w => w.length > 2).forEach(w => expanded.add(w.toLowerCase()));
        expanded.add(fuzzyMatch.toLowerCase());
        console.log(`🔤 Fuzzy match: "${kw}" → "${fuzzyMatch}"`);
      }
    }
  }
  
  return { matchedProfessions: Array.from(matchedProfessions), expandedKeywords: Array.from(expanded) };
}

export const useAdvancedSearch = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [allAvailableProfessions, setAllAvailableProfessions] = useState<string[]>([]);
  const [allAvailableServices, setAllAvailableServices] = useState<string[]>([]);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  const searchProfessionals = async (query: string = searchQuery, currentFilters: SearchFiltersType = filters) => {
    setLoading(true);
    try {
      console.log('🔍 Buscando:', { query, filters: currentFilters });
      
      // Fetch active "En tu zona hoy" routes for boost
      const today = new Date().toISOString().split('T')[0];
      const { data: activeRoutes } = await supabase
        .from('pro_routes')
        .select('professional_id, neighborhoods, boost_expires_at')
        .eq('route_date', today)
        .eq('is_active', true);
      
      const boostedProIds = new Set(
        (activeRoutes || [])
          .filter(r => r.boost_expires_at && new Date(r.boost_expires_at) > new Date())
          .map(r => r.professional_id)
      );
      
      // Prepare base query
      let professionalsQuery = supabase
        .from('professionals_public_safe')
        .select(`
          id,
          full_name,
          profession,
          location,
          description,
          rating,
          review_count,
          image_url,
          is_verified,
          availability
        `);

      let servicesQuery = supabase
        .from('professional_services')
        .select('professional_id, service_name, description')
        .eq('is_active', true);

      // NEW: Query for professional_professions (multi-rubros)
      let professionsQuery = supabase
        .from('professional_professions')
        .select('professional_id, profession');

      // Apply smart keyword search with synonym expansion
      let expandedKeywords: string[] = [];
      let matchedProfessions: string[] = [];
      if (query && query.trim() !== '') {
        const searchTerms = query.toLowerCase().trim();
        const rawKeywords = searchTerms.split(/\s+/).filter(word => word.length > 2);
        
        // Resolve synonyms → professions + expanded keywords
        const resolved = resolveSearch(rawKeywords);
        expandedKeywords = resolved.expandedKeywords;
        matchedProfessions = resolved.matchedProfessions;
        
        console.log('📝 Keywords originales:', rawKeywords);
        console.log('📝 Keywords expandidas:', expandedKeywords);
        console.log('🎯 Profesiones resueltas:', matchedProfessions);
        
        if (matchedProfessions.length > 0) {
          // PRIORITY: Filter by resolved profession(s)
          const profFilter = matchedProfessions.map(p => `profession.ilike.%${p}%`).join(',');
          professionalsQuery = professionalsQuery.or(profFilter);
          
          // Also search in professional_professions table for multi-rubro
          const professionConditions = matchedProfessions.map(p => `profession.ilike.%${p}%`).join(',');
          professionsQuery = professionsQuery.or(professionConditions);
          
          // Search services with expanded keywords
          if (expandedKeywords.length > 0) {
            const serviceConditions = expandedKeywords.map(keyword =>
              `service_name.ilike.%${keyword}%,description.ilike.%${keyword}%`
            ).join(',');
            servicesQuery = servicesQuery.or(serviceConditions);
          }
        } else if (expandedKeywords.length > 0) {
          // No profession match — fall back to broad keyword search
          const profConditions = expandedKeywords.map(keyword => 
            `full_name.ilike.%${keyword}%,profession.ilike.%${keyword}%,location.ilike.%${keyword}%,description.ilike.%${keyword}%`
          ).join(',');
          professionalsQuery = professionalsQuery.or(profConditions);
          
          const serviceConditions = expandedKeywords.map(keyword =>
            `service_name.ilike.%${keyword}%,description.ilike.%${keyword}%`
          ).join(',');
          servicesQuery = servicesQuery.or(serviceConditions);

          const professionConditions = expandedKeywords.map(keyword =>
            `profession.ilike.%${keyword}%`
          ).join(',');
          professionsQuery = professionsQuery.or(professionConditions);
        }
      }

      // Apply profession filter
      if (currentFilters.profession && currentFilters.profession !== 'all') {
        professionalsQuery = professionalsQuery.ilike('profession', `%${currentFilters.profession}%`);
      }

      // Apply location filter
      if (currentFilters.location && currentFilters.location !== 'all') {
        professionalsQuery = professionalsQuery.ilike('location', `%${currentFilters.location}%`);
      }

      // Execute all queries in parallel
      const [professionalsResult, servicesResult, professionsResult] = await Promise.all([
        professionalsQuery,
        servicesQuery,
        query && query.trim() !== '' ? professionsQuery : Promise.resolve({ data: null, error: null })
      ]);

      if (professionalsResult.error) {
        console.error('❌ Error en búsqueda:', professionalsResult.error);
        throw professionalsResult.error;
      }

      console.log('✅ Profesionales encontrados:', professionalsResult.data?.length || 0);
      console.log('✅ Servicios coincidentes:', servicesResult.data?.length || 0);
      console.log('✅ Rubros coincidentes:', professionsResult.data?.length || 0);

      let professionalsData = professionalsResult.data || [];
      
      // Combine professional IDs from services AND professions tables
      const additionalProfIds = new Set<string>();
      
      if (servicesResult.data) {
        servicesResult.data.forEach(s => additionalProfIds.add(s.professional_id));
      }
      if (professionsResult.data) {
        professionsResult.data.forEach(p => additionalProfIds.add(p.professional_id));
      }

      // Fetch additional professionals by IDs
      if (additionalProfIds.size > 0) {
        const existingIds = new Set(professionalsData.map(p => p.id));
        const missingIds = Array.from(additionalProfIds).filter(id => !existingIds.has(id));
        
        if (missingIds.length > 0) {
          const { data: additionalProfs } = await supabase
            .from('professionals_public_safe')
            .select(`
              id, full_name, profession, location, description,
              rating, review_count, image_url, is_verified, availability
            `)
            .in('id', missingIds);
          
          if (additionalProfs) {
            professionalsData = [...professionalsData, ...additionalProfs];
            console.log('➕ Profesionales adicionales por servicios/rubros:', additionalProfs.length);
          }
        }
      }

      // Scoring system
      const scoredData = professionalsData.map(prof => {
        let score = 0;
        
        // BOOST: "En tu zona hoy" (+50)
        if (boostedProIds.has(prof.id)) score += 50;
        
        // GEOGRAPHIC: Priorizar "En Línea" en Rafaela
        if (prof.availability === 'available') score += 15;
        if (prof.location?.toLowerCase().includes('rafaela')) score += 10;
        
        if (query && query.trim() !== '') {
          const keywords = expandedKeywords.length > 0 ? expandedKeywords : query.toLowerCase().trim().split(/\s+/).filter(w => w.length > 2);
          
          // HIGH PRIORITY: Direct profession match from resolved professions
          if (matchedProfessions.length > 0) {
            const profNorm = normalizeText(prof.profession || '');
            const hasProfessionMatch = matchedProfessions.some(mp => 
              profNorm.includes(normalizeText(mp)) || normalizeText(mp).includes(profNorm)
            );
            if (hasProfessionMatch) score += 50; // Strong boost for exact profession match
          }
          
          keywords.forEach(keyword => {
            if (prof.profession?.toLowerCase() === keyword) score += 20;
            else if (prof.profession?.toLowerCase().includes(keyword)) score += 10;
            if (prof.full_name?.toLowerCase().includes(keyword)) score += 5;
            if (prof.description?.toLowerCase().includes(keyword)) score += 3;
            if (prof.location?.toLowerCase().includes(keyword)) score += 2;
          });
          
          if (prof.is_verified) score += 8;
          if (prof.rating && prof.rating >= 4.5) score += 5;
          if (prof.rating && prof.rating >= 4.0) score += 3;
          if (prof.review_count && prof.review_count > 10) score += 4;
          if (prof.review_count && prof.review_count > 5) score += 2;
          
          // Bonus for matching services
          if (servicesResult.data) {
            const hasMatchingService = servicesResult.data.some(s => {
              if (s.professional_id !== prof.id) return false;
              return keywords.some(keyword => 
                s.service_name?.toLowerCase().includes(keyword) ||
                s.description?.toLowerCase().includes(keyword)
              );
            });
            if (hasMatchingService) score += 20;
          }
          
          // Bonus for matching rubros in professional_professions
          if (professionsResult.data) {
            const hasMatchingProfession = professionsResult.data.some(p => {
              if (p.professional_id !== prof.id) return false;
              return keywords.some(keyword => 
                p.profession?.toLowerCase().includes(keyword)
              );
            });
            if (hasMatchingProfession) score += 15;
          }
        } else {
          if (prof.is_verified) score += 5;
          if (prof.rating) score += prof.rating * 2;
          if (prof.review_count) score += Math.min(prof.review_count, 10);
        }
        
        return { ...prof, relevanceScore: score };
      });

      let filteredData = scoredData;

      // MINIMUM RELEVANCE THRESHOLD: Remove irrelevant results when searching
      if (query && query.trim() !== '') {
        const MIN_SCORE = matchedProfessions.length > 0 ? 30 : 5;
        filteredData = filteredData.filter(p => (p.relevanceScore || 0) >= MIN_SCORE);
        console.log(`🚫 Filtrado por score mínimo (${MIN_SCORE}): ${scoredData.length} → ${filteredData.length}`);
      }

      // Apply additional filters
      if (currentFilters.rating) {
        filteredData = filteredData.filter(p => (p.rating || 0) >= currentFilters.rating!);
      }
      if (currentFilters.verified !== undefined) {
        filteredData = filteredData.filter(p => p.is_verified === currentFilters.verified);
      }
      if (currentFilters.availability && currentFilters.availability !== 'all') {
        filteredData = filteredData.filter(p => p.availability === currentFilters.availability);
      }

      // Sort: verified first, then by criteria
      filteredData.sort((a, b) => {
        if (a.is_verified !== b.is_verified) return a.is_verified ? -1 : 1;
        
        if (currentFilters.sortBy === 'rating') {
          return (b.rating || 0) - (a.rating || 0);
        } else if (currentFilters.sortBy === 'reviews') {
          return (b.review_count || 0) - (a.review_count || 0);
        } else {
          if (query && query.trim() !== '') {
            return (b.relevanceScore || 0) - (a.relevanceScore || 0);
          }
          return (b.rating || 0) - (a.rating || 0);
        }
      });

      console.log('🎯 Resultados finales:', filteredData.slice(0, 5).map(p => ({
        name: p.full_name, profession: p.profession, score: p.relevanceScore
      })));

      const mappedData: Professional[] = filteredData.map(item => ({
        id: item.id,
        full_name: item.full_name,
        profession: item.profession,
        location: item.location || '',
        description: item.description || '',
        rating: Number(item.rating || 0),
        review_count: item.review_count || 0,
        image_url: item.image_url,
        is_verified: item.is_verified,
        availability: item.availability || 'available'
      }));

      setProfessionals(mappedData);
    } catch (error) {
      console.error('❌ Error en búsqueda de profesionales:', error);
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters: Partial<SearchFiltersType>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    searchProfessionals(searchQuery, updatedFilters);
  };

  const updateSearchQuery = (query: string) => {
    setSearchQuery(query);
    searchProfessionals(query, filters);
  };

  const clearFilters = () => {
    setFilters({});
    searchProfessionals(searchQuery, {});
  };

  // Load all professions and services
  useEffect(() => {
    const loadAllProfessionsAndServices = async () => {
      try {
        const predefinedProfessions = [
          'Alisadora Profesional', 'Arquitecta', 'Automatización con IA', 'Carpintero / Ebanista',
          'Contadora Pública', 'Electricista', 'Empleada Doméstica / Servicio de Limpieza',
          'Entrenador Personal', 'Herrero', 'Jardinero / Paisajista', 'Limpieza y Mantenimiento',
          'Maquillador/a', 'Pintor', 'Piscinas / Piletas Colocación', 'Profesor de Apoyo Escolar',
          'Profesora de Inglés', 'Técnico de PC', 'Mecánico', 'Técnico de Aire Acondicionado',
          'Kinesiólogo / Fisioterapeuta', 'Gestor del Automotor', 'Servicio Técnico (Línea Blanca)',
          'Limpieza de Tapizados', 'Instalador de Durlock / Yesero', 'Fumigador / Control de Plagas',
          'Profesor de Música', 'Plomero / Gasista', 'Técnico en Refrigeración', 'Cerrajero',
          'Albañil', 'Pintor de Obras', 'Techista', 'Jardinero', 'Podador de Árboles',
          'Electricista Matriculado', 'Instalador de Alarmas', 'Instalador de Cámaras de Seguridad',
          'Colocador de Pisos', 'Colocador de Cerámicos', 'Colocador de Porcelanatos', 'Vidriería',
          'Herrería de Obra', 'Soldador', 'Técnico en Calefacción', 'Instalador de Paneles Solares',
          'Técnico en Energías Renovables', 'Decorador de Interiores', 'Diseñador de Interiores',
          'Organizador Profesional', 'Personal Shopper', 'Chef a Domicilio', 'Pastelero', 'Repostero',
          'Catering', 'Barman / Bartender', 'Sommelier', 'Nutricionista', 'Profesor de Yoga',
          'Profesor de Pilates', 'Masajista', 'Esteticista', 'Manicurista', 'Pedicurista',
          'Peluquero/a', 'Barbero', 'Maquillador Profesional', 'Maquilladora Social',
          'Maquilladora Artística', 'Fotógrafo', 'Camarógrafo',
          'Capacitación en Manejo y Programación de Tornos CNC', 'Editor de Video',
          'Diseñador Gráfico', 'Desarrollador Web', 'Community Manager', 'Redactor de Contenidos',
          'Traductor', 'Encomiendas/Comisionista', 'Profesor Particular', 'Profesor de Matemáticas',
          'Profesor de Física', 'Profesor de Química', 'Profesor de Idiomas',
          'Profesor de Música (Piano)', 'Profesor de Música (Guitarra)', 'Profesor de Canto',
          'Profesor de Danza', 'Profesor de Dibujo y Pintura', 'Veterinario', 'Peluquero Canino',
          'Paseador de Perros', 'Cuidador de Mascotas', 'Adiestrador de Perros', 'Chofer Particular',
          'Remisero', 'Fletero / Mudanzas', 'Mensajería', 'Cuidador/a de Niños (Niñera)',
          'Cuidador/a de Adultos Mayores', 'Enfermero/a', 'Acompañante Terapéutico', 'Psicólogo',
          'Psicopedagogo', 'Fonoaudiólogo', 'Terapista Ocupacional', 'Abogado', 'Contador',
          'Asesor de Seguros', 'Asesor Inmobiliario', 'Martillero Público', 'Escribano',
          'Ingeniero', 'Agrimensor', 'Reparación de Electrodomésticos', 'Reparación de Celulares',
          'Reparación de Computadoras', 'Técnico en Redes', 'Instalador de Internet',
          'Instalador de TV', 'Tapicero', 'Cortinero', 'Cursos/Formación', 'Pulidor de Pisos',
          'Limpieza de Alfombras', 'Limpieza de Persianas', 'Limpieza de Tanques de Agua',
          'Desinfección y Sanitización', 'Control de Plagas y Fumigación', 'Lavadero de Autos',
          'Detailing de Autos', 'Detailing', 'Polarizado de Vidrios',
          'Instalador de Audio para Autos', 'Mecánico de Motos', 'Chapista y Pintor Automotor',
          'Gomería', 'Auxiliares de Estudio',
          'Modista/Costurera/Confeccionista a medida/Bordados'
        ];

        const { data: profs } = await supabase
          .from('professionals_public_safe')
          .select('profession');
        
        const dbProfessions = profs?.map(p => p.profession).filter(Boolean) || [];
        const allProfessionsList = [...new Set([...predefinedProfessions, ...dbProfessions])];
        allProfessionsList.sort((a, b) => a.localeCompare(b, 'es'));
        setAllAvailableProfessions(allProfessionsList);

        const { data: services } = await supabase
          .from('professional_services')
          .select('service_name')
          .order('service_name');
        
        const uniqueServices = Array.from(new Set(services?.map(s => s.service_name).filter(Boolean) || []));
        setAllAvailableServices(uniqueServices);
      } catch (error) {
        console.error('Error loading all professions and services:', error);
      }
    };

    loadAllProfessionsAndServices();
  }, []);

  const availableProfessions = useMemo(() => {
    return allAvailableProfessions;
  }, [allAvailableProfessions]);

  const availableLocations = useMemo(() => {
    return [...new Set(professionals.map(p => p.location))].filter(Boolean).sort();
  }, [professionals]);

  useEffect(() => {
    const currentPath = window.location.pathname;
    const hasSearchParams = window.location.search.includes('q=') || 
                           window.location.search.includes('location=') || 
                           window.location.search.includes('city=');
    
    if (!(currentPath === '/search' && hasSearchParams)) {
      searchProfessionals();
    }
  }, []);

  return {
    professionals,
    loading,
    filters,
    searchQuery,
    userLocation,
    availableProfessions,
    availableLocations,
    searchProfessionals,
    updateFilters,
    updateSearchQuery,
    clearFilters
  };
};
