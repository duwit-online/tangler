import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useGlobalSearch, SearchResult } from '@/hooks/useGlobalSearch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface GlobalSearchBarProps {
  onSelectUser?: (user: SearchResult) => void;
}

const GlobalSearchBar = ({ onSelectUser }: GlobalSearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const { searchQuery, setSearchQuery, suggestions, isSearching } = useGlobalSearch();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search people by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="pl-10 pr-10 h-11 rounded-2xl bg-card border-border/50 text-sm shadow-card"
        />
        {isSearching && (
          <button
            onClick={() => { setSearchQuery(''); setIsFocused(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isFocused && isSearching && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card rounded-2xl border border-border/50 shadow-elevated overflow-hidden z-50"
          >
            <div className="p-1.5 max-h-[320px] overflow-y-auto">
              {suggestions.map((user) => (
                <button
                  key={user.user_id}
                  onClick={() => {
                    onSelectUser?.(user);
                    setIsFocused(false);
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/60 transition-colors text-left"
                >
                  <Avatar className="w-10 h-10 rounded-xl">
                    <AvatarImage src={user.photo_url || undefined} />
                    <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-sm font-semibold">
                      {user.display_name?.charAt(0)?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {user.display_name || 'Unknown'}{user.age ? `, ${user.age}` : ''}
                    </p>
                    {user.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {user.location}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {isFocused && isSearching && suggestions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card rounded-2xl border border-border/50 shadow-elevated p-6 text-center z-50"
          >
            <p className="text-sm text-muted-foreground">No users found</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalSearchBar;
