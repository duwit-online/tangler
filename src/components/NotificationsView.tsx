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
        return <Heart className="w-5 h-5 text-primary fill-primary" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-accent" />;
      case 'superlike':
        return <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />;
      case 'like':
        return <Heart className="w-5 h-5 text-primary" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
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
    <div className="pt-20 pb-24 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              <Check className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <p className="text-muted-foreground">
          {unreadCount > 0 
            ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
            : 'All caught up!'
          }
        </p>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleNotificationClick(notification)}
              className={`relative p-4 rounded-xl cursor-pointer transition-colors ${
                notification.read 
                  ? 'bg-card' 
                  : 'bg-primary/5 border border-primary/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  notification.read ? 'bg-secondary' : 'bg-primary/10'
                }`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold ${
                      notification.read ? 'text-foreground' : 'text-primary'
                    }`}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                  {notification.body && (
                    <p className="text-muted-foreground text-sm mt-1">
                      {notification.body}
                    </p>
                  )}
                  <p className="text-muted-foreground/60 text-xs mt-2">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification.mutate(notification.id);
                  }}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <Bell className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No notifications yet
          </h2>
          <p className="text-muted-foreground max-w-xs mx-auto">
            When someone matches with you or sends a message, you'll see it here.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default NotificationsView;
