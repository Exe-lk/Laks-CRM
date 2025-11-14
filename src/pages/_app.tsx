import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import store from "../redux/store";
import ProtectedRoute from "../pages/components/ProtectedRoute/ProtectedRoute";
import { useEffect, useState } from "react";
import { usePushNotifications } from "@/hooks/useNotifications";
import { UserType } from "@/types/notifications";

function NotificationInitializer() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkUser = () => {
      const profile = localStorage.getItem('profile');
      const userRole = localStorage.getItem('userRole');
      
      if (profile) {
        try {
          const parsedProfile = JSON.parse(profile);
          setUserId(parsedProfile.id || null);
          
          // Determine user type from userRole
          if (userRole === 'locum') {
            setUserType('locum');
          } else if (userRole === 'practice' || userRole === 'practiceAdmin') {
            setUserType('practice');
          } else if (userRole === 'branch') {
            setUserType('branch');
          }
        } catch (e) {
          console.error('Failed to parse profile:', e);
        }
      }
    };

    // Check immediately
    checkUser();

    // Listen for storage changes (when user logs in on another tab or logs out)
    window.addEventListener('storage', checkUser);
    
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  // Initialize notifications if user is logged in
  usePushNotifications(userId, userType || 'locum');

  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Force update the service worker on page load
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.update();
        });
      });

      navigator.serviceWorker
        .register('/firebase-messaging-sw.js', {
          scope: '/',
        })
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration.scope);
          
          // Force an immediate update check
          registration.update();
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('✅ New service worker installed and ready');
                }
              });
            }
          });
        })
        .catch((err) => {
          console.error('Service Worker registration failed:', err);
          console.error('Error details:', {
            message: err.message,
            stack: err.stack,
            name: err.name,
          });
        });
    } else {
      console.log('Service Workers are not supported in this browser');
    }
  }, []);
  
  return (
    <Provider store={store}>
      <NotificationInitializer />
      <ProtectedRoute>
        <Component {...pageProps} />
      </ProtectedRoute>
    </Provider>
  );
}
