import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { getPhotoUrl } from './useProfile';

export interface SearchResult {
  user_id: string;
  display_name: string | null;
  bio: string | null;
  location: string | null;
  interests: string[] | null;
  age: number | null;
  photo_url: string | null;
}

export const useGlobalSearch = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['global-search-users', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, bio, location, interests, age')
        .eq('onboarding_completed', true)
        .neq('user_id', user.id);

      if (error) throw error;

      // Get primary photos
      const results: SearchResult[] = await Promise.all(
        (profiles || []).map(async (p) => {
          const { data: photos } = await supabase
            .from('user_photos')
            .select('storage_path')
            .eq('user_id', p.user_id)
            .eq('is_primary', true)
            .limit(1);

          const firstPhoto = photos?.[0];
          return {
            ...p,
            photo_url: firstPhoto ? getPhotoUrl(firstPhoto.storage_path) : null,
          };
        })
      );

      return results;
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return allUsers
      .filter((u) => u.display_name?.toLowerCase().includes(q))
      .slice(0, 8);
  }, [allUsers, searchQuery]);

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return allUsers.filter((u) => {
      if (u.display_name?.toLowerCase().includes(q)) return true;
      if (u.location?.toLowerCase().includes(q)) return true;
      if (u.interests?.some((i) => i.toLowerCase().includes(q))) return true;
      if (u.bio?.toLowerCase().includes(q)) return true;
      return false;
    });
  }, [allUsers, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    suggestions,
    filteredResults,
    isLoading,
    isSearching: searchQuery.trim().length > 0,
    hasResults: filteredResults.length > 0,
  };
};
