import { useState, useMemo } from 'react';
import { DiscoverProfile } from './useSwipes';

export const useDiscoverSearch = (profiles: DiscoverProfile[]) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProfiles = useMemo(() => {
    if (!searchQuery.trim()) return profiles;

    const query = searchQuery.toLowerCase().trim();
    
    return profiles.filter(profile => {
      // Search by name
      if (profile.display_name?.toLowerCase().includes(query)) return true;
      
      // Search by location
      if (profile.location?.toLowerCase().includes(query)) return true;
      
      // Search by interests
      if (profile.interests?.some(interest => 
        interest.toLowerCase().includes(query)
      )) return true;
      
      // Search by bio
      if (profile.bio?.toLowerCase().includes(query)) return true;
      
      return false;
    });
  }, [profiles, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredProfiles,
    hasResults: filteredProfiles.length > 0,
    isSearching: searchQuery.trim().length > 0,
  };
};

export default useDiscoverSearch;
