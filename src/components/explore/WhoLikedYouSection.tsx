import { motion } from "framer-motion";
import { Heart, ChevronRight } from "lucide-react";
import { useWhoLikedMe } from "@/hooks/useLikes";
import { Button } from "@/components/ui/button";

interface WhoLikedYouSectionProps {
  onViewAll: () => void;
  isPremium?: boolean;
}

const WhoLikedYouSection = ({ onViewAll }: WhoLikedYouSectionProps) => {
  const { data: whoLikedMe = [], isLoading } = useWhoLikedMe();

  if (isLoading || whoLikedMe.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="px-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary fill-primary" />
          <h3 className="font-serif text-lg font-semibold text-foreground">
            Who Liked You
          </h3>
          <span className="gradient-primary text-primary-foreground text-xs font-bold px-2.5 py-0.5 rounded-full">
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

      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 px-4">
          {whoLikedMe.slice(0, 6).map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08 }}
              onClick={onViewAll}
              className="relative flex-shrink-0 cursor-pointer group"
            >
              <div className="w-28 rounded-2xl overflow-hidden shadow-card">
                <div className="relative aspect-[3/4]">
                  <img
                    src={profile.photos[0]}
                    alt="Someone who liked you"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shadow-glow">
                      <Heart className="w-4 h-4 text-primary-foreground fill-current" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {whoLikedMe.length > 6 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              onClick={onViewAll}
              className="flex-shrink-0 cursor-pointer"
            >
              <div className="w-28 rounded-2xl overflow-hidden bg-primary/5 border-2 border-dashed border-primary/20">
                <div className="aspect-[3/4] flex flex-col items-center justify-center p-3 text-center">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-primary">
                    +{whoLikedMe.length - 6} more
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
