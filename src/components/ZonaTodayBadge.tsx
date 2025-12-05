import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ZonaTodayBadgeProps {
  neighborhoods?: string[];
  compact?: boolean;
}

export const ZonaTodayBadge = ({ neighborhoods, compact = false }: ZonaTodayBadgeProps) => {
  if (compact) {
    return (
      <Badge className="bg-amber-500 text-black font-semibold text-xs animate-pulse">
        <MapPin className="h-3 w-3 mr-1" />
        En tu zona hoy
      </Badge>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-lg p-2">
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
        <MapPin className="h-4 w-4 animate-bounce" />
        <span className="font-semibold text-sm">En tu zona hoy</span>
      </div>
      {neighborhoods && neighborhoods.length > 0 && (
        <p className="text-xs text-muted-foreground mt-1 truncate">
          {neighborhoods.slice(0, 3).join(', ')}
          {neighborhoods.length > 3 && ` +${neighborhoods.length - 3}`}
        </p>
      )}
    </div>
  );
};
