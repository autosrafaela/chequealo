import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionTileProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  badge?: number | string;
  badgeVariant?: 'default' | 'destructive' | 'secondary';
  onClick: () => void;
  className?: string;
}

export function QuickActionTile({
  icon: Icon,
  label,
  description,
  badge,
  badgeVariant = 'default',
  onClick,
  className,
}: QuickActionTileProps) {
  return (
    <Card 
      className={cn(
        'cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-2 hover:border-primary/30 relative overflow-hidden group',
        className
      )}
      onClick={onClick}
    >
      {/* Badge */}
      {badge !== undefined && badge !== 0 && (
        <Badge 
          variant={badgeVariant}
          className="absolute -top-1 -right-1 min-w-[22px] h-[22px] flex items-center justify-center text-xs font-bold rounded-full z-10"
        >
          {badge}
        </Badge>
      )}
      
      <CardContent className="p-5 flex flex-col items-center text-center gap-3">
        <div className="p-3 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
          <Icon className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
        </div>
        
        <div>
          <p className="font-semibold text-sm text-foreground">
            {label}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
