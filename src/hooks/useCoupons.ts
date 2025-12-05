import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CouponValidation {
  valid: boolean;
  discount_percentage?: number;
  professional_id?: string;
  message: string;
}

export const useCoupons = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validateCoupon = async (code: string, professionalId?: string): Promise<CouponValidation> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lead_coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        return {
          valid: false,
          message: 'Cupón inválido o expirado',
        };
      }

      // Check if coupon is for specific professional
      if (professionalId && data.professional_id !== professionalId) {
        return {
          valid: false,
          message: 'Este cupón no es válido para este profesional',
        };
      }

      return {
        valid: true,
        discount_percentage: data.discount_percentage,
        professional_id: data.professional_id,
        message: `¡Cupón válido! ${data.discount_percentage}% de descuento`,
      };
    } catch (error) {
      console.error('Error validating coupon:', error);
      return {
        valid: false,
        message: 'Error al validar el cupón',
      };
    } finally {
      setLoading(false);
    }
  };

  const useCoupon = async (code: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('lead_coupons')
        .update({ used_at: new Date().toISOString() })
        .eq('code', code.toUpperCase())
        .is('used_at', null);

      if (error) throw error;

      // Mark lead as reengaged
      const { data: coupon } = await supabase
        .from('lead_coupons')
        .select('contact_request_id')
        .eq('code', code.toUpperCase())
        .single();

      if (coupon?.contact_request_id) {
        await supabase
          .from('contact_requests')
          .update({
            reengaged: true,
            reengaged_at: new Date().toISOString(),
          })
          .eq('id', coupon.contact_request_id);
      }

      toast({
        title: '¡Cupón aplicado!',
        description: 'El descuento se aplicó correctamente',
      });

      return true;
    } catch (error) {
      console.error('Error using coupon:', error);
      toast({
        title: 'Error',
        description: 'No se pudo aplicar el cupón',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    validateCoupon,
    useCoupon,
    loading,
  };
};
