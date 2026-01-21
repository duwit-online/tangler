import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import CategoryPills from "./explore/CategoryPills";
import ProfileCarousel from "./explore/ProfileCarousel";
import ExploreFiltersSheet from "./explore/ExploreFiltersSheet";
import ProfileDetailModal from "./explore/ProfileDetailModal";
import {
  useExploreProfiles,
  useNearbyProfiles,
  useProfilesByInterest,
  ExploreFilters,
  defaultFilters,
  EXPLORE_CATEGORIES,
} from "@/hooks/useExploreProfiles";
import { useSwipe, DiscoverProfile } from "@/hooks/useSwipes";

const ExploreView = () => {
  const [filters, setFilters] = useState<ExploreFilters>(defaultFilters);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<DiscoverProfile | null>(null);
  
  const swipeMutation = useSwipe();

  // Fetch profiles with different queries
  const { data: nearbyData, isLoading: nearbyLoading } = useNearbyProfiles(10);
  const { 
    data: exploreData, 
    isLoading: exploreLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useExploreProfiles(filters, selectedCategory || undefined);

  // Fetch profiles by interests for carousels
  const travelProfiles = useProfilesByInterest("travel");
  const fitnessProfiles = useProfilesByInterest("fitness");
  const musicProfiles = useProfilesByInterest("music");
  const foodProfiles = useProfilesByInterest("food");

  const allExploreProfiles = exploreData?.pages.flatMap(page => page.profiles) || [];

  // Infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (isFetchingNextPage) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  const handleLike = async (profile: DiscoverProfile) => {
    try {
      const result = await swipeMutation.mutateAsync({
        swipedId: profile.user_id,
        direction: "like",
      });
      
      if (result.match) {
        toast.success(`You matched with ${profile.display_name}! 🎉`);
      } else {
        toast.success(`Liked ${profile.display_name}`);
      }
    } catch (error) {
      toast.error("Failed to like profile");
    }
  };

  const handleSuperLike = async (profile: DiscoverProfile) => {
    try {
      const result = await swipeMutation.mutateAsync({
        swipedId: profile.user_id,
        direction: "superlike",
      });
      
      if (result.match) {
        toast.success(`Super match with ${profile.display_name}! ⭐`);
      } else {
        toast.success(`Super liked ${profile.display_name} ⭐`);
      }
    } catch (error) {
      toast.error("Failed to super like profile");
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-24">
      {/* Header */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or interest..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full bg-card border-border"
            />
          </div>
          <ExploreFiltersSheet
            filters={filters}
            onFiltersChange={setFilters}
            open={filtersOpen}
            onOpenChange={setFiltersOpen}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <CategoryPills
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {/* Content */}
      <div className="space-y-8">
        {/* Nearby Section */}
        {!selectedCategory && (
          <ProfileCarousel
            profiles={nearbyData || []}
            title="Nearby"
            icon="📍"
            onProfileClick={setSelectedProfile}
            onLike={handleLike}
          />
        )}

        {/* Category-specific or For You content */}
        {selectedCategory ? (
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ProfileCarousel
              profiles={allExploreProfiles}
              title={EXPLORE_CATEGORIES.find(c => c.id === selectedCategory)?.label || "Explore"}
              icon={EXPLORE_CATEGORIES.find(c => c.id === selectedCategory)?.icon}
              onProfileClick={setSelectedProfile}
              onLike={handleLike}
            />
          </motion.div>
        ) : (
          <>
            {/* Travel Lovers */}
            <ProfileCarousel
              profiles={travelProfiles.data || []}
              title="Travel Lovers"
              icon="✈️"
              onProfileClick={setSelectedProfile}
              onLike={handleLike}
            />

            {/* Fitness Enthusiasts */}
            <ProfileCarousel
              profiles={fitnessProfiles.data || []}
              title="Fitness Enthusiasts"
              icon="💪"
              onProfileClick={setSelectedProfile}
              onLike={handleLike}
            />

            {/* Music Lovers */}
            <ProfileCarousel
              profiles={musicProfiles.data || []}
              title="Music Lovers"
              icon="🎵"
              onProfileClick={setSelectedProfile}
              onLike={handleLike}
            />

            {/* Foodies */}
            <ProfileCarousel
              profiles={foodProfiles.data || []}
              title="Foodies"
              icon="🍕"
              onProfileClick={setSelectedProfile}
              onLike={handleLike}
            />
          </>
        )}

        {/* All Profiles (Infinite scroll) */}
        {!selectedCategory && (
          <div className="px-4">
            <h3 className="font-serif text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span>🔥</span> Explore All
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {allExploreProfiles.map((profile, index) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative rounded-xl overflow-hidden aspect-[3/4] cursor-pointer group shadow-card"
                  onClick={() => setSelectedProfile(profile)}
                >
                  <img
                    src={profile.photos[0]}
                    alt={profile.display_name || "Profile"}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-card">
                    <p className="font-medium text-sm">
                      {profile.display_name}, {profile.age}
                    </p>
                    <p className="text-xs text-card/80">{profile.distance} mi away</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Load more trigger */}
            <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
              {isFetchingNextPage && (
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              )}
            </div>
          </div>
        )}

        {/* Loading state */}
        {(exploreLoading || nearbyLoading) && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Profile Detail Modal */}
      <ProfileDetailModal
        profile={selectedProfile}
        isOpen={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        onLike={handleLike}
        onSuperLike={handleSuperLike}
      />
    </div>
  );
};

export default ExploreView;
