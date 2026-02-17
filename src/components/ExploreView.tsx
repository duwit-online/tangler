import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import CategoryPills from "./explore/CategoryPills";
import ProfileCarousel from "./explore/ProfileCarousel";
import ExploreFiltersSheet from "./explore/ExploreFiltersSheet";
import ProfileDetailModal from "./explore/ProfileDetailModal";
import NewMatchesSection from "./explore/NewMatchesSection";
import WhoLikedYouSection from "./explore/WhoLikedYouSection";
import {
  useExploreProfiles,
  useNearbyProfiles,
  useProfilesByInterest,
  ExploreFilters,
  defaultFilters,
  EXPLORE_CATEGORIES,
} from "@/hooks/useExploreProfiles";
import { useSwipe, DiscoverProfile } from "@/hooks/useSwipes";

interface ExploreViewProps {
  onViewLikes?: () => void;
}

const ExploreView = ({ onViewLikes }: ExploreViewProps) => {
  const [filters, setFilters] = useState<ExploreFilters>(defaultFilters);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<DiscoverProfile | null>(null);
  
  const swipeMutation = useSwipe();

  const { data: nearbyData, isLoading: nearbyLoading } = useNearbyProfiles(10);
  const { 
    data: exploreData, 
    isLoading: exploreLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useExploreProfiles(filters, selectedCategory || undefined);

  const travelProfiles = useProfilesByInterest("travel");
  const fitnessProfiles = useProfilesByInterest("fitness");
  const musicProfiles = useProfilesByInterest("music");
  const foodProfiles = useProfilesByInterest("food");

  const allExploreProfiles = exploreData?.pages.flatMap(page => page.profiles) || [];

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
    <div className="min-h-screen pt-16 pb-20">
      {/* Search Header */}
      <div className="px-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-2xl bg-card border-border/50 text-sm shadow-card"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setFiltersOpen(true)}
            className="w-11 h-11 rounded-2xl bg-card border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground shadow-card transition-colors"
          >
            <SlidersHorizontal className="w-[18px] h-[18px]" />
          </motion.button>
        </motion.div>
        <ExploreFiltersSheet
          filters={filters}
          onFiltersChange={setFilters}
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
        />
      </div>

      {/* Categories */}
      <div className="mb-5">
        <CategoryPills
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {/* Content */}
      <div className="space-y-7">
        {!selectedCategory && (
          <NewMatchesSection onProfileClick={setSelectedProfile} />
        )}

        {!selectedCategory && onViewLikes && (
          <WhoLikedYouSection onViewAll={onViewLikes} isPremium={true} />
        )}

        {!selectedCategory && (
          <ProfileCarousel
            profiles={nearbyData || []}
            title="Nearby"
            icon="📍"
            onProfileClick={setSelectedProfile}
            onLike={handleLike}
          />
        )}

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
            <ProfileCarousel
              profiles={travelProfiles.data || []}
              title="Travel Lovers"
              icon="✈️"
              onProfileClick={setSelectedProfile}
              onLike={handleLike}
            />

            <ProfileCarousel
              profiles={fitnessProfiles.data || []}
              title="Fitness Enthusiasts"
              icon="💪"
              onProfileClick={setSelectedProfile}
              onLike={handleLike}
            />

            <ProfileCarousel
              profiles={musicProfiles.data || []}
              title="Music Lovers"
              icon="🎵"
              onProfileClick={setSelectedProfile}
              onLike={handleLike}
            />

            <ProfileCarousel
              profiles={foodProfiles.data || []}
              title="Foodies"
              icon="🍕"
              onProfileClick={setSelectedProfile}
              onLike={handleLike}
            />
          </>
        )}

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
                  className="relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer group shadow-card active:scale-[0.98] transition-transform"
                  onClick={() => setSelectedProfile(profile)}
                >
                  <img
                    src={profile.photos[0]}
                    alt={profile.display_name || "Profile"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-card">
                    <p className="font-serif font-semibold text-sm truncate">
                      {profile.display_name}, {profile.age}
                    </p>
                    <p className="text-xs text-card/70 mt-0.5">{profile.distance} mi</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div ref={loadMoreRef} className="h-16 flex items-center justify-center">
              {isFetchingNextPage && (
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              )}
            </div>
          </div>
        )}

        {(exploreLoading || nearbyLoading) && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
      </div>

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
