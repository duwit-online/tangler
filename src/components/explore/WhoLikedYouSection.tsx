import { motion } from "framer-motion";
import { Heart, Crown, Lock, ChevronRight } from "lucide-react";
import { useWhoLikedMe, LikeProfile } from "@/hooks/useLikes";
import { Button } from "@/components/ui/button";

interface WhoLikedYouSectionProps {
  onViewAll: () => void;
  isPremium?: boolean;
}

const WhoLikedYouSection = ({ onViewAll, isPremium = true }: WhoLikedYouSectionProps) => {
  const { data: whoLikedMe = [], isLoading } = useWhoLikedMe();

  if (isLoading || whoLikedMe.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      {/* Header */}
      <div className="px-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary fill-primary" />
          <h3 className="font-serif text-lg font-semibold text-foreground">
            Who Liked You
          </h3>
          <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
            {whoLikedMe.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewAll}
          className="text-primary hover:text-primary/80"
        >
          See all
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Cards */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 px-4">
          {whoLikedMe.slice(0, 5).map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={onViewAll}
              className="relative flex-shrink-0 cursor-pointer group"
            >
              <div className="w-28 rounded-xl overflow-hidden shadow-card">
                <div className="relative aspect-[3/4]">
                  <img
                    src={profile.photos[0]}
                    alt="Someone who liked you"
                    className={`w-full h-full object-cover transition-all duration-300 ${
                      isPremium ? 'group-hover:scale-105' : 'blur-lg scale-110'
                    }`}
                  />
                  
                  {/* Overlay for non-premium */}
                  {!isPremium && (
                    <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-card" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                  
                  {/* Like indicator */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Heart className="w-4 h-4 text-primary-foreground fill-current" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* View all card */}
          {whoLikedMe.length > 5 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              onClick={onViewAll}
              className="flex-shrink-0 cursor-pointer"
            >
              <div className="w-28 rounded-xl overflow-hidden bg-primary/10 border-2 border-dashed border-primary/30">
                <div className="aspect-[3/4] flex flex-col items-center justify-center p-3 text-center">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-primary">
                    +{whoLikedMe.length - 5} more
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default WhoLikedYouSection;
