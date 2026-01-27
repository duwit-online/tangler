import { motion } from "framer-motion";
import { Heart, MessageCircle, User } from "lucide-react";
import { useMatches, MatchWithProfile } from "@/hooks/useMatches";
import { useOnlineStatuses } from "@/hooks/useOnlineStatus";
import { OnlineIndicator } from "@/components/ui/online-indicator";
import MatchProfileModal from "@/components/matches/MatchProfileModal";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface MatchesViewProps {
  onOpenChat: (chat: { matchId: string; name: string; photo: string | null }) => void;
}

const MatchesView = ({ onOpenChat }: MatchesViewProps) => {
  const { data: matches = [], isLoading } = useMatches();
  const [selectedMatch, setSelectedMatch] = useState<MatchWithProfile | null>(null);

  const userIds = matches.map(m => m.other_user_id);
  const { data: onlineStatuses = {} } = useOnlineStatuses(userIds);

  const newMatches = matches.filter(m => 
    new Date(m.matched_at).getTime() > Date.now() - 24 * 60 * 60 * 1000
  );

  const handleMatchClick = (match: MatchWithProfile) => {
    setSelectedMatch(match);
  };

  const handleOpenChat = () => {
    if (selectedMatch) {
      onOpenChat({
        matchId: selectedMatch.id,
        name: selectedMatch.profile.display_name || "Unknown",
        photo: selectedMatch.photo,
      });
      setSelectedMatch(null);
    }
  };

  return (
    <div className="pt-16 pb-20 px-3">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <h1 className="text-2xl font-serif font-bold text-foreground mb-1">
          Matches
        </h1>
        <p className="text-sm text-muted-foreground">
          {matches.length} {matches.length === 1 ? 'person is' : 'people are'} interested in you
        </p>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {newMatches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                New Matches
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-3 -mx-3 px-3 scrollbar-hide">
                {newMatches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleMatchClick(match)}
                    className="flex-shrink-0 cursor-pointer"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full gradient-primary p-0.5">
                        <div className="w-full h-full rounded-full overflow-hidden bg-secondary border-2 border-card">
                          {match.photo ? (
                            <img
                              src={match.photo}
                              alt={match.profile.display_name || "Match"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-lg font-semibold">
                              {(match.profile.display_name || "?").charAt(0)}
                            </div>
                          )}
                        </div>
                      </div>
                      {onlineStatuses[match.other_user_id] && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-card flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-success" />
                        </div>
                      )}
                    </div>
                    <p className="text-center text-xs font-medium text-foreground mt-1.5 max-w-16 truncate">
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
            <h2 className="text-sm font-semibold text-foreground mb-3">
              All Matches
            </h2>
            {matches.length > 0 ? (
              <div className="grid grid-cols-2 gap-2.5">
                {matches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    onClick={() => handleMatchClick(match)}
                    className="relative bg-card rounded-xl overflow-hidden shadow-card group cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <div className="w-full aspect-[3/4] bg-secondary">
                      {match.photo ? (
                        <img
                          src={match.photo}
                          alt={match.profile.display_name || "Match"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-3xl font-semibold">
                          <User className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                    
                    {/* Online indicator */}
                    {onlineStatuses[match.other_user_id] && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-card/80 backdrop-blur-sm rounded-full px-2 py-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-success" />
                        <span className="text-[10px] font-medium text-foreground">Online</span>
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-2.5">
                      <h3 className="text-sm font-semibold text-card truncate">
                        {match.profile.display_name || "Unknown"}
                      </h3>
                      <p className="text-card/70 text-xs">
                        {formatDistanceToNow(new Date(match.matched_at), { addSuffix: true })}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {match.unread_count > 0 && (
                      <div className="absolute top-2 right-2 min-w-5 h-5 px-1.5 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary-foreground">
                          {match.unread_count}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No matches yet. Keep swiping!</p>
              </div>
            )}
          </motion.div>
        </>
      )}

      <MatchProfileModal
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        match={selectedMatch}
        onOpenChat={handleOpenChat}
      />
    </div>
  );
};

export default MatchesView;