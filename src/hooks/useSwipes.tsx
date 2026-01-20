import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Profile, getPhotoUrl } from './useProfile';

export interface DiscoverProfile extends Profile {
  photos: string[];
  distance?: number;
}

export const useDiscoverProfiles = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['discover-profiles', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get profiles the user hasn't swiped on yet
      const { data: swipedIds } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);

      const swipedUserIds = swipedIds?.map(s => s.swiped_id) || [];

      // Get all completed profiles except own and already swiped
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('onboarding_completed', true)
        .neq('user_id', user.id);

      if (error) throw error;

      // Filter out swiped profiles
      const unswiped = profiles?.filter(p => !swipedUserIds.includes(p.user_id)) || [];

      // Get photos for each profile
      const profilesWithPhotos = await Promise.all(
        unswiped.map(async (profile) => {
          const { data: photos } = await supabase
            .from('user_photos')
            .select('storage_path')
            .eq('user_id', profile.user_id)
            .order('display_order', { ascending: true });

          return {
            ...profile,
            photos: photos?.map(p => getPhotoUrl(p.storage_path)) || [],
            distance: Math.floor(Math.random() * 15) + 1, // Mock distance
          } as DiscoverProfile;
        })
      );

      return profilesWithPhotos.filter(p => p.photos.length > 0);
    },
    enabled: !!user,
  });
};

export const useSwipe = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      swipedId, 
      direction 
    }: { 
      swipedId: string; 
      direction: 'like' | 'pass' | 'superlike';
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: swipedId,
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
        .or(`user1_id.eq.${swipedId},user2_id.eq.${swipedId}`)
        .order('matched_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return { swipe: data, match };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discover-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
};
