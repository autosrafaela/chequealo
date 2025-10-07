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
    
    // Common problem-to-service mappings - orden importa, más específicos primero
    const problemMappings: Record<string, string> = {
      // Aire acondicionado - específico
      'aire acondicionado': 'aire acondicionado',
      'aire no funciona': 'aire acondicionado',
      'aire no enfría': 'aire acondicionado',
      'aire no anda': 'aire acondicionado',
      'aire roto': 'aire acondicionado',
      'split': 'aire acondicionado',
      
      // Problemas generales
      'no enfría': 'refrigeración',
      'no calienta': 'calefacción',
      'no funciona bien': 'reparación',
      'no funciona': 'reparación',
      'no anda': 'reparación',
      
      // Electricidad
      'luz': 'electricista',
      'electricidad': 'electricista',
      'cable': 'electricista',
      'corte de luz': 'electricista',
      'no enciende': 'electricista',
      
      // Plomería
      'gotea': 'plomero',
      'canilla': 'plomero',
      'caño': 'plomero',
      'agua': 'plomero',
      'inodoro': 'plomero',
      'baño': 'plomero',
      
      // General
      'ruido extraño': 'reparación',
      'se rompió': 'reparación',
      'roto': 'reparación',
      'instalación': 'instalador',
      'instalar': 'instalador',
      'mantenimiento': 'mantenimiento',
      'limpieza': 'limpieza',
      'limpiar': 'limpieza',
      'pintar': 'pintor',
      'pintura': 'pintor',
      'arreglar': 'reparación',
      
      // Automotor
      'auto': 'mecánico',
      'coche': 'mecánico',
      'vehículo': 'mecánico',
      'motor': 'mecánico',
      'mecánico': 'mecánico',
      'revisión': 'mecánico'
    };

    // Find the best matching service/profession
    let bestMatch = '';
    let longestMatch = 0;
    
    for (const [problem, service] of Object.entries(problemMappings)) {
      if (lowercaseQuery.includes(problem) && problem.length > longestMatch) {
        bestMatch = service;
        longestMatch = problem.length;
      }
    }

    // If we found a match, return just that service term
    if (bestMatch) {
      return bestMatch;
    }

    // Otherwise, extract key nouns from the query
    const words = query.toLowerCase().split(/\s+/);
    const keyWords = words.filter(word => 
      word.length > 3 && 
      !['para', 'con', 'sin', 'del', 'que', 'esta', 'este', 'esta', 'ese', 'esa'].includes(word)
    );

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