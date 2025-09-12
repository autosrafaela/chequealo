import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserRole = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkUserRoles();
    } else {
      setIsAdmin(false);
      setIsModerator(false);
      setLoading(false);
    }
  }, [user]);

  const checkUserRoles = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Check admin role
      const { data: adminCheck } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });
      
      // Check moderator role
      const { data: moderatorCheck } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'moderator' });

      setIsAdmin(!!adminCheck);
      setIsModerator(!!moderatorCheck);
    } catch (error) {
      console.error('Error checking user roles:', error);
      setIsAdmin(false);
      setIsModerator(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    isAdmin,
    isModerator,
    loading,
    refetch: checkUserRoles
  };
};