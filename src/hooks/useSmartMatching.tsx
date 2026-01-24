import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfile, getPhotoUrl } from './useProfile';
import { DiscoverProfile } from './useSwipes';

// Haversine formula to calculate distance between two coordinates in miles
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

// Hook to get profiles filtered by gender preferences and interests
export const useSmartMatchProfiles = () => {
  const { user } = useAuth();
  const { data: myProfile } = useProfile();

  return useQuery({
    queryKey: ['smart-match-profiles', user?.id, myProfile?.looking_for, myProfile?.interests],
    queryFn: async () => {
      if (!user || !myProfile) return [];

      // Get profiles the user hasn't swiped on yet
      const { data: swipedIds } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);

      const swipedUserIds = swipedIds?.map(s => s.swiped_id) || [];

      // Build query with gender preferences
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('onboarding_completed', true)
        .neq('user_id', user.id);

      // Filter by gender based on looking_for preference
      if (myProfile.looking_for && myProfile.looking_for !== 'Everyone') {
        query = query.eq('gender', myProfile.looking_for);
      }

      // Also filter so that the other person is looking for my gender
      if (myProfile.gender) {
        // This is tricky - we need users who are looking for my gender or "Everyone"
        query = query.or(`looking_for.eq.${myProfile.gender},looking_for.eq.Everyone`);
      }

      const { data: profiles, error } = await query;

      if (error) throw error;

      // Filter out swiped profiles
      const unswiped = profiles?.filter(p => !swipedUserIds.includes(p.user_id)) || [];

      // Get my location for distance calculation
      const myLat = (myProfile as any).latitude;
      const myLon = (myProfile as any).longitude;

      // Get photos and calculate compatibility
      const profilesWithPhotos = await Promise.all(
        unswiped.map(async (profile) => {
          const { data: photos } = await supabase
            .from('user_photos')
            .select('storage_path')
            .eq('user_id', profile.user_id)
            .order('display_order', { ascending: true });

          // Calculate interest compatibility score
          const myInterests = myProfile.interests || [];
          const theirInterests = profile.interests || [];
          const sharedInterests = myInterests.filter(
            (i: string) => theirInterests.includes(i)
          );
          const compatibilityScore = sharedInterests.length;

          // Calculate real distance if both have location data
          const theirLat = (profile as any).latitude;
          const theirLon = (profile as any).longitude;
          let distance: number;
          
          if (myLat && myLon && theirLat && theirLon) {
            distance = calculateDistance(myLat, myLon, theirLat, theirLon);
          } else {
            // Fallback to random distance if location not available
            distance = Math.floor(Math.random() * 15) + 1;
          }

          return {
            ...profile,
            photos: photos?.map(p => getPhotoUrl(p.storage_path)) || [],
            distance,
            compatibilityScore,
            sharedInterests,
          } as DiscoverProfile & { 
            compatibilityScore: number; 
            sharedInterests: string[];
          };
        })
      );

      // Sort by compatibility score (higher first) and filter those with photos
      return profilesWithPhotos
        .filter(p => p.photos.length > 0)
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    },
    enabled: !!user && !!myProfile?.looking_for,
  });
};

// Enhanced discover profiles with smart matching
export const useSmartDiscoverProfiles = () => {
  const { user } = useAuth();
  const { data: myProfile } = useProfile();

  return useQuery({
    queryKey: ['smart-discover', user?.id, myProfile?.looking_for, myProfile?.gender],
    queryFn: async () => {
      if (!user) return [];

      // Get profiles the user hasn't swiped on yet
      const { data: swipedIds } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);

      const swipedUserIds = swipedIds?.map(s => s.swiped_id) || [];

      // Build base query
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('onboarding_completed', true)
        .neq('user_id', user.id);

      // Apply gender preference filtering if user has set preferences
      if (myProfile?.looking_for && myProfile.looking_for !== 'Everyone') {
        query = query.eq('gender', myProfile.looking_for);
      }

      // Filter to only show profiles looking for my gender type
      if (myProfile?.gender) {
        query = query.or(`looking_for.eq.${myProfile.gender},looking_for.eq.Everyone,looking_for.is.null`);
      }

      const { data: profiles, error } = await query;

      if (error) throw error;

      // Filter out swiped profiles
      const unswiped = profiles?.filter(p => !swipedUserIds.includes(p.user_id)) || [];

      // Get my location for distance calculation
      const myLat = (myProfile as any)?.latitude;
      const myLon = (myProfile as any)?.longitude;

      // Get photos for each profile
      const profilesWithPhotos = await Promise.all(
        unswiped.map(async (profile) => {
          const { data: photos } = await supabase
            .from('user_photos')
            .select('storage_path')
            .eq('user_id', profile.user_id)
            .order('display_order', { ascending: true });

          // Calculate real distance if both have location data
          const theirLat = (profile as any).latitude;
          const theirLon = (profile as any).longitude;
          let distance: number;
          
          if (myLat && myLon && theirLat && theirLon) {
            distance = calculateDistance(myLat, myLon, theirLat, theirLon);
          } else {
            // Fallback to random distance if location not available
            distance = Math.floor(Math.random() * 15) + 1;
          }

          return {
            ...profile,
            photos: photos?.map(p => getPhotoUrl(p.storage_path)) || [],
            distance,
          } as DiscoverProfile;
        })
      );

      return profilesWithPhotos.filter(p => p.photos.length > 0);
    },
    enabled: !!user,
  });
};
