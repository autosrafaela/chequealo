import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// UUID validation helper
const isUUID = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

// Fetch professional data
const fetchProfessional = async (id: string) => {
  if (!id || !isUUID(id)) {
    throw new Error('Invalid professional ID');
  }

  // Primero obtener datos públicos de la vista
  const { data: viewData, error: viewError } = await supabase
    .from('professionals_with_contact')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (viewError) throw viewError;
  if (!viewData) return null;

  // Obtener el slug de la tabla principal (no está en la vista)
  const { data: slugData } = await supabase
    .from('professionals')
    .select('slug')
    .eq('id', id)
    .maybeSingle();

  // Obtener profesiones personalizadas de la tabla professional_professions
  const { data: professionsData } = await supabase
    .from('professional_professions')
    .select('id, profession, is_primary')
    .eq('professional_id', id)
    .order('is_primary', { ascending: false });

  return {
    ...viewData,
    slug: slugData?.slug || null,
    professions: professionsData || []
  };
};

// Fetch professional services
const fetchServices = async (id: string) => {
  if (!id || !isUUID(id)) return [];

  const { data, error } = await supabase
    .from('professional_services')
    .select('*')
    .eq('professional_id', id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Fetch reviews with profiles
const fetchReviews = async (id: string) => {
  if (!id || !isUUID(id)) return [];

  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles:user_id (full_name, avatar_url),
      review_responses (*)
    `)
    .eq('professional_id', id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Fetch work photos
const fetchWorkPhotos = async (id: string) => {
  if (!id || !isUUID(id)) return [];

  const { data, error } = await supabase
    .from('work_photos')
    .select('*')
    .eq('professional_id', id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const useProfessionalProfile = (professionalId: string | undefined) => {
  const id = professionalId || '';

  // Professional data - cached for 5 minutes
  const { 
    data: professional, 
    isLoading: loadingProfessional,
    error: professionalError 
  } = useQuery({
    queryKey: ['professional', id],
    queryFn: () => fetchProfessional(id),
    enabled: !!id && isUUID(id),
    staleTime: 5 * 60 * 1000,
  });

  // Services - cached for 5 minutes
  const { 
    data: services = [], 
    isLoading: loadingServices 
  } = useQuery({
    queryKey: ['professional-services', id],
    queryFn: () => fetchServices(id),
    enabled: !!id && isUUID(id),
    staleTime: 5 * 60 * 1000,
  });

  // Reviews - cached for 2 minutes (more dynamic)
  const { 
    data: reviews = [], 
    isLoading: loadingReviews,
    refetch: refetchReviews 
  } = useQuery({
    queryKey: ['professional-reviews', id],
    queryFn: () => fetchReviews(id),
    enabled: !!id && isUUID(id),
    staleTime: 2 * 60 * 1000,
  });

  // Work photos - cached for 5 minutes
  const { 
    data: workPhotos = [], 
    isLoading: loadingPhotos 
  } = useQuery({
    queryKey: ['professional-photos', id],
    queryFn: () => fetchWorkPhotos(id),
    enabled: !!id && isUUID(id),
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = loadingProfessional || loadingServices || loadingReviews || loadingPhotos;
  const isValidId = !!id && isUUID(id);

  return {
    professional,
    services,
    reviews,
    workPhotos,
    isLoading,
    isValidId,
    error: professionalError,
    refetchReviews,
  };
};
