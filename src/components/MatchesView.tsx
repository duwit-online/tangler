import { motion } from "framer-motion";
import { Heart, MessageCircle } from "lucide-react";

const matches = [
  {
    id: "1",
    name: "Sofia",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    matchedAt: "2 hours ago",
    isNew: true,
  },
  {
    id: "2",
    name: "Luna",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80",
    matchedAt: "Yesterday",
    isNew: false,
  },
  {
    id: "3",
    name: "Marcus",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    matchedAt: "3 days ago",
    isNew: false,
  },
];

const MatchesView = () => {
  return (
    <div className="pt-20 pb-24 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
          Matches
        </h1>
        <p className="text-muted-foreground">
          {matches.length} people are interested in you
        </p>
      </motion.div>

      {/* New matches horizontal scroll */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          New Matches
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {matches
            .filter((m) => m.isNew)
            .map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-full gradient-primary p-0.5">
                    <img
                      src={match.image}
                      alt={match.name}
                      className="w-full h-full rounded-full object-cover border-2 border-card"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 gradient-primary rounded-full flex items-center justify-center">
                    <Heart className="w-3 h-3 text-primary-foreground fill-primary-foreground" />
                  </div>
                </div>
                <p className="text-center text-sm font-medium text-foreground mt-2">
                  {match.name}
                </p>
              </motion.div>
            ))}
          
          {/* Empty state if no new matches */}
          {matches.filter((m) => m.isNew).length === 0 && (
            <p className="text-muted-foreground text-sm">
              No new matches yet. Keep swiping!
            </p>
          )}
        </div>
      </motion.div>

      {/* All matches grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">
          All Matches
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {matches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="relative bg-card rounded-2xl overflow-hidden shadow-card group cursor-pointer"
            >
              <img
                src={match.image}
                alt={match.name}
                className="w-full aspect-[3/4] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-lg font-semibold text-card">
                  {match.name}
                </h3>
                <p className="text-card/70 text-sm">{match.matchedAt}</p>
              </div>
              <button className="absolute top-3 right-3 w-10 h-10 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center text-card opacity-0 group-hover:opacity-100 transition-opacity">
                <MessageCircle className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default MatchesView;
