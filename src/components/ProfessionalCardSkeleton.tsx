import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfessionalCardSkeletonProps {
  compact?: boolean;
}

export const ProfessionalCardSkeleton = ({ compact = false }: ProfessionalCardSkeletonProps) => (
  <Card className="overflow-hidden">
    <CardContent className={compact ? "p-4" : "p-6"}>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
        
        <div className="flex-1 min-w-0 space-y-2">
          {/* Name */}
          <Skeleton className="h-5 w-3/4" />
          
          {/* Profession */}
          <Skeleton className="h-4 w-1/2" />
          
          {/* Rating */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          
          {/* Location */}
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      
      {!compact && (
        <>
          {/* Description */}
          <div className="mt-4 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
          
          {/* Buttons */}
          <div className="flex gap-2 mt-4">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
          </div>
        </>
      )}
      
      {compact && (
        <div className="mt-3">
          <Skeleton className="h-8 w-full" />
        </div>
      )}
    </CardContent>
  </Card>
);

export default ProfessionalCardSkeleton;
