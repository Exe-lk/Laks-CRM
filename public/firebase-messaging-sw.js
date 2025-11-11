// Service Worker for Firebase Cloud Messaging
try {
    importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');
  
    // Initialize Firebase
    firebase.initializeApp({
      apiKey: 'AIzaSyDi31YC2HPGcI5Ml9JEYsW5KJ7WkTVFioA',
      authDomain: 'laks-7e516.firebaseapp.com',
      projectId: 'laks-7e516',
      storageBucket: 'laks-7e516.firebasestorage.app',
      messagingSenderId: '30714062559',
      appId: '1:30714062559:web:825a390815a77cfe4eab6a',
    });
  
    const messaging = firebase.messaging();
  
  // Handle background messages
  messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Background message received:', payload);
    
    const data = payload.data || {};
    // Create unique tag using type + relevant ID + timestamp to show ALL notifications
    const uniqueTag = `${data.type || 'notification'}_${data.request_id || data.booking_id || ''}_${Date.now()}`;
    
    const notificationTitle = payload.notification?.title || 'New Notification';
    const notificationOptions = {
      body: payload.notification?.body || '',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: data,
      tag: uniqueTag,
      requireInteraction: false,
      vibrate: [200, 100, 200],
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
  
    // Handle notification clicks
    self.addEventListener('notificationclick', (event) => {
      console.log('[SW] Notification clicked:', event);
      
      event.notification.close();
      
      const urlToOpen = event.notification.data?.url || '/';
      
      event.waitUntil(
        clients.matchAll({ 
          type: 'window', 
          includeUncontrolled: true 
        }).then((clientList) => {
          // Check if there's already a window/tab open with the target URL
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i];
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }
          // If not, open a new window/tab
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
      );
    });
  
    console.log('[SW] Firebase messaging service worker initialized');
  } catch (error) {
    console.error('[SW] Service worker initialization error:', error);
  }