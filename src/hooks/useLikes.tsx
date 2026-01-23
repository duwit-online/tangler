import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { getPhotoUrl } from './useProfile';
import { DiscoverProfile } from './useSwipes';

export interface LikeProfile extends DiscoverProfile {
  swipe_id: string;
  liked_at: string;
  direction: 'like' | 'superlike';
}

// Get profiles who liked the current user (premium feature)
export const useWhoLikedMe = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['who-liked-me', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get swipes where others liked me
      const { data: swipes, error } = await supabase
        .from('swipes')
        .select('id, swiper_id, direction, created_at')
        .eq('swiped_id', user.id)
        .in('direction', ['like', 'superlike'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter out users I've already swiped on
      const { data: mySwipes } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);

      const mySwipedIds = mySwipes?.map(s => s.swiped_id) || [];
      const pendingLikes = swipes?.filter(s => !mySwipedIds.includes(s.swiper_id)) || [];

      // Get profiles for each like
      const profilesWithPhotos = await Promise.all(
        pendingLikes.map(async (swipe) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', swipe.swiper_id)
            .single();

          if (!profile) return null;

          const { data: photos } = await supabase
            .from('user_photos')
            .select('storage_path')
            .eq('user_id', swipe.swiper_id)
            .order('display_order', { ascending: true });

          return {
            ...profile,
            photos: photos?.map(p => getPhotoUrl(p.storage_path)) || [],
            distance: Math.floor(Math.random() * 15) + 1,
            swipe_id: swipe.id,
            liked_at: swipe.created_at,
            direction: swipe.direction as 'like' | 'superlike',
          } as LikeProfile;
        })
      );

      return profilesWithPhotos.filter((p): p is LikeProfile => p !== null && p.photos.length > 0);
    },
    enabled: !!user,
  });
};

// Get profiles I liked (pending - not yet matched)
export const useWhoILiked = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['who-i-liked', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get my likes
      const { data: swipes, error } = await supabase
        .from('swipes')
        .select('id, swiped_id, direction, created_at')
        .eq('swiper_id', user.id)
        .in('direction', ['like', 'superlike'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter out matches
      const { data: matches } = await supabase
        .from('matches')
        .select('user1_id, user2_id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      const matchedUserIds = matches?.map(m => 
        m.user1_id === user.id ? m.user2_id : m.user1_id
      ) || [];

      const pendingLikes = swipes?.filter(s => !matchedUserIds.includes(s.swiped_id)) || [];

      // Get profiles for each like
      const profilesWithPhotos = await Promise.all(
        pendingLikes.map(async (swipe) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', swipe.swiped_id)
            .single();

          if (!profile) return null;

          const { data: photos } = await supabase
            .from('user_photos')
            .select('storage_path')
            .eq('user_id', swipe.swiped_id)
            .order('display_order', { ascending: true });

          return {
            ...profile,
            photos: photos?.map(p => getPhotoUrl(p.storage_path)) || [],
            distance: Math.floor(Math.random() * 15) + 1,
            swipe_id: swipe.id,
            liked_at: swipe.created_at,
            direction: swipe.direction as 'like' | 'superlike',
          } as LikeProfile;
        })
      );

      return profilesWithPhotos.filter((p): p is LikeProfile => p !== null && p.photos.length > 0);
    },
    enabled: !!user,
  });
};

// Like back a user who liked me
export const useLikeBack = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      direction = 'like' 
    }: { 
      userId: string; 
      direction?: 'like' | 'superlike';
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: userId,
          direction,
        })
        .select()
        .single();

      if (error) throw error;

      // Check if there's a new match
      const { data: match } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('matched_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return { swipe: data, match };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['who-liked-me'] });
      queryClient.invalidateQueries({ queryKey: ['who-i-liked'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['discover-profiles'] });
    },
  });
};

// Get new matches from this week
export const useNewMatchesThisWeek = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['new-matches-week', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: matches, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .gte('matched_at', oneWeekAgo.toISOString())
        .order('matched_at', { ascending: false });

      if (error) throw error;

      // Get profiles for each match
      const profilesWithPhotos = await Promise.all(
        (matches || []).map(async (match) => {
          const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;

          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', otherUserId)
            .single();

          if (!profile) return null;

          const { data: photos } = await supabase
            .from('user_photos')
            .select('storage_path')
            .eq('user_id', otherUserId)
            .order('display_order', { ascending: true });

          return {
            ...profile,
            photos: photos?.map(p => getPhotoUrl(p.storage_path)) || [],
            distance: Math.floor(Math.random() * 15) + 1,
            matchId: match.id,
            matchedAt: match.matched_at,
          } as DiscoverProfile & { matchId: string; matchedAt: string };
        })
      );

      return profilesWithPhotos.filter((p) => p !== null && p.photos.length > 0);
    },
    enabled: !!user,
  });
};
