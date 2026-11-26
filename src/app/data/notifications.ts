import { useEffect, useId } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string | null;
  read: boolean | null;
  booking_id: string | null;
  created_at: string | null;
}

const key = (userId?: string) => ['notifications', userId] as const;

export function useNotifications() {
  const { user } = useAuth();
  const userId = user?.id;

  const query = useQuery({
    queryKey: key(userId),
    enabled: !!userId,
    queryFn: async (): Promise<AppNotification[]> => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  const unread = (query.data ?? []).filter((n) => !n.read).length;
  return { ...query, unread };
}

/** Mount once per app shell: pops a toast and refreshes when a notification arrives. */
export function useNotificationsLive() {
  const { user } = useAuth();
  const userId = user?.id;
  const qc = useQueryClient();
  const channelId = useId();

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`app-notifications-${userId}-${channelId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          const n = payload.new as AppNotification;
          toast(n.title, { description: n.message });
          qc.invalidateQueries({ queryKey: key(userId) });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, qc]);
}

export function useMarkRead() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | 'all') => {
      let q = supabase.from('notifications').update({ read: true });
      q = id === 'all' ? q.eq('user_id', user!.id).eq('read', false) : q.eq('id', id);
      const { error } = await q;
      if (error) throw error;
    },
    onMutate: (id) => {
      qc.setQueryData<AppNotification[]>(key(user?.id), (old) =>
        old?.map((n) => (id === 'all' || n.id === id ? { ...n, read: true } : n)),
      );
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key(user?.id) }),
  });
}

/** Rough kind of notification, from its type or wording. */
export function notificationKind(n: AppNotification): 'offer' | 'approved' | 'cancelled' | 'info' {
  const t = `${n.type ?? ''} ${n.title}`.toLowerCase();
  if (t.includes('cancel')) return 'cancelled';
  if (t.includes('approv') || t.includes('confirm')) return 'approved';
  if (t.includes('new') || t.includes('booking') || t.includes('offer')) return 'offer';
  return 'info';
}
