import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { refreshAccessToken, getValidToken, stopTokenRefreshMonitor } from '@/utils/tokenRefresh';

/**
 * Creates a base query with automatic token refresh on 401 errors
 * 
 * How it works:
 * 1. Proactively checks if token needs refresh before making requests
 * 2. If request returns 401, automatically refreshes token using refresh_token
 * 3. Retries the original request with new token
 * 4. If refresh fails, redirects to login page
 * 
 * @param baseUrl The base URL for API endpoints
 * @returns A base query function with token refresh capability
 */
export const createBaseQueryWithReauth = (baseUrl: string): BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> => {
  const baseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: async (headers) => {
      const token = await getValidToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  });

  return async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
      console.log('🔒 Got 401 error, attempting to refresh token...');
      
      const newToken = await refreshAccessToken();
      
      if (newToken) {
        console.log('✅ Token refreshed successfully, retrying request...');
        result = await baseQuery(args, api, extraOptions);
      } else {
        console.error('❌ Token refresh failed, redirecting to login...');
        if (typeof window !== 'undefined') {
          stopTokenRefreshMonitor();
          
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('profile');
          localStorage.removeItem('locumId');
          localStorage.removeItem('practiceId');
          localStorage.removeItem('branchId');
          localStorage.removeItem('sessionExpiry');
          
          window.location.href = '/';
        }
      }
    }

    return result;
  };
};

