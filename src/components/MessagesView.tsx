import { motion } from "framer-motion";
import { Search, CheckCheck, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMatches } from "@/hooks/useMatches";
import { useOnlineStatuses } from "@/hooks/useOnlineStatus";
import { formatDistanceToNow } from "date-fns";

interface MessagesViewProps {
  onOpenChat: (chat: { matchId: string; name: string; photo: string | null; userId?: string }) => void;
}

const MessagesView = ({ onOpenChat }: MessagesViewProps) => {
  const { data: matches = [], isLoading } = useMatches();
  
  const userIds = matches.map(m => m.other_user_id);
  const { data: onlineStatuses = {} } = useOnlineStatuses(userIds);

  const conversations = matches.map(match => ({
    id: match.id,
    userId: match.other_user_id,
    name: match.profile.display_name || "Unknown",
    image: match.photo,
    lastMessage: "Start a conversation!",
    time: formatDistanceToNow(new Date(match.matched_at), { addSuffix: true }),
    unread: match.unread_count > 0,
    isRead: match.unread_count === 0,
    isOnline: onlineStatuses[match.other_user_id] || false,
  }));

  return (
    <div className="pt-16 pb-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <h1 className="text-2xl font-serif font-bold text-foreground mb-3">
          Messages
        </h1>
        
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-10 h-11 bg-card border-border/50 rounded-2xl text-sm shadow-card"
          />
        </div>
      </motion.div>

      <div className="space-y-1.5">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
                userId: conversation.userId,
              })}
              className={`flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all active:scale-[0.98] ${
                conversation.unread 
                  ? "bg-primary/5 border border-primary/15 shadow-card" 
                  : "hover:bg-card hover:shadow-card"
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-13 h-13 rounded-full overflow-hidden bg-secondary w-[52px] h-[52px]">
                  {conversation.image ? (
                    <img
                      src={conversation.image}
                      alt={conversation.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-lg font-semibold">
                      {conversation.name.charAt(0)}
                    </div>
                  )}
                </div>
                {conversation.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-background flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-success" />
                  </div>
                )}
                {conversation.unread && !conversation.isOnline && (
                  <div className="absolute -top-0.5 -right-0.5 w-4 h-4 gradient-primary rounded-full border-2 border-background" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <h3 className={`text-sm text-foreground truncate ${
                      conversation.unread ? "font-bold" : "font-medium"
                    }`}>
                      {conversation.name}
                    </h3>
                    {conversation.isOnline && (
                      <span className="text-[10px] text-success font-medium">Online</span>
                    )}
                  </div>
                  <span className={`text-[10px] flex-shrink-0 ${
                    conversation.unread ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}>
                    {conversation.time}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {conversation.isRead && (
                    <CheckCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  )}
                  <p className={`text-xs truncate ${
                    conversation.unread ? "text-foreground font-medium" : "text-muted-foreground"
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
            <div className="w-[72px] h-[72px] rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-serif font-semibold text-foreground mb-1.5">
              No messages yet
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              When you match with someone, start a conversation here!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MessagesView;
