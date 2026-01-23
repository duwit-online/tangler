import { motion } from "framer-motion";
import { Sparkles, ChevronRight } from "lucide-react";
import { useNewMatchesThisWeek } from "@/hooks/useLikes";
import { DiscoverProfile } from "@/hooks/useSwipes";
import { formatDistanceToNow } from "date-fns";

interface NewMatchesSectionProps {
  onProfileClick: (profile: DiscoverProfile) => void;
}

const NewMatchesSection = ({ onProfileClick }: NewMatchesSectionProps) => {
  const { data: newMatches = [], isLoading } = useNewMatchesThisWeek();

  if (isLoading || newMatches.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      {/* Special header with glow effect */}
      <div className="px-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <div className="absolute inset-0 animate-pulse bg-yellow-500/30 blur-md rounded-full" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-foreground">
            New Matches This Week
          </h3>
          <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
            {newMatches.length} new
          </span>
        </div>
        <button className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors">
          See all
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Carousel with special styling */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 px-4">
          {newMatches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onProfileClick(match as DiscoverProfile)}
              className="relative flex-shrink-0 cursor-pointer group"
            >
              {/* Glow ring effect */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary via-accent to-primary opacity-75 blur group-hover:opacity-100 transition-opacity animate-pulse" />
              
              <div className="relative w-32 rounded-2xl overflow-hidden">
                <div className="aspect-[3/4]">
                  <img
                    src={match.photos[0]}
                    alt={match.display_name || "Match"}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
                </div>
                
                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-2 text-card">
                  <p className="font-medium text-sm truncate">
                    {match.display_name}
                  </p>
                  <p className="text-xs text-card/80">
                    {formatDistanceToNow(new Date(match.matchedAt), { addSuffix: true })}
                  </p>
                </div>

                {/* New badge */}
                <div className="absolute top-2 left-2">
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                    NEW
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default NewMatchesSection;
