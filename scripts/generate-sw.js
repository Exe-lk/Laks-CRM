const fs = require('fs');
const path = require('path');
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  try {
    require('dotenv').config({ path: path.join(__dirname, '../.env') });
  } catch (e) {
    console.warn('dotenv not available, using existing environment variables');
  }
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('✅ Firebase config loaded:', {
  projectId: firebaseConfig.projectId,
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'MISSING'
});

const swContent = `// Service Worker for Firebase Cloud Messaging
// This file is auto-generated at build time
try {
    importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');
  
    // Initialize Firebase
    firebase.initializeApp(${JSON.stringify(firebaseConfig, null, 2)});
  
    const messaging = firebase.messaging();
  
  // Handle background messages
  messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Background message received:', payload);
    
    const data = payload.data || {};
    // Create unique tag using type + relevant ID + timestamp to show ALL notifications
    const uniqueTag = \`\${data.type || 'notification'}_\${data.request_id || data.booking_id || ''}_\${Date.now()}\`;
    
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
  
  // Handle push events (required for iOS)
  self.addEventListener('push', (event) => {
    console.log('[SW] Push event received:', event);
    
    let notificationData = {};
    let notificationTitle = 'New Notification';
    let notificationBody = '';
    
    if (event.data) {
      try {
        const payload = event.data.json();
        notificationData = payload.data || {};
        notificationTitle = payload.notification?.title || notificationTitle;
        notificationBody = payload.notification?.body || notificationBody;
      } catch (e) {
        console.error('[SW] Error parsing push data:', e);
        notificationBody = event.data.text();
      }
    }
    
    const uniqueTag = \`\${notificationData.type || 'notification'}_\${notificationData.request_id || notificationData.booking_id || ''}_\${Date.now()}\`;
    
    const notificationOptions = {
      body: notificationBody,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: notificationData,
      tag: uniqueTag,
      requireInteraction: false,
      vibrate: [200, 100, 200],
    };

    event.waitUntil(
      self.registration.showNotification(notificationTitle, notificationOptions)
    );
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
`;

const outputPath = path.join(__dirname, '../public/firebase-messaging-sw.js');
fs.writeFileSync(outputPath, swContent);
console.log('Service worker generated successfully');