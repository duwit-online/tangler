import { motion } from "framer-motion";
import { Search, Check, CheckCheck } from "lucide-react";
import { Input } from "@/components/ui/input";

const conversations = [
  {
    id: "1",
    name: "Sofia",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    lastMessage: "That sounds amazing! I'd love to check out that gallery",
    time: "2m ago",
    unread: true,
    isRead: false,
  },
  {
    id: "2",
    name: "Marcus",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    lastMessage: "How about Friday evening?",
    time: "1h ago",
    unread: false,
    isRead: true,
  },
  {
    id: "3",
    name: "Luna",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80",
    lastMessage: "Just finished editing my new documentary 🎬",
    time: "3h ago",
    unread: false,
    isRead: true,
  },
  {
    id: "4",
    name: "Ava",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
    lastMessage: "You should try the new yoga studio downtown!",
    time: "Yesterday",
    unread: false,
    isRead: true,
  },
];

const MessagesView = () => {
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
        
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-10 h-12 bg-secondary/50 border-0 rounded-xl"
          />
        </div>
      </motion.div>

      {/* Conversations list */}
      <div className="space-y-2">
        {conversations.map((conversation, index) => (
          <motion.div
            key={conversation.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-colors ${
              conversation.unread 
                ? "bg-primary/5 hover:bg-primary/10" 
                : "hover:bg-secondary/50"
            }`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={conversation.image}
                alt={conversation.name}
                className="w-14 h-14 rounded-full object-cover"
              />
              {conversation.unread && (
                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 gradient-primary rounded-full border-2 border-background" />
              )}
            </div>

            {/* Content */}
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
        ))}
      </div>

      {/* Empty state */}
      {conversations.length === 0 && (
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
  );
};

export default MessagesView;
