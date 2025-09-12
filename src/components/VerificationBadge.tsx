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
      className={`bg-green-100 text-green-800 hover:bg-green-200 ${className}`}
    >
      <Shield className="h-3 w-3 mr-1" />
      Verificado
    </Badge>
  );
};

export default VerificationBadge;