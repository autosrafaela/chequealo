import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageLoader } from '@/components/ui/page-loader';
import { generateAutoSlug } from '@/utils/autoSlug';
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
  // Rutas adicionales del sistema
  'inicio',
  'home',
  'principal',
  'index',
  'buscar',
  'contacto',
  'contact',
  'ayuda',
  'help',
  'perfil',
  'profile',
  'configuracion',
  'settings',
  '404',
  'api',
  'forgot-password',
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

      if (professional) {
        return { id: professional.id, isUuid: false, slug: professional.slug };
      }

      // No encontrado por slug exacto: intentar resolver como auto-slug
      // Buscar profesionales y comparar auto-slug generado
      const { data: allProfessionals, error: allError } = await supabase
        .from('professionals')
        .select('id, profession, full_name, location, slug')
        .is('slug', null)
        .eq('is_blocked', false);

      if (allError) {
        console.error('Error searching by auto-slug:', allError);
        throw allError;
      }

      const normalizedSlug = slug.toLowerCase();
      const matched = allProfessionals?.find(p => {
        const autoSlug = generateAutoSlug(p.profession, p.full_name, p.location);
        return autoSlug === normalizedSlug;
      });

      if (!matched) {
        throw new Error('Professional not found');
      }

      return { id: matched.id, isUuid: false, slug: null };
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
