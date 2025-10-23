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
      
      // Paso 1: Preparar query base para professionals
      // SECURITY: Using professionals_public_safe view to exclude sensitive data (email, phone, DNI)
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

      // Paso 2: Preparar query para servicios profesionales
      let servicesQuery = supabase
        .from('professional_services')
        .select('professional_id, service_name, description')
        .eq('is_active', true);

      // Paso 3: Aplicar búsqueda inteligente por palabras clave
      if (query && query.trim() !== '') {
        const searchTerms = query.toLowerCase().trim();
        
        // Dividir en palabras individuales para búsqueda más flexible
        const keywords = searchTerms.split(/\s+/).filter(word => word.length > 2);
        
        console.log('📝 Palabras clave extraídas:', keywords);
        
        if (keywords.length > 0) {
          // Buscar cada palabra clave en professionals
          const profConditions = keywords.map(keyword => 
            `full_name.ilike.%${keyword}%,profession.ilike.%${keyword}%,location.ilike.%${keyword}%,description.ilike.%${keyword}%`
          ).join(',');
          
          professionalsQuery = professionalsQuery.or(profConditions);
          
          // Buscar en servicios
          const serviceConditions = keywords.map(keyword =>
            `service_name.ilike.%${keyword}%,description.ilike.%${keyword}%`
          ).join(',');
          
          servicesQuery = servicesQuery.or(serviceConditions);
        }
      }

      // Paso 4: Aplicar filtro de profesión
      if (currentFilters.profession && currentFilters.profession !== 'all') {
        professionalsQuery = professionalsQuery.ilike('profession', `%${currentFilters.profession}%`);
      }

      // Paso 5: Aplicar filtro de ubicación
      if (currentFilters.location && currentFilters.location !== 'all') {
        professionalsQuery = professionalsQuery.ilike('location', `%${currentFilters.location}%`);
      }

      // Paso 6: Ejecutar ambas queries en paralelo
      const [professionalsResult, servicesResult] = await Promise.all([
        professionalsQuery,
        servicesQuery
      ]);

      if (professionalsResult.error) {
        console.error('❌ Error en búsqueda:', professionalsResult.error);
        throw professionalsResult.error;
      }

      console.log('✅ Profesionales encontrados:', professionalsResult.data?.length || 0);
      console.log('✅ Servicios coincidentes:', servicesResult.data?.length || 0);

      let professionalsData = professionalsResult.data || [];
      
      // Paso 7: Agregar profesionales que tienen servicios coincidentes
      if (servicesResult.data && servicesResult.data.length > 0) {
        const servicesProfIds = new Set(servicesResult.data.map(s => s.professional_id));
        
        // Buscar profesionales adicionales por IDs de servicios
        if (servicesProfIds.size > 0) {
          // SECURITY: Using professionals_public_safe view for additional professionals
          const additionalProfsQuery = supabase
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
            `)
            .in('id', Array.from(servicesProfIds));
          
          const { data: additionalProfs } = await additionalProfsQuery;
          
          if (additionalProfs) {
            // Combinar resultados, evitando duplicados
            const existingIds = new Set(professionalsData.map(p => p.id));
            const newProfs = additionalProfs.filter(p => !existingIds.has(p.id));
            professionalsData = [...professionalsData, ...newProfs];
            
            console.log('➕ Profesionales adicionales por servicios:', newProfs.length);
          }
        }
      }

      // Paso 8: Sistema de scoring para relevancia
      const scoredData = professionalsData.map(prof => {
        let score = 0;
        
        if (query && query.trim() !== '') {
          const searchTerms = query.toLowerCase().trim();
          const keywords = searchTerms.split(/\s+/).filter(word => word.length > 2);
          
          keywords.forEach(keyword => {
            // Puntuar coincidencias - más específico = más puntos
            if (prof.profession?.toLowerCase() === keyword) score += 20; // Coincidencia exacta
            else if (prof.profession?.toLowerCase().includes(keyword)) score += 10;
            
            if (prof.full_name?.toLowerCase().includes(keyword)) score += 5;
            if (prof.description?.toLowerCase().includes(keyword)) score += 3;
            if (prof.location?.toLowerCase().includes(keyword)) score += 2;
          });
          
          // Bonus por verificación y calidad
          if (prof.is_verified) score += 8;
          if (prof.rating && prof.rating >= 4.5) score += 5;
          if (prof.rating && prof.rating >= 4.0) score += 3;
          if (prof.review_count && prof.review_count > 10) score += 4;
          if (prof.review_count && prof.review_count > 5) score += 2;
          
          // Verificar si tiene servicios relacionados (BONUS GRANDE)
          if (servicesResult.data) {
            const hasMatchingService = servicesResult.data.some(s => {
              if (s.professional_id !== prof.id) return false;
              return keywords.some(keyword => 
                s.service_name?.toLowerCase().includes(keyword) ||
                s.description?.toLowerCase().includes(keyword)
              );
            });
            if (hasMatchingService) score += 20; // Alto bonus por servicios coincidentes
          }
        } else {
          // Sin búsqueda específica, puntuar por calidad general
          if (prof.is_verified) score += 5;
          if (prof.rating) score += prof.rating * 2;
          if (prof.review_count) score += Math.min(prof.review_count, 10);
        }
        
        return { ...prof, relevanceScore: score };
      });

      let filteredData = scoredData;

      // Paso 9: Aplicar filtros adicionales
      if (currentFilters.rating) {
        filteredData = filteredData.filter(p => 
          (p.rating || 0) >= currentFilters.rating!
        );
      }

      if (currentFilters.verified !== undefined) {
        filteredData = filteredData.filter(p => p.is_verified === currentFilters.verified);
      }

      if (currentFilters.availability && currentFilters.availability !== 'all') {
        filteredData = filteredData.filter(p => 
          p.availability === currentFilters.availability
        );
      }

      // Paso 10: Ordenar por relevancia o criterio seleccionado
      filteredData.sort((a, b) => {
        if (currentFilters.sortBy === 'rating') {
          return (b.rating || 0) - (a.rating || 0);
        } else if (currentFilters.sortBy === 'reviews') {
          return (b.review_count || 0) - (a.review_count || 0);
        } else {
          // Por defecto, ordenar por relevancia si hay búsqueda
          if (query && query.trim() !== '') {
            return (b.relevanceScore || 0) - (a.relevanceScore || 0);
          }
          // Sin búsqueda, ordenar por rating
          return (b.rating || 0) - (a.rating || 0);
        }
      });

      console.log('🎯 Resultados finales con scoring:', filteredData.slice(0, 5).map(p => ({
        name: p.full_name,
        profession: p.profession,
        score: p.relevanceScore
      })));

      // Paso 11: Mapear a interfaz Professional
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

  // Cargar TODAS las profesiones y servicios disponibles
  useEffect(() => {
    const loadAllProfessionsAndServices = async () => {
      try {
        // Lista completa de profesiones predefinidas
        const predefinedProfessions = [
          'Arquitecta', 'Carpintero / Ebanista', 'Contadora Pública', 'Electricista',
          'Empleada Doméstica / Servicio de Limpieza', 'Entrenador Personal', 'Herrero',
          'Jardinero / Paisajista', 'Limpieza y Mantenimiento', 'Maquillador/a', 'Pintor',
          'Profesor de Apoyo Escolar', 'Profesora de Inglés', 'Técnico de PC', 'Mecánico',
          'Técnico de Aire Acondicionado', 'Kinesiólogo / Fisioterapeuta', 'Gestor del Automotor',
          'Servicio Técnico (Línea Blanca)', 'Limpieza de Tapizados', 'Instalador de Durlock / Yesero',
          'Fumigador / Control de Plagas', 'Profesor de Música', 'Plomero / Gasista',
          'Técnico en Refrigeración', 'Cerrajero', 'Albañil', 'Pintor de Obras', 'Techista',
          'Jardinero', 'Podador de Árboles', 'Electricista Matriculado', 'Instalador de Alarmas',
          'Instalador de Cámaras de Seguridad', 'Colocador de Pisos', 'Colocador de Cerámicos',
          'Colocador de Porcelanatos', 'Vidriería', 'Herrería de Obra', 'Soldador',
          'Técnico en Calefacción', 'Instalador de Paneles Solares', 'Técnico en Energías Renovables',
          'Decorador de Interiores', 'Diseñador de Interiores', 'Organizador Profesional',
          'Personal Shopper', 'Chef a Domicilio', 'Pastelero', 'Repostero', 'Catering',
          'Barman / Bartender', 'Sommelier', 'Nutricionista', 'Profesor de Yoga', 'Profesor de Pilates',
          'Masajista', 'Esteticista', 'Manicurista', 'Pedicurista', 'Peluquero/a', 'Barbero',
          'Maquillador Profesional', 'Fotógrafo', 'Camarógrafo', 'Editor de Video',
          'Diseñador Gráfico', 'Desarrollador Web', 'Community Manager', 'Redactor de Contenidos',
          'Traductor', 'Profesor Particular', 'Profesor de Matemáticas', 'Profesor de Física',
          'Profesor de Química', 'Profesor de Idiomas', 'Profesor de Música (Piano)',
          'Profesor de Música (Guitarra)', 'Profesor de Canto', 'Profesor de Danza',
          'Profesor de Dibujo y Pintura', 'Veterinario', 'Peluquero Canino', 'Paseador de Perros',
          'Cuidador de Mascotas', 'Adiestrador de Perros', 'Chofer Particular', 'Remisero',
          'Fletero / Mudanzas', 'Mensajería', 'Cuidador/a de Niños (Niñera)',
          'Cuidador/a de Adultos Mayores', 'Enfermero/a', 'Acompañante Terapéutico', 'Psicólogo',
          'Psicopedagogo', 'Fonoaudiólogo', 'Terapista Ocupacional', 'Abogado', 'Contador',
          'Asesor de Seguros', 'Asesor Inmobiliario', 'Martillero Público', 'Escribano',
          'Ingeniero', 'Agrimensor', 'Reparación de Electrodomésticos', 'Reparación de Celulares',
          'Reparación de Computadoras', 'Técnico en Redes', 'Instalador de Internet',
          'Instalador de TV', 'Tapicero', 'Cortinero', 'Pulidor de Pisos', 'Limpieza de Alfombras',
          'Limpieza de Persianas', 'Limpieza de Tanques de Agua', 'Desinfección y Sanitización',
          'Control de Plagas y Fumigación', 'Lavadero de Autos', 'Detailing de Autos',
          'Polarizado de Vidrios', 'Instalador de Audio para Autos', 'Mecánico de Motos',
          'Chapista y Pintor Automotor', 'Gomería'
        ];

        // Cargar profesiones de la base de datos
        const { data: profs } = await supabase
          .from('professionals_public_safe')
          .select('profession');
        
        const dbProfessions = profs?.map(p => p.profession).filter(Boolean) || [];
        const allProfessionsList = [...new Set([...predefinedProfessions, ...dbProfessions])];
        allProfessionsList.sort((a, b) => a.localeCompare(b, 'es'));
        setAllAvailableProfessions(allProfessionsList);

        // Cargar TODOS los servicios disponibles
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
    // Retornar todas las profesiones disponibles, no solo las de los resultados actuales
    return allAvailableProfessions;
  }, [allAvailableProfessions]);

  const availableLocations = useMemo(() => {
    return [...new Set(professionals.map(p => p.location))].filter(Boolean).sort();
  }, [professionals]);

  useEffect(() => {
    // Only search automatically if we're not on a search page with URL params
    const currentPath = window.location.pathname;
    const hasSearchParams = window.location.search.includes('q=') || 
                           window.location.search.includes('location=') || 
                           window.location.search.includes('city=');
    
    // Load professionals automatically unless we're on search page with params
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