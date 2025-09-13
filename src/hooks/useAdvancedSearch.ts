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
  phone?: string;
  email: string;
  distance?: number;
}

export const useAdvancedSearch = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

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
      let supabaseQuery = supabase
        .from('professionals')
        .select('*');

      // Text search - search in name, profession, and description
      if (query.trim()) {
        supabaseQuery = supabaseQuery.or(`full_name.ilike.%${query}%,profession.ilike.%${query}%,description.ilike.%${query}%`);
      }

      // Apply filters
      if (currentFilters.profession) {
        supabaseQuery = supabaseQuery.ilike('profession', `%${currentFilters.profession}%`);
      }
      if (currentFilters.location) {
        supabaseQuery = supabaseQuery.ilike('location', `%${currentFilters.location}%`);
      }
      if (currentFilters.rating) {
        supabaseQuery = supabaseQuery.gte('rating', currentFilters.rating);
      }
      if (currentFilters.verified !== undefined) {
        supabaseQuery = supabaseQuery.eq('is_verified', currentFilters.verified);
      }
      if (currentFilters.availability) {
        supabaseQuery = supabaseQuery.eq('availability', currentFilters.availability);
      }

      // Apply sorting
      if (currentFilters.sortBy) {
        const ascending = currentFilters.sortOrder === 'asc';
        let orderColumn: string = currentFilters.sortBy;
        
        // Map sort options to actual column names
        if (currentFilters.sortBy === 'reviews') {
          orderColumn = 'review_count';
        } else if (currentFilters.sortBy === 'price') {
          // For now, we'll sort by rating since we don't have price in professionals table
          // In the future, you might want to join with professional_services for price sorting
          orderColumn = 'rating';
        }
        
        supabaseQuery = supabaseQuery.order(orderColumn as any, { ascending });
      } else {
        // Default sorting by rating desc
        supabaseQuery = supabaseQuery.order('rating', { ascending: false });
      }

      const { data, error } = await supabaseQuery;
      if (error) throw error;

      // Map data to Professional interface
      const mappedData: Professional[] = (data || []).map(item => ({
        id: item.id,
        full_name: item.full_name,
        profession: item.profession,
        location: item.location || '',
        description: item.description || '',
        rating: Number(item.rating || 0),
        review_count: item.review_count || 0,
        image_url: item.image_url,
        is_verified: item.is_verified,
        availability: item.availability || 'available',
        phone: item.phone,
        email: item.email
      }));

      setProfessionals(mappedData);
    } catch (error) {
      console.error('Error searching professionals:', error);
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

  const availableProfessions = useMemo(() => {
    return [...new Set(professionals.map(p => p.profession))].sort();
  }, [professionals]);

  const availableLocations = useMemo(() => {
    return [...new Set(professionals.map(p => p.location))].filter(Boolean).sort();
  }, [professionals]);

  useEffect(() => {
    searchProfessionals();
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