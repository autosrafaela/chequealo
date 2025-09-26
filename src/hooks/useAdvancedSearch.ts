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
      let baseQuery = supabase
        .from('professionals')
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
        .eq('is_blocked', false);

      // If there's a search query, we need to handle it differently
      let searchResults: any[] = [];
      
      if (query.trim()) {
        const searchTerm = query.trim().toLowerCase();
        
        // Search in profession first (most relevant)
        const { data: professionResults } = await baseQuery
          .ilike('profession', `%${searchTerm}%`);
        
        // Search in full name
        const { data: nameResults } = await baseQuery
          .ilike('full_name', `%${searchTerm}%`);
        
        // Search in description
        const { data: descriptionResults } = await baseQuery
          .ilike('description', `%${searchTerm}%`);
        
        // Combine results and remove duplicates
        const allResults = [
          ...(professionResults || []),
          ...(nameResults || []),
          ...(descriptionResults || [])
        ];
        
        // Remove duplicates by id
        const uniqueResults = allResults.filter((item, index, self) => 
          index === self.findIndex(t => t.id === item.id)
        );
        
        searchResults = uniqueResults;
      } else {
        // No search query, get all professionals
        const { data } = await baseQuery;
        searchResults = data || [];
      }

      // Apply additional filters
      let filteredResults = searchResults;
      
      if (currentFilters.profession) {
        filteredResults = filteredResults.filter(item => 
          item.profession.toLowerCase().includes(currentFilters.profession!.toLowerCase())
        );
      }
      if (currentFilters.location) {
        filteredResults = filteredResults.filter(item => 
          item.location?.toLowerCase().includes(currentFilters.location!.toLowerCase())
        );
      }
      if (currentFilters.rating) {
        filteredResults = filteredResults.filter(item => 
          (item.rating || 0) >= currentFilters.rating!
        );
      }
      if (currentFilters.verified !== undefined) {
        filteredResults = filteredResults.filter(item => 
          item.is_verified === currentFilters.verified
        );
      }
      if (currentFilters.availability) {
        filteredResults = filteredResults.filter(item => 
          item.availability === currentFilters.availability
        );
      }

      // Apply sorting
      if (currentFilters.sortBy) {
        const ascending = currentFilters.sortOrder === 'asc';
        filteredResults.sort((a, b) => {
          let aValue, bValue;
          
          if (currentFilters.sortBy === 'rating') {
            aValue = a.rating || 0;
            bValue = b.rating || 0;
          } else if (currentFilters.sortBy === 'reviews') {
            aValue = a.review_count || 0;
            bValue = b.review_count || 0;
          } else {
            aValue = a.rating || 0;
            bValue = b.rating || 0;
          }
          
          return ascending ? aValue - bValue : bValue - aValue;
        });
      } else {
        // Default sorting by rating desc
        filteredResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }

      // Map data to Professional interface
      const mappedData: Professional[] = filteredResults.map(item => ({
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