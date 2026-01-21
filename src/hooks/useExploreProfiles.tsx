import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { getPhotoUrl } from './useProfile';
import { DiscoverProfile } from './useSwipes';

export interface ExploreFilters {
  ageRange: [number, number];
  distance: number;
  gender: string | null;
  interests: string[];
}

export const defaultFilters: ExploreFilters = {
  ageRange: [18, 50],
  distance: 50,
  gender: null,
  interests: [],
};

const PAGE_SIZE = 10;

export const useExploreProfiles = (filters: ExploreFilters, category?: string) => {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ['explore-profiles', user?.id, filters, category],
    queryFn: async ({ pageParam = 0 }) => {
      if (!user) return { profiles: [], nextPage: null };

      // Get profiles the user hasn't swiped on yet
      const { data: swipedIds } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);

      const swipedUserIds = swipedIds?.map(s => s.swiped_id) || [];

      // Build query with filters
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('onboarding_completed', true)
        .neq('user_id', user.id);

      // Age filter
      if (filters.ageRange[0] > 18) {
        query = query.gte('age', filters.ageRange[0]);
      }
      if (filters.ageRange[1] < 50) {
        query = query.lte('age', filters.ageRange[1]);
      }

      // Gender filter
      if (filters.gender) {
        query = query.eq('gender', filters.gender);
      }

      // Interest filter (if category is provided, filter by that interest)
      if (category) {
        query = query.contains('interests', [category]);
      }

      // Pagination
      query = query
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1)
        .order('created_at', { ascending: false });

      const { data: profiles, error } = await query;

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

          // Mock distance based on filter (in real app, use geolocation)
          const mockDistance = Math.floor(Math.random() * filters.distance) + 1;

          return {
            ...profile,
            photos: photos?.map(p => getPhotoUrl(p.storage_path)) || [],
            distance: mockDistance,
          } as DiscoverProfile;
        })
      );

      const filtered = profilesWithPhotos.filter(p => {
        // Filter by distance
        if (p.distance && p.distance > filters.distance) return false;
        // Filter by interests if specified
        if (filters.interests.length > 0) {
          const hasMatchingInterest = filters.interests.some(
            interest => p.interests?.includes(interest)
          );
          if (!hasMatchingInterest) return false;
        }
        return p.photos.length > 0;
      });

      return {
        profiles: filtered,
        nextPage: profiles && profiles.length === PAGE_SIZE ? pageParam + 1 : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: !!user,
  });
};

export const useNearbyProfiles = (maxDistance: number = 10) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['nearby-profiles', user?.id, maxDistance],
    queryFn: async () => {
      if (!user) return [];

      const { data: swipedIds } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);

      const swipedUserIds = swipedIds?.map(s => s.swiped_id) || [];

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('onboarding_completed', true)
        .neq('user_id', user.id)
        .limit(20);

      if (error) throw error;

      const unswiped = profiles?.filter(p => !swipedUserIds.includes(p.user_id)) || [];

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
            distance: Math.floor(Math.random() * maxDistance) + 1,
          } as DiscoverProfile;
        })
      );

      return profilesWithPhotos.filter(p => p.photos.length > 0);
    },
    enabled: !!user,
  });
};

export const useProfilesByInterest = (interest: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profiles-by-interest', user?.id, interest],
    queryFn: async () => {
      if (!user) return [];

      const { data: swipedIds } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);

      const swipedUserIds = swipedIds?.map(s => s.swiped_id) || [];

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('onboarding_completed', true)
        .neq('user_id', user.id)
        .contains('interests', [interest])
        .limit(15);

      if (error) throw error;

      const unswiped = profiles?.filter(p => !swipedUserIds.includes(p.user_id)) || [];

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
            distance: Math.floor(Math.random() * 20) + 1,
          } as DiscoverProfile;
        })
      );

      return profilesWithPhotos.filter(p => p.photos.length > 0);
    },
    enabled: !!user && !!interest,
  });
};

export const EXPLORE_CATEGORIES = [
  { id: 'travel', label: 'Travel', icon: '✈️' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'fitness', label: 'Fitness', icon: '💪' },
  { id: 'food', label: 'Foodies', icon: '🍕' },
  { id: 'art', label: 'Art', icon: '🎨' },
  { id: 'gaming', label: 'Gaming', icon: '🎮' },
  { id: 'reading', label: 'Bookworms', icon: '📚' },
  { id: 'movies', label: 'Movies', icon: '🎬' },
  { id: 'outdoor', label: 'Outdoors', icon: '🏕️' },
  { id: 'photography', label: 'Photography', icon: '📷' },
];
