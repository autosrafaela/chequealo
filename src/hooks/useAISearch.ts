import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AISearchResponse {
  enhancedQuery?: string;
  suggestions?: string[];
  intent?: string;
  entities?: {
    service?: string;
    location?: string;
    urgency?: string;
    problem?: string;
  };
}

export const useAISearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchWithAI = async (naturalLanguageQuery: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('ai-search-enhance', {
        body: { 
          query: naturalLanguageQuery,
          type: 'enhance'
        }
      });

      if (functionError) {
        console.error('AI search error:', functionError);
        setError('Error processing search with AI');
        return null;
      }

      return data?.enhancedQuery || null;
    } catch (err) {
      console.error('AI search error:', err);
      setError('Error connecting to AI service');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const generateSuggestions = async (partialQuery: string): Promise<string[]> => {
    if (partialQuery.length < 3) return [];

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('ai-search-enhance', {
        body: { 
          query: partialQuery,
          type: 'suggest'
        }
      });

      if (functionError) {
        console.error('AI suggestions error:', functionError);
        return [];
      }

      return data?.suggestions || [];
    } catch (err) {
      console.error('AI suggestions error:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeIntent = async (query: string): Promise<AISearchResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('ai-search-enhance', {
        body: { 
          query,
          type: 'analyze'
        }
      });

      if (functionError) {
        console.error('AI intent analysis error:', functionError);
        return null;
      }

      return data || null;
    } catch (err) {
      console.error('AI intent analysis error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const generatePersonalizedRecommendations = async (
    userId: string,
    searchHistory: string[],
    location?: string
  ): Promise<string[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('ai-search-enhance', {
        body: { 
          userId,
          searchHistory,
          location,
          type: 'recommendations'
        }
      });

      if (functionError) {
        console.error('AI recommendations error:', functionError);
        return [];
      }

      return data?.recommendations || [];
    } catch (err) {
      console.error('AI recommendations error:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced search with local fallbacks
  const intelligentSearch = async (query: string) => {
    // Try AI enhancement first
    const enhanced = await searchWithAI(query);
    
    if (enhanced) {
      return enhanced;
    }

    // Fallback to local intelligent parsing
    return parseQueryLocally(query);
  };

  const parseQueryLocally = (query: string): string => {
    const lowercaseQuery = query.toLowerCase();
    
    // Expandir mapeos con sinónimos y frases más específicas
    const problemMappings: Record<string, string> = {
      // Plomería - MUY ESPECÍFICO PRIMERO
      'plomero para arreglar canilla que gotea': 'plomero',
      'plomero para arreglar canilla': 'plomero',
      'arreglar canilla que gotea': 'plomero',
      'arreglar canilla': 'plomero',
      'canilla que gotea': 'plomero',
      'canilla gotea': 'plomero',
      'grifería': 'plomero',
      'grifo': 'plomero',
      'llave de agua': 'plomero',
      'fuga de agua': 'plomero',
      'pérdida de agua': 'plomero',
      'destape': 'plomero',
      'cañería': 'plomero',
      'caño roto': 'plomero',
      'inodoro tapado': 'plomero',
      'baño tapado': 'plomero',
      'ducha': 'plomero',
      'tanque de agua': 'plomero',
      'calefón': 'plomero',
      'termotanque': 'plomero',
      'gasista': 'plomero',
      'gas': 'plomero',
      'plomero': 'plomero',
      'plomería': 'plomero',
      'fontanero': 'plomero',
      'sanitarista': 'plomero',
      
      // Electricista - ESPECÍFICO
      'electricista para instalar aire acondicionado': 'electricista',
      'electricista para instalar aire': 'electricista',
      'instalar aire acondicionado': 'electricista',
      'instalación aire acondicionado': 'electricista',
      'instalación eléctrica': 'electricista',
      'arreglar luz': 'electricista',
      'no hay luz': 'electricista',
      'corte de luz': 'electricista',
      'tablero eléctrico': 'electricista',
      'disyuntor': 'electricista',
      'térmica': 'electricista',
      'enchufe': 'electricista',
      'toma corriente': 'electricista',
      'cable pelado': 'electricista',
      'cortocircuito': 'electricista',
      'interruptor': 'electricista',
      'lampara': 'electricista',
      'luminaria': 'electricista',
      'ventilador de techo': 'electricista',
      'electricista': 'electricista',
      'electricidad': 'electricista',
      'electrico': 'electricista',
      
      // Aire acondicionado
      'aire acondicionado': 'técnico en refrigeración',
      'aire no funciona': 'técnico en refrigeración',
      'aire no enfría': 'técnico en refrigeración',
      'aire no anda': 'técnico en refrigeración',
      'aire roto': 'técnico en refrigeración',
      'split': 'técnico en refrigeración',
      'instalación split': 'técnico en refrigeración',
      'service aire': 'técnico en refrigeración',
      'mantenimiento aire': 'técnico en refrigeración',
      'carga de gas': 'técnico en refrigeración',
      'refrigeración': 'técnico en refrigeración',
      'climatización': 'técnico en refrigeración',
      
      // Mecánico - ESPECÍFICO
      'mecánico para revisión general del auto': 'mecánico',
      'mecánico para revisión del auto': 'mecánico',
      'mecánico para revisión': 'mecánico',
      'revisión general del auto': 'mecánico',
      'revisión del auto': 'mecánico',
      'service de auto': 'mecánico',
      'cambio de aceite': 'mecánico',
      'frenos': 'mecánico',
      'embrague': 'mecánico',
      'suspensión': 'mecánico',
      'alineación': 'mecánico',
      'balanceo': 'mecánico',
      'motor': 'mecánico',
      'auto no arranca': 'mecánico',
      'auto no anda': 'mecánico',
      'ruido en el auto': 'mecánico',
      'ruido en el motor': 'mecánico',
      'taller mecánico': 'mecánico',
      'mecánico': 'mecánico',
      'mecánica': 'mecánico',
      'gomería': 'mecánico',
      'neumáticos': 'mecánico',
      'coche': 'mecánico',
      'auto': 'mecánico',
      'vehículo': 'mecánico',
      
      // Limpieza - ESPECÍFICO
      'limpieza profunda de casa': 'limpieza',
      'limpieza profunda': 'limpieza',
      'limpieza de casa': 'limpieza',
      'limpieza a fondo': 'limpieza',
      'limpieza general': 'limpieza',
      'limpiar casa': 'limpieza',
      'servicio de limpieza': 'limpieza',
      'empleada doméstica': 'limpieza',
      'mucama': 'limpieza',
      'limpieza de oficina': 'limpieza',
      'limpieza de departamento': 'limpieza',
      'limpieza': 'limpieza',
      'limpiar': 'limpieza',
      
      // Otros servicios comunes
      'pintor': 'pintor',
      'pintura': 'pintor',
      'pintar casa': 'pintor',
      'pintar pared': 'pintor',
      'carpintero': 'carpintero',
      'carpintería': 'carpintero',
      'muebles': 'carpintero',
      'albañil': 'albañil',
      'albañilería': 'albañil',
      'construcción': 'albañil',
      'jardinero': 'jardinero',
      'jardín': 'jardinero',
      'cortar pasto': 'jardinero',
      'poda': 'jardinero',
      'cerrajero': 'cerrajero',
      'cerradura': 'cerrajero',
      'llave': 'cerrajero',
      'mudanza': 'mudanzas',
      'mudar': 'mudanzas',
      'fletes': 'mudanzas',
      'técnico': 'técnico',
      'reparación': 'técnico',
      'arreglar': 'técnico',
      'instalador': 'instalador',
      'instalar': 'instalador',
      'instalación': 'instalador',
      'mantenimiento': 'mantenimiento',
    };

    // Buscar coincidencias, priorizando las más largas (más específicas)
    const matches: Array<{service: string, length: number}> = [];
    
    for (const [problem, service] of Object.entries(problemMappings)) {
      if (lowercaseQuery.includes(problem)) {
        matches.push({ service, length: problem.length });
      }
    }
    
    // Ordenar por longitud descendente (más específico primero)
    matches.sort((a, b) => b.length - a.length);
    
    // Si encontramos coincidencias, retornar la más específica
    if (matches.length > 0) {
      return matches[0].service;
    }

    // Si no hay coincidencias directas, extraer palabras clave
    const stopWords = ['para', 'con', 'sin', 'del', 'que', 'esta', 'este', 'esa', 'ese', 
                       'los', 'las', 'una', 'uno', 'por', 'como', 'necesito', 'busco', 
                       'quiero', 'urgente', 'rápido'];
    const words = query.toLowerCase().split(/\s+/);
    const keyWords = words.filter(word => 
      word.length > 3 && !stopWords.includes(word)
    );

    // Retornar las 2 palabras clave más relevantes o la query original
    return keyWords.slice(0, 2).join(' ') || query;
  };

  return {
    searchWithAI,
    generateSuggestions,
    analyzeIntent,
    generatePersonalizedRecommendations,
    intelligentSearch,
    isLoading,
    error
  };
};