import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { getPhotoUrl } from './useProfile';
import { useEffect } from 'react';

export interface MatchWithProfile {
  id: string;
  matched_at: string;
  other_user_id: string;
  profile: {
    display_name: string | null;
    bio: string | null;
    age: number | null;
  };
  photo: string | null;
  unread_count: number;
}

export const useMatches = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Subscribe to realtime match updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('matches-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['matches'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return useQuery({
    queryKey: ['matches', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get all matches for user
      const { data: matches, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('matched_at', { ascending: false });

      if (error) throw error;

      // Get profile info and unread count for each match
      const matchesWithProfiles = await Promise.all(
        (matches || []).map(async (match) => {
          const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;

          // Get profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, bio, age')
            .eq('user_id', otherUserId)
            .single();

          // Get primary photo
          const { data: photo } = await supabase
            .from('user_photos')
            .select('storage_path')
            .eq('user_id', otherUserId)
            .order('is_primary', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Get unread message count
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('match_id', match.id)
            .neq('sender_id', user.id)
            .is('read_at', null);

          return {
            id: match.id,
            matched_at: match.matched_at,
            other_user_id: otherUserId,
            profile: profile || { display_name: null, bio: null, age: null },
            photo: photo ? getPhotoUrl(photo.storage_path) : null,
            unread_count: count || 0,
          } as MatchWithProfile;
        })
      );

      return matchesWithProfiles;
    },
    enabled: !!user,
  });
};
