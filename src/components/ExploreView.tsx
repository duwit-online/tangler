import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
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
      {/* Header */}
      <div className="px-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-full bg-card border-border text-sm"
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
      <div className="mb-4">
        <CategoryPills
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {/* Content */}
      <div className="space-y-6">
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
          <div className="px-3">
            <h3 className="font-serif text-base font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>🔥</span> Explore All
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {allExploreProfiles.map((profile, index) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative rounded-xl overflow-hidden aspect-[3/4] cursor-pointer group shadow-card active:scale-[0.98] transition-transform"
                  onClick={() => setSelectedProfile(profile)}
                >
                  <img
                    src={profile.photos[0]}
                    alt={profile.display_name || "Profile"}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 text-card">
                    <p className="font-medium text-sm truncate">
                      {profile.display_name}, {profile.age}
                    </p>
                    <p className="text-xs text-card/80">{profile.distance} mi</p>
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