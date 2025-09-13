import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Star, 
  MessageSquare, 
  Heart,
  ThumbsUp,
  Calendar,
  User,
  Reply,
  Send
} from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string;
  service_provided: string;
  created_at: string;
  user_id: string;
  is_verified: boolean;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface ReviewResponse {
  id: string;
  response: string;
  created_at: string;
}

interface ReviewLike {
  id: string;
  user_id: string;
}

interface ReviewWithExtras extends Review {
  review_responses?: ReviewResponse[];
  review_likes?: ReviewLike[];
  likes_count: number;
  has_response: boolean;
  user_liked: boolean;
}

export const ReviewManagementPanel = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithExtras[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [professionalId, setProfessionalId] = useState<string | null>(null);

  useEffect(() => {
    fetchProfessionalAndReviews();
  }, [user]);

  const fetchProfessionalAndReviews = async () => {
    if (!user) return;

    try {
      // Get professional profile
      const { data: professionalData, error: profError } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profError) throw profError;
      if (!professionalData) return;

      setProfessionalId(professionalData.id);

      // Get reviews with responses and likes
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('professional_id', professionalData.id)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      // Get user profiles
      const userIds = reviewsData?.map(r => r.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      // Get responses for each review
      const reviewIds = reviewsData?.map(r => r.id) || [];
      const { data: responsesData } = await supabase
        .from('review_responses')
        .select('*')
        .in('review_id', reviewIds);

      // Get likes for each review
      const { data: likesData } = await supabase
        .from('review_likes')
        .select('*')
        .in('review_id', reviewIds);

      // Process reviews data
      const processedReviews = reviewsData?.map(review => {
        const reviewResponses = responsesData?.filter(r => r.review_id === review.id) || [];
        const reviewLikes = likesData?.filter(l => l.review_id === review.id) || [];
        const userProfile = profilesData?.find(p => p.user_id === review.user_id);
        
        return {
          ...review,
          profiles: userProfile ? {
            full_name: userProfile.full_name || 'Usuario anónimo',
            avatar_url: userProfile.avatar_url
          } : { full_name: 'Usuario anónimo', avatar_url: undefined },
          review_responses: reviewResponses,
          review_likes: reviewLikes,
          likes_count: reviewLikes.length,
          has_response: reviewResponses.length > 0,
          user_liked: reviewLikes.some(like => like.user_id === user.id)
        };
      }) || [];

      setReviews(processedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Error al cargar las reseñas');
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (reviewId: string) => {
    if (!user) return;

    try {
      const review = reviews.find(r => r.id === reviewId);
      if (!review) return;

      if (review.user_liked) {
        // Remove like
        await supabase
          .from('review_likes')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', user.id);
      } else {
        // Add like
        await supabase
          .from('review_likes')
          .insert({
            review_id: reviewId,
            user_id: user.id
          });
      }

      // Update local state
      setReviews(prev => prev.map(r => 
        r.id === reviewId 
          ? {
              ...r,
              user_liked: !r.user_liked,
              likes_count: r.user_liked ? r.likes_count - 1 : r.likes_count + 1
            }
          : r
      ));

      toast.success(review.user_liked ? 'Me gusta removido' : 'Me gusta agregado');
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Error al actualizar me gusta');
    }
  };

  const submitResponse = async (reviewId: string) => {
    if (!responseText.trim() || !professionalId) return;

    try {
      const { error } = await supabase
        .from('review_responses')
        .insert({
          review_id: reviewId,
          professional_id: professionalId,
          response: responseText.trim()
        });

      if (error) throw error;

      toast.success('Respuesta enviada exitosamente');
      setRespondingTo(null);
      setResponseText('');
      fetchProfessionalAndReviews();
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Error al enviar la respuesta');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Cargando reseñas...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sin reseñas aún
          </h3>
          <p className="text-gray-500">
            Cuando recibas reseñas de tus clientes, aparecerán aquí para que puedas responderlas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Reseñas</h2>
          <p className="text-muted-foreground">
            Responde a las reseñas de tus clientes y muestra tu aprecio
          </p>
        </div>
        <Badge variant="secondary">
          {reviews.length} reseña{reviews.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid gap-6">
        {reviews.map((review) => (
          <Card key={review.id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {review.profiles?.full_name?.charAt(0) || <User className="h-5 w-5" />}
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      {review.profiles?.full_name || 'Usuario anónimo'}
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(review.rating)}</div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                      {review.is_verified && (
                        <Badge variant="secondary" className="text-xs">
                          Verificada
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(review.id)}
                    className={`flex items-center gap-1 ${
                      review.user_liked ? 'text-red-500' : 'text-muted-foreground'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${review.user_liked ? 'fill-current' : ''}`} />
                    <span className="text-xs">{review.likes_count}</span>
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {review.service_provided && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">{review.service_provided}</Badge>
                </div>
              )}

              {review.comment && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              )}

              {/* Existing Response */}
              {review.review_responses && review.review_responses.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Reply className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Tu respuesta:
                    </span>
                    <span className="text-xs text-blue-700">
                      {new Date(review.review_responses[0].created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-blue-800">{review.review_responses[0].response}</p>
                </div>
              )}

              {/* Response Actions */}
              {!review.has_response && (
                <div className="flex gap-2 pt-2">
                  {respondingTo === review.id ? (
                    <div className="w-full space-y-3">
                      <Textarea
                        placeholder="Escribe tu respuesta profesional..."
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => submitResponse(review.id)}
                          className="flex items-center gap-2"
                          size="sm"
                        >
                          <Send className="h-4 w-4" />
                          Enviar
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setRespondingTo(null);
                            setResponseText('');
                          }}
                          size="sm"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setRespondingTo(review.id)}
                      className="flex items-center gap-2"
                      size="sm"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Responder
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
