import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PushSubscriptionState {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission | 'default';
  isLoading: boolean;
}

// Generate VAPID keys - In production, these should be stored securely
// For demo purposes, we'll use the Web Push without VAPID (local notifications only)
const VAPID_PUBLIC_KEY = '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [state, setState] = useState<PushSubscriptionState>({
    isSupported: false,
    isSubscribed: false,
    permission: 'default',
    isLoading: true,
  });
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = async () => {
      const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
      const permission = isSupported ? Notification.permission : 'default';
      
      setState(prev => ({
        ...prev,
        isSupported,
        permission,
        isLoading: false,
      }));

      if (isSupported) {
        try {
          // Register service worker
          const reg = await navigator.serviceWorker.register('/sw.js');
          setRegistration(reg);
          
          // Check if already subscribed
          const subscription = await (reg as any).pushManager?.getSubscription();
          setState(prev => ({
            ...prev,
            isSubscribed: !!subscription,
          }));
        } catch (error) {
          console.error('Service worker registration failed:', error);
        }
      }
    };

    checkSupport();
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!registration || !user) {
      toast.error('Push notifications not available');
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      
      if (permission !== 'granted') {
        toast.error('Notification permission denied');
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      // For now, we'll use local notifications since VAPID requires backend setup
      // In production, you would subscribe to push manager with VAPID key
      
      // Show success toast with example notification
      toast.success('Push notifications enabled!', {
        description: 'You will now receive notifications for matches, messages, and likes.',
      });

      // Trigger a test notification
      if (registration.active) {
        registration.showNotification('Welcome to Tangle! 🎉', {
          body: 'Push notifications are now enabled. You\'ll be notified about matches, messages, and likes.',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'welcome',
        });
      }

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      toast.error('Failed to enable push notifications');
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [registration, user]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!registration) return false;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const subscription = await (registration as any).pushManager?.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }

      toast.success('Push notifications disabled');

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      toast.error('Failed to disable push notifications');
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [registration]);

  // Send a local notification (for when app is in background)
  const sendLocalNotification = useCallback(async (
    title: string,
    options?: NotificationOptions
  ) => {
    if (!registration || Notification.permission !== 'granted') {
      return false;
    }

    try {
      await registration.showNotification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }, [registration]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    sendLocalNotification,
    registration,
  };
};

// Hook to listen for new notifications and show push notifications
export const useNotificationPush = () => {
  const { user } = useAuth();
  const { sendLocalNotification, isSubscribed, isSupported } = usePushNotifications();

  useEffect(() => {
    if (!user || !isSubscribed || !isSupported) return;

    // Subscribe to realtime notifications
    const channel = supabase
      .channel('push-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const notification = payload.new as {
            type: string;
            title: string;
            body: string | null;
            data: Record<string, unknown>;
          };

          // Send push notification
          await sendLocalNotification(notification.title, {
            body: notification.body || undefined,
            data: notification.data,
            tag: notification.type,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isSubscribed, isSupported, sendLocalNotification]);
};
