import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

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
 * This is called when we get a 401 error (token expired)
 * @returns The new access token or null if refresh failed
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    console.error('No refresh token available');
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
    console.log('🔄 Token expired, refreshing access token...');
    
    const { data, error } = await supabaseClient.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error) {
      console.error('❌ Token refresh error:', error);
      isRefreshing = false;
      return null;
    }

    if (data?.session?.access_token) {
      const newAccessToken = data.session.access_token;
      const newRefreshToken = data.session.refresh_token;

      localStorage.setItem('token', newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem('refresh_token', newRefreshToken);
      }

      console.log('✅ Token refreshed successfully');
      
      isRefreshing = false;
      onRefreshed(newAccessToken);
      
      return newAccessToken;
    }

    isRefreshing = false;
    return null;
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    isRefreshing = false;
    return null;
  }
}

/**
 * Checks if the current token is expired or about to expire
 * @returns true if token needs refresh
 */
export function shouldRefreshToken(): boolean {
  if (typeof window === 'undefined') return false;

  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; 
    const now = Date.now();
    
    const bufferTime = 5 * 60 * 1000;
    return (exp - now) < bufferTime;
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
    return null;
  }

  if (shouldRefreshToken()) {
    const newToken = await refreshAccessToken();
    return newToken || currentToken;
  }

  return currentToken;
}

