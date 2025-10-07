import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

interface VerificationBadgeProps {
  verified: boolean;
  className?: string;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ verified, className = "" }) => {
  if (!verified) return null;

  return (
    <Badge 
      variant="secondary" 
      className={`bg-emerald-500 text-white hover:bg-emerald-600 ${className}`}
    >
      <Shield className="h-3 w-3 mr-1" />
      Verificado
    </Badge>
  );
};

export default VerificationBadge;