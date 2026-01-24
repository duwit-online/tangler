import { motion } from 'framer-motion';
import { Bell, BellOff, Loader2, Smartphone, MessageSquare, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const NotificationSettings = () => {
  const {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-4 shadow-card"
      >
        <div className="flex items-center gap-3 text-muted-foreground">
          <BellOff className="w-5 h-5" />
          <div>
            <p className="font-medium text-foreground">Push Notifications</p>
            <p className="text-sm">Not supported on this device</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const notificationTypes = [
    { icon: Heart, label: 'New matches', description: 'When you match with someone' },
    { icon: MessageSquare, label: 'Messages', description: 'When you receive a message' },
    { icon: Star, label: 'Likes & Super Likes', description: 'When someone likes your profile' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Main toggle */}
      <div className="bg-card rounded-2xl p-4 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isSubscribed ? 'gradient-primary' : 'bg-secondary'
            }`}>
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary-foreground" />
              ) : isSubscribed ? (
                <Bell className="w-5 h-5 text-primary-foreground" />
              ) : (
                <BellOff className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-medium text-foreground">Push Notifications</p>
              <p className="text-sm text-muted-foreground">
                {permission === 'denied' 
                  ? 'Blocked in browser settings'
                  : isSubscribed 
                    ? 'Enabled' 
                    : 'Disabled'}
              </p>
            </div>
          </div>
          
          {permission === 'denied' ? (
            <Button variant="outline" size="sm" disabled>
              Blocked
            </Button>
          ) : (
            <Switch
              checked={isSubscribed}
              onCheckedChange={() => isSubscribed ? unsubscribe() : subscribe()}
              disabled={isLoading}
            />
          )}
        </div>

        {permission === 'denied' && (
          <p className="mt-3 text-xs text-muted-foreground">
            To enable notifications, update your browser settings and reload the page.
          </p>
        )}
      </div>

      {/* Notification type toggles (when subscribed) */}
      {isSubscribed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-card rounded-2xl overflow-hidden shadow-card"
        >
          {notificationTypes.map((item, index) => (
            <div
              key={item.label}
              className={`flex items-center justify-between p-4 ${
                index !== notificationTypes.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </motion.div>
      )}

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-secondary/50 rounded-xl">
        <Smartphone className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Push notifications help you stay connected. You'll receive alerts for matches, 
          messages, and likes even when you're not using the app.
        </p>
      </div>
    </motion.div>
  );
};

export default NotificationSettings;
