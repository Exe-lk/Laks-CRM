import { createClient } from '@supabase/supabase-js';
import { clearSessionStorage } from './sessionManager';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Logs out the user by clearing session storage and redirecting to appropriate login page
 */
function logoutUser(): void {
  if (typeof window === 'undefined') return;

  // Get user type from profile before clearing session storage
  let loginRoute = '/';
  const profileStr = localStorage.getItem('profile');
  
  if (profileStr) {
    try {
      const profile = JSON.parse(profileStr);
      
      // Determine login route based on profile structure
      if (profile.userType === 'branch') {
        loginRoute = '/branch/login';
      } else if (profile.emailAddress) {
        // Locum profiles have emailAddress field
        loginRoute = '/locumStaff/login';
      } else if (profile.email) {
        // Practice profiles have email field (not emailAddress)
        loginRoute = '/practiceUser/practiceLogin';
      }
    } catch (error) {
      console.error('Error parsing profile:', error);
    }
  }

  clearSessionStorage();
  window.location.href = loginRoute;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

/**
 * Refreshes the Supabase access token using the refresh token stored in localStorage
 * This is called when we get a 401 error (token expired) or proactively before expiry
 * @returns The new access token or null if refresh failed
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    console.error('No refresh token available');
    logoutUser();
    return null;
  }

  if (isRefreshing) {
    return new Promise<string | null>((resolve) => {
      addRefreshSubscriber((token: string) => {
        resolve(token);
      });
    });
  }

  isRefreshing = true;

  try {
    console.log('🔄 Refreshing access token...');
    
    const { data, error } = await supabaseClient.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error) {
      console.error('❌ Token refresh error:', error);
      isRefreshing = false;
      logoutUser();
      return null;
    }

    if (data?.session?.access_token) {
      const newAccessToken = data.session.access_token;
      const newRefreshToken = data.session.refresh_token;
      const expiresAt = data.session.expires_at;

      localStorage.setItem('token', newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem('refresh_token', newRefreshToken);
      }
      
      if (expiresAt) {
        localStorage.setItem('sessionExpiry', (expiresAt * 1000).toString());
        console.log('✅ Token refreshed successfully, new expiry:', new Date(expiresAt * 1000).toLocaleString());
      }

      isRefreshing = false;
      onRefreshed(newAccessToken);
      
      return newAccessToken;
    }

    isRefreshing = false;
    logoutUser();
    return null;
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    isRefreshing = false;
    logoutUser();
    return null;
  }
}

/**
 * Checks if the current token is expired or about to expire (within 5 minutes)
 * @returns true if token needs refresh
 */
export function shouldRefreshToken(): boolean {
  if (typeof window === 'undefined') return false;

  const token = localStorage.getItem('token');
  const sessionExpiry = localStorage.getItem('sessionExpiry');
  
  if (!token || !sessionExpiry) return false;

  try {
    const expiryTime = parseInt(sessionExpiry, 10);
    const now = Date.now();
    
    const bufferTime = 5 * 60 * 1000;
    const shouldRefresh = (expiryTime - now) < bufferTime;
    
    if (shouldRefresh) {
      const minutesLeft = Math.floor((expiryTime - now) / 1000 / 60);
      console.log(`⏰ Token expiring in ${minutesLeft} minutes, refreshing...`);
    }
    
    return shouldRefresh;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return false;
  }
}

/**
 * Gets a valid access token, refreshing if necessary (proactive refresh)
 * @returns A valid access token or null if unable to get one
 */
export async function getValidToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const currentToken = localStorage.getItem('token');
  
  if (!currentToken) {
    logoutUser();
    return null;
  }

  if (shouldRefreshToken()) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      // Refresh failed, user will be logged out by refreshAccessToken
      return null;
    }
    return newToken;
  }

  return currentToken;
}

let tokenCheckInterval: NodeJS.Timeout | null = null;

/**
 * Starts a background interval that checks and refreshes the token every minute
 * This ensures tokens are refreshed before they expire
 */
export function startTokenRefreshMonitor(): void {
  if (typeof window === 'undefined') return;
  
  if (tokenCheckInterval) {
    clearInterval(tokenCheckInterval);
  }
  
  console.log('🔐 Starting token refresh monitor...');
  
  checkAndRefreshToken();
  
  tokenCheckInterval = setInterval(() => {
    checkAndRefreshToken();
  }, 60000);
}

/**
 * Stops the token refresh monitor
 */
export function stopTokenRefreshMonitor(): void {
  if (tokenCheckInterval) {
    clearInterval(tokenCheckInterval);
    tokenCheckInterval = null;
    console.log('🔐 Token refresh monitor stopped');
  }
}

/**
 * Internal function to check and refresh token if needed
 */
async function checkAndRefreshToken(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  const token = localStorage.getItem('token');
  const sessionExpiry = localStorage.getItem('sessionExpiry');
  
  if (!token || !sessionExpiry) return;
  
  if (shouldRefreshToken()) {
    await refreshAccessToken();
  }
}

