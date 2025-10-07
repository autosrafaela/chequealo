import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, TrendingUp, Heart, Star } from 'lucide-react';

interface ReviewManagementCardProps {
  totalReviews: number;
  averageRating: number;
  pendingResponses: number;
  totalLikes: number;
  onNavigateToReviews: () => void;
}

export const ReviewManagementCard = ({
  totalReviews,
  averageRating,
  pendingResponses,
  totalLikes,
  onNavigateToReviews
}: ReviewManagementCardProps) => {
  return (
    <Card 
      className="hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]"
      onClick={onNavigateToReviews}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-2">Gestión de Reseñas</h3>
            <p className="text-sm text-muted-foreground">
              Responde y gestiona las opiniones
            </p>
          </div>
          <MessageSquare className="h-8 w-8 text-blue-500" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-lg font-bold">{totalReviews}</span>
              <Star className="h-4 w-4 text-yellow-400" />
            </div>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-lg font-bold">{averageRating.toFixed(1)}</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground">Promedio</p>
          </div>
        </div>

        {pendingResponses > 0 && (
          <Badge variant="destructive" className="mt-3 w-full justify-center">
            {pendingResponses} sin responder
          </Badge>
        )}

        <Button 
          asChild 
          className="w-full mt-4" 
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onNavigateToReviews();
          }}
        >
          <span>Gestionar Reseñas</span>
        </Button>
      </CardContent>
    </Card>
  );
};