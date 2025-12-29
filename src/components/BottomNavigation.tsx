import { Home, Search, MessageCircle, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const tabs = [
  { icon: Home, label: 'Inicio', path: '/' },
  { icon: Search, label: 'Explorar', path: '/search' },
  { icon: MessageCircle, label: 'Mensajes', path: '/mensajes' },
  { icon: User, label: 'Perfil', path: '/user-dashboard' }
];

export const BottomNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('unread_count_user, unread_count_professional, user_id, professional_id')
        .or(`user_id.eq.${user.id},professional_id.eq.${user.id}`)
        .eq('status', 'active');

      if (!error && data) {
        const total = data.reduce((acc, conv) => {
          if (conv.user_id === user.id) {
            return acc + (conv.unread_count_user || 0);
          } else {
            return acc + (conv.unread_count_professional || 0);
          }
        }, 0);
        setUnreadCount(total);
      }
    };

    fetchUnreadCount();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('bottom-nav-unread')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'conversations' },
        () => fetchUnreadCount()
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => fetchUnreadCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const showBadge = tab.path === '/mensajes' && unreadCount > 0;
          
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <tab.icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 h-4 min-w-4 px-1 flex items-center justify-center text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
