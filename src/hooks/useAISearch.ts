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
    
    // Common problem-to-service mappings
    const problemMappings: Record<string, string> = {
      'no enfría': 'técnico aire acondicionado refrigeración',
      'no calienta': 'técnico calefacción termotanque',
      'gotea': 'plomero filtración caño',
      'no enciende': 'electricista reparación',
      'ruido extraño': 'técnico reparación mantenimiento',
      'no funciona': 'técnico reparación',
      'se rompió': 'reparación técnico',
      'instalación': 'instalador técnico',
      'mantenimiento': 'técnico mantenimiento',
      'limpieza': 'servicio limpieza',
      'pintar': 'pintor pintura',
      'arreglar': 'reparación técnico'
    };

    // Location extraction
    const locationKeywords = [
      'en casa', 'a domicilio', 'en oficina', 'en local',
      'zona norte', 'zona sur', 'centro', 'barrio'
    ];

    // Urgency detection
    const urgencyKeywords = [
      'urgente', 'rápido', 'hoy', 'ya', 'emergencia', 'ahora'
    ];

    let enhancedQuery = query;

    // Find problem mappings
    for (const [problem, service] of Object.entries(problemMappings)) {
      if (lowercaseQuery.includes(problem)) {
        enhancedQuery = service + ' ' + enhancedQuery;
        break;
      }
    }

    // Add urgency flag
    const isUrgent = urgencyKeywords.some(keyword => 
      lowercaseQuery.includes(keyword)
    );
    
    if (isUrgent) {
      enhancedQuery = 'urgente ' + enhancedQuery;
    }

    return enhancedQuery;
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