import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count: number;
  max?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

export const NotificationBadge = ({ 
  count, 
  max = 99, 
  className,
  size = 'md',
  pulse = false
}: NotificationBadgeProps) => {
  if (count === 0) return null;

  const displayCount = count > max ? `${max}+` : count;
  
  const sizeClasses = {
    sm: 'min-w-4 h-4 text-[10px] px-1',
    md: 'min-w-5 h-5 text-xs px-1.5',
    lg: 'min-w-6 h-6 text-sm px-2'
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center justify-center font-bold rounded-full",
        "bg-destructive text-destructive-foreground",
        sizeClasses[size],
        pulse && "animate-pulse",
        className
      )}
    >
      {displayCount}
    </span>
  );
};
