import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  created_at: string;
  profiles?: {
    full_name?: string | null;
    avatar_url?: string | null;
  } | null;
  // Handle Supabase query error type
  [key: string]: any;
}

interface ProfileReviewCardProps {
  review: Review;
}

export function ProfileReviewCard({ review }: ProfileReviewCardProps) {
  const authorName = review.profiles?.full_name || 'Usuario';
  const authorAvatar = review.profiles?.avatar_url;
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="p-4 bg-muted/30 rounded-xl border border-border">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={authorAvatar || undefined} alt={authorName} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {getInitials(authorName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground text-sm">{authorName}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: es })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star 
              key={i} 
              className={`w-3.5 h-3.5 ${
                i < review.rating 
                  ? 'text-warning fill-current' 
                  : 'text-muted-foreground/30'
              }`} 
            />
          ))}
        </div>
      </div>
      {review.comment && (
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {review.comment}
        </p>
      )}
    </div>
  );
}
