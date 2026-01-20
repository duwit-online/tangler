import { motion } from "framer-motion";
import { Heart, MessageCircle } from "lucide-react";
import { useMatches } from "@/hooks/useMatches";
import { formatDistanceToNow } from "date-fns";

interface MatchesViewProps {
  onOpenChat: (chat: { matchId: string; name: string; photo: string | null }) => void;
}

const MatchesView = ({ onOpenChat }: MatchesViewProps) => {
  const { data: matches = [], isLoading } = useMatches();

  const newMatches = matches.filter(m => 
    new Date(m.matched_at).getTime() > Date.now() - 24 * 60 * 60 * 1000
  );

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
          {matches.length} {matches.length === 1 ? 'person is' : 'people are'} interested in you
        </p>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {newMatches.length > 0 && (
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
                {newMatches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => onOpenChat({
                      matchId: match.id,
                      name: match.profile.display_name || "Unknown",
                      photo: match.photo,
                    })}
                    className="flex-shrink-0 cursor-pointer"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full gradient-primary p-0.5">
                        <div className="w-full h-full rounded-full overflow-hidden bg-secondary border-2 border-card">
                          {match.photo ? (
                            <img
                              src={match.photo}
                              alt={match.profile.display_name || "Match"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl font-semibold">
                              {(match.profile.display_name || "?").charAt(0)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 gradient-primary rounded-full flex items-center justify-center">
                        <Heart className="w-3 h-3 text-primary-foreground fill-primary-foreground" />
                      </div>
                    </div>
                    <p className="text-center text-sm font-medium text-foreground mt-2">
                      {match.profile.display_name || "Unknown"}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">
              All Matches
            </h2>
            {matches.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {matches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    onClick={() => onOpenChat({
                      matchId: match.id,
                      name: match.profile.display_name || "Unknown",
                      photo: match.photo,
                    })}
                    className="relative bg-card rounded-2xl overflow-hidden shadow-card group cursor-pointer"
                  >
                    <div className="w-full aspect-[3/4] bg-secondary">
                      {match.photo ? (
                        <img
                          src={match.photo}
                          alt={match.profile.display_name || "Match"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-4xl font-semibold">
                          {(match.profile.display_name || "?").charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-lg font-semibold text-card">
                        {match.profile.display_name || "Unknown"}
                      </h3>
                      <p className="text-card/70 text-sm">
                        {formatDistanceToNow(new Date(match.matched_at), { addSuffix: true })}
                      </p>
                    </div>
                    <button className="absolute top-3 right-3 w-10 h-10 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center text-card opacity-0 group-hover:opacity-100 transition-opacity">
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No matches yet. Keep swiping!</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default MatchesView;
