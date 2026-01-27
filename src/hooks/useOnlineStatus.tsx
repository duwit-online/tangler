import { useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Update user's last_seen timestamp
export const useUpdateLastSeen = () => {
  const { user } = useAuth();

  const updateLastSeen = useCallback(async () => {
    if (!user) return;

    await supabase
      .from('profiles')
      .update({ last_seen: new Date().toISOString() })
      .eq('user_id', user.id);
  }, [user]);

  // Update on mount and every 2 minutes
  useEffect(() => {
    if (!user) return;

    updateLastSeen();
    const interval = setInterval(updateLastSeen, 2 * 60 * 1000);

    // Update on visibility change
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        updateLastSeen();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user, updateLastSeen]);

  return updateLastSeen;
};

// Check if a user is online (active in last 5 minutes)
export const useIsUserOnline = (userId: string | null) => {
  return useQuery({
    queryKey: ['online-status', userId],
    queryFn: async () => {
      if (!userId) return false;

      const { data } = await supabase
        .from('profiles')
        .select('last_seen')
        .eq('user_id', userId)
        .single();

      if (!data?.last_seen) return false;

      const lastSeen = new Date(data.last_seen);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return lastSeen > fiveMinutesAgo;
    },
    enabled: !!userId,
    refetchInterval: 60 * 1000, // Refresh every minute
    staleTime: 30 * 1000,
  });
};

// Get online status for multiple users
export const useOnlineStatuses = (userIds: string[]) => {
  return useQuery({
    queryKey: ['online-statuses', userIds],
    queryFn: async () => {
      if (userIds.length === 0) return {};

      const { data } = await supabase
        .from('profiles')
        .select('user_id, last_seen')
        .in('user_id', userIds);

      const statuses: Record<string, boolean> = {};
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      (data || []).forEach((profile) => {
        if (profile.last_seen) {
          statuses[profile.user_id] = new Date(profile.last_seen) > fiveMinutesAgo;
        } else {
          statuses[profile.user_id] = false;
        }
      });

      return statuses;
    },
    enabled: userIds.length > 0,
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  });
};
