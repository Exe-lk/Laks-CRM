import { useEffect, useState } from 'react';
import { messaging } from '@/lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { UserType } from '@/types/notifications';

export const usePushNotifications = (
  userId: string | null,
  userType: UserType
) => {
  const [token, setToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (!userId || typeof window === 'undefined') {
      console.log('usePushNotifications: No userId or not in browser');
      return;
    }

    const init = async () => {
      console.log('usePushNotifications: Initializing...', { userId, userType });
      
      if (!('Notification' in window)) {
        console.log('usePushNotifications: Notifications not supported');
        return;
      }

      if (!('serviceWorker' in navigator)) {
        console.log('usePushNotifications: Service workers not supported');
        return;
      }

      setIsSupported(true);

      try {
        // Check current permission
        let permission = Notification.permission;
        console.log('usePushNotifications: Current permission:', permission);

        if (permission === 'default') {
          console.log('usePushNotifications: Requesting permission...');
          permission = await Notification.requestPermission();
          console.log('usePushNotifications: Permission result:', permission);
        }

        if (permission !== 'granted') {
          console.log('usePushNotifications: Permission not granted:', permission);
          return;
        }

        if (!messaging) {
          console.error('usePushNotifications: Firebase messaging not available');
          return;
        }

        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
          console.error('usePushNotifications: VAPID key not configured');
          return;
        }

        console.log('usePushNotifications: Getting FCM token...');
        const currentToken = await getToken(messaging, {
          vapidKey: vapidKey,
        });

        if (currentToken) {
          console.log('usePushNotifications: Token obtained:', currentToken.substring(0, 20) + '...');
          setToken(currentToken);
          
          const authToken = localStorage.getItem('token');
          if (!authToken) {
            console.error('usePushNotifications: No auth token found');
            return;
          }

          console.log('usePushNotifications: Registering token with backend...');
          const response = await fetch('/api/notifications/register-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              token: currentToken,
              userType,
              deviceInfo: navigator.userAgent,
            }),
          });

          if (response.ok) {
            console.log('usePushNotifications: Token registered successfully');
          } else {
            const error = await response.json();
            console.error('usePushNotifications: Token registration failed:', error);
          }
        } else {
          console.log('usePushNotifications: No token available');
        }
      } catch (error) {
        console.error('usePushNotifications: Setup error:', error);
      }
    };

    init();

    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('usePushNotifications: Foreground message received:', payload);
        const { title, body } = payload.notification || {};
        const data = payload.data || {};
        
        if (title && body) {
          // Create unique tag using type + relevant ID + timestamp to show ALL notifications
          const uniqueTag = `${data.type || 'notification'}_${data.request_id || data.booking_id || ''}_${Date.now()}`;
          
          // Show notification when browser is open (foreground)
          const notification = new Notification(title, {
            body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            data: data,
            tag: uniqueTag,
            requireInteraction: false,
          });

          // Handle notification click
          notification.onclick = (event) => {
            event.preventDefault();
            const url = data.url || '/';
            window.focus();
            window.location.href = url;
            notification.close();
          };
        }
      });

      return () => unsubscribe();
    }
  }, [userId, userType]);

  return { token, isSupported };
};