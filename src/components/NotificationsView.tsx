import { motion } from "framer-motion";
import { Bell, Heart, MessageCircle, Star, Check, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { 
  useNotifications, 
  useMarkNotificationAsRead, 
  useMarkAllNotificationsAsRead,
  useDeleteNotification 
} from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";

interface NotificationsViewProps {
  onOpenChat?: (chat: { matchId: string; name: string; photo: string | null }) => void;
}

const NotificationsView = ({ onOpenChat }: NotificationsViewProps) => {
  const { data: notifications = [], isLoading } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <Heart className="w-4 h-4 text-primary fill-primary" />;
      case 'message':
        return <MessageCircle className="w-4 h-4 text-accent" />;
      case 'superlike':
        return <Star className="w-4 h-4 text-accent fill-accent" />;
      case 'like':
        return <Heart className="w-4 h-4 text-primary" />;
      default:
        return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }
    
    if (notification.type === 'match' && notification.data?.match_id && onOpenChat) {
      onOpenChat({
        matchId: notification.data.match_id as string,
        name: "Match",
        photo: null,
      });
    }
  };

  return (
    <div className="pt-16 pb-20 px-3">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-serif font-bold text-foreground">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
              className="h-8 text-xs"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Mark all
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {unreadCount > 0 
            ? `${unreadCount} unread`
            : 'All caught up!'
          }
        </p>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleNotificationClick(notification)}
              className={`relative p-3 rounded-xl cursor-pointer transition-colors active:scale-[0.98] ${
                notification.read 
                  ? 'bg-card' 
                  : 'bg-primary/5 border border-primary/20'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  notification.read ? 'bg-secondary' : 'bg-primary/10'
                }`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className={`text-sm truncate ${
                      notification.read ? 'text-foreground font-medium' : 'text-primary font-semibold'
                    }`}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                    )}
                  </div>
                  {notification.body && (
                    <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">
                      {notification.body}
                    </p>
                  )}
                  <p className="text-muted-foreground/60 text-[10px] mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification.mutate(notification.id);
                  }}
                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-14"
        >
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
            <Bell className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1">
            No notifications yet
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            When someone matches with you or sends a message, you'll see it here.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default NotificationsView;