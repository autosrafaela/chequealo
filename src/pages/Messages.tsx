import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SquarePen } from 'lucide-react';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

// Color mapping for professional categories
const categoryColors: Record<string, string> = {
  'Salud': 'bg-emerald-500',
  'Hogar': 'bg-blue-500',
  'Legal': 'bg-purple-500',
  'Tecnología': 'bg-orange-500',
  'Educación': 'bg-pink-500',
  'Belleza': 'bg-rose-500',
  'Finanzas': 'bg-slate-500',
  'Transporte': 'bg-amber-500',
  'Gastronomía': 'bg-red-500',
  'Arte': 'bg-indigo-500',
  'Deporte': 'bg-green-500',
  'Mascotas': 'bg-teal-500',
};

const getCategoryColor = (profession: string | undefined): string => {
  if (!profession) return 'bg-primary';
  
  // Try to match profession to a category
  const lowerProfession = profession.toLowerCase();
  
  if (lowerProfession.includes('médic') || lowerProfession.includes('doctor') || lowerProfession.includes('enferm') || lowerProfession.includes('salud')) {
    return categoryColors['Salud'];
  }
  if (lowerProfession.includes('plomer') || lowerProfession.includes('electric') || lowerProfession.includes('carpint') || lowerProfession.includes('pintor')) {
    return categoryColors['Hogar'];
  }
  if (lowerProfession.includes('abogad') || lowerProfession.includes('legal') || lowerProfession.includes('notari')) {
    return categoryColors['Legal'];
  }
  if (lowerProfession.includes('programad') || lowerProfession.includes('técnic') || lowerProfession.includes('reparaci') || lowerProfession.includes('tecnolog')) {
    return categoryColors['Tecnología'];
  }
  if (lowerProfession.includes('profeso') || lowerProfession.includes('tutor') || lowerProfession.includes('clase') || lowerProfession.includes('educac')) {
    return categoryColors['Educación'];
  }
  if (lowerProfession.includes('estilis') || lowerProfession.includes('peluqu') || lowerProfession.includes('manicur') || lowerProfession.includes('belleza')) {
    return categoryColors['Belleza'];
  }
  if (lowerProfession.includes('contador') || lowerProfession.includes('financ') || lowerProfession.includes('banco')) {
    return categoryColors['Finanzas'];
  }
  
  return 'bg-primary';
};

const getCategoryLabel = (profession: string | undefined): string => {
  if (!profession) return 'General';
  
  const lowerProfession = profession.toLowerCase();
  
  if (lowerProfession.includes('médic') || lowerProfession.includes('doctor') || lowerProfession.includes('enferm') || lowerProfession.includes('salud')) {
    return 'Salud';
  }
  if (lowerProfession.includes('plomer') || lowerProfession.includes('electric') || lowerProfession.includes('carpint') || lowerProfession.includes('pintor')) {
    return 'Hogar';
  }
  if (lowerProfession.includes('abogad') || lowerProfession.includes('legal') || lowerProfession.includes('notari')) {
    return 'Legal';
  }
  if (lowerProfession.includes('programad') || lowerProfession.includes('técnic') || lowerProfession.includes('reparaci') || lowerProfession.includes('tecnolog')) {
    return 'Tecnología';
  }
  if (lowerProfession.includes('profeso') || lowerProfession.includes('tutor') || lowerProfession.includes('clase') || lowerProfession.includes('educac')) {
    return 'Educación';
  }
  if (lowerProfession.includes('estilis') || lowerProfession.includes('peluqu') || lowerProfession.includes('manicur') || lowerProfession.includes('belleza')) {
    return 'Belleza';
  }
  if (lowerProfession.includes('contador') || lowerProfession.includes('financ') || lowerProfession.includes('banco')) {
    return 'Finanzas';
  }
  
  return 'General';
};

const formatTimestamp = (dateString: string | null): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  
  if (isToday(date)) {
    return format(date, 'h:mm a');
  }
  if (isYesterday(date)) {
    return 'Ayer';
  }
  if (isThisWeek(date)) {
    return format(date, 'EEE', { locale: es });
  }
  return format(date, 'd MMM', { locale: es });
};

const getInitials = (name: string | undefined): string => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const Messages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversations, loading, setActiveConversationId } = useChat();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    
    const query = searchQuery.toLowerCase();
    return conversations.filter(conv => {
      const name = conv.professionals?.full_name || '';
      const profession = conv.professionals?.profession || '';
      return name.toLowerCase().includes(query) || profession.toLowerCase().includes(query);
    });
  }, [conversations, searchQuery]);

  const handleConversationClick = (conversationId: string) => {
    setActiveConversationId(conversationId);
    // Navigate to user dashboard with chat open
    navigate('/user-dashboard?tab=mensajes&chat=' + conversationId);
  };

  const handleNewMessage = () => {
    navigate('/search');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-16">
        <div className="text-center p-6">
          <p className="text-muted-foreground mb-4">Inicia sesión para ver tus mensajes</p>
          <button 
            onClick={() => navigate('/auth')}
            className="text-primary hover:underline"
          >
            Iniciar sesión
          </button>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold">Mensajes</h1>
          <button 
            onClick={handleNewMessage}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            aria-label="Nuevo mensaje"
          >
            <SquarePen className="h-5 w-5" />
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/50 border-0"
            />
          </div>
        </div>
      </header>

      {/* Conversations List */}
      <div className="divide-y divide-border">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-center">
              {searchQuery ? 'No se encontraron conversaciones' : 'No tienes mensajes aún'}
            </p>
            {!searchQuery && (
              <button 
                onClick={handleNewMessage}
                className="mt-4 text-primary hover:underline text-sm"
              >
                Buscar profesionales
              </button>
            )}
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            // Determine if the current user is the professional in this conversation
            const isUserTheProfessional = conversation.professional_id === user?.id;
            // Get professional info
            const professionalInfo = conversation.professionals;
            // For now, show professional name to users and "Usuario" to professionals
            const name = isUserTheProfessional 
              ? 'Usuario' 
              : (professionalInfo?.full_name || 'Profesional');
            const imageUrl = isUserTheProfessional 
              ? undefined 
              : professionalInfo?.image_url;
            const profession = professionalInfo?.profession;
            const unreadCount = isUserTheProfessional 
              ? conversation.unread_count_professional 
              : conversation.unread_count_user;
            const hasUnread = (unreadCount || 0) > 0;
            
            return (
              <button
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
              >
                {/* Avatar with category color */}
                <Avatar className={`h-12 w-12 ${getCategoryColor(profession)}`}>
                  <AvatarImage src={imageUrl || undefined} alt={name} />
                  <AvatarFallback className="text-white font-medium">
                    {getInitials(name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`font-semibold truncate ${hasUnread ? 'text-foreground' : 'text-foreground'}`}>
                        {name}
                      </span>
                      <Badge 
                        variant="secondary" 
                        className="text-[10px] px-1.5 py-0 h-4 shrink-0 bg-muted text-muted-foreground"
                      >
                        {getCategoryLabel(profession)}
                      </Badge>
                    </div>
                    <span className={`text-xs shrink-0 ${hasUnread ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {formatTimestamp(conversation.last_message_at)}
                    </span>
                  </div>
                  <p className={`text-sm truncate mt-0.5 ${hasUnread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {conversation.last_message_preview || 'Sin mensajes'}
                  </p>
                </div>
                
                {/* Unread indicator */}
                {hasUnread && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                )}
              </button>
            );
          })
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Messages;
