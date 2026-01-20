import { motion } from "framer-motion";
import { Search, CheckCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMatches } from "@/hooks/useMatches";
import { formatDistanceToNow } from "date-fns";

interface MessagesViewProps {
  onOpenChat: (chat: { matchId: string; name: string; photo: string | null }) => void;
}

const MessagesView = ({ onOpenChat }: MessagesViewProps) => {
  const { data: matches = [], isLoading } = useMatches();

  // Filter to only show matches with messages or recent matches
  const conversations = matches.map(match => ({
    id: match.id,
    name: match.profile.display_name || "Unknown",
    image: match.photo,
    lastMessage: "Start a conversation!",
    time: formatDistanceToNow(new Date(match.matched_at), { addSuffix: true }),
    unread: match.unread_count > 0,
    isRead: match.unread_count === 0,
  }));

  return (
    <div className="pt-20 pb-24 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-serif font-bold text-foreground mb-4">
          Messages
        </h1>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-10 h-12 bg-secondary/50 border-0 rounded-xl"
          />
        </div>
      </motion.div>

      <div className="space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : conversations.length > 0 ? (
          conversations.map((conversation, index) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onOpenChat({
                matchId: conversation.id,
                name: conversation.name,
                photo: conversation.image,
              })}
              className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-colors ${
                conversation.unread 
                  ? "bg-primary/5 hover:bg-primary/10" 
                  : "hover:bg-secondary/50"
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-secondary">
                  {conversation.image ? (
                    <img
                      src={conversation.image}
                      alt={conversation.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xl font-semibold">
                      {conversation.name.charAt(0)}
                    </div>
                  )}
                </div>
                {conversation.unread && (
                  <div className="absolute -top-0.5 -right-0.5 w-4 h-4 gradient-primary rounded-full border-2 border-background" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-semibold text-foreground ${
                    conversation.unread ? "font-bold" : ""
                  }`}>
                    {conversation.name}
                  </h3>
                  <span className={`text-xs ${
                    conversation.unread ? "text-primary font-medium" : "text-muted-foreground"
                  }`}>
                    {conversation.time}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {conversation.isRead && (
                    <CheckCheck className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                  <p className={`text-sm truncate ${
                    conversation.unread ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {conversation.lastMessage}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No messages yet
            </h2>
            <p className="text-muted-foreground max-w-xs">
              When you match with someone, start a conversation here!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MessagesView;
