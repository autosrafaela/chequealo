import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageLoader } from '@/components/ui/page-loader';
import NotFound from './NotFound';

// Regex para validar UUID
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Rutas reservadas del sistema que no pueden ser slugs
const RESERVED_SLUGS = [
  'admin',
  'dashboard',
  'login',
  'auth',
  'register',
  'verification',
  'search',
  'ai-search',
  'mensajes',
  'messages',
  'user-dashboard',
  'professional',
  'pricing',
  'planes',
  'terms',
  'privacy',
  'instalar',
  'install',
  'faq',
  'how-it-works',
  'test-results',
  'urgencias',
  'promo',
  'sena',
  'mis-reservas',
  'solicitudes-reservas',
  'p', // Para rutas SEO /p/:profession/:location/:name
];

const ProfessionalProfileBySlug = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['professional-by-slug', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No slug provided');

      // Si es una ruta reservada, no buscar profesional
      if (RESERVED_SLUGS.includes(slug.toLowerCase())) {
        throw new Error('Reserved route');
      }

      // Si parece un UUID, redirigir directamente
      if (UUID_REGEX.test(slug)) {
        return { id: slug, isUuid: true, slug: null };
      }

      // Buscar por slug
      const { data: professional, error } = await supabase
        .from('professionals')
        .select('id, slug')
        .eq('slug', slug.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error('Error fetching professional by slug:', error);
        throw error;
      }

      if (!professional) {
        throw new Error('Professional not found');
      }

      return { id: professional.id, isUuid: false, slug: professional.slug };
    },
    enabled: !!slug && !RESERVED_SLUGS.includes(slug?.toLowerCase() || ''),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Si es una ruta reservada, mostrar 404 (React Router debería haberla manejado)
  if (slug && RESERVED_SLUGS.includes(slug.toLowerCase())) {
    return <NotFound />;
  }

  if (isLoading) {
    return <PageLoader />;
  }

  if (error || !data) {
    return <NotFound />;
  }

  // Redirigir a la ruta del profesional con el ID
  return <Navigate to={`/professional/${data.id}`} replace />;
};

export default ProfessionalProfileBySlug;
