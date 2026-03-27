import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

/**
 * Auth Provider - Manages global authentication state
 * Fixed: Prevent infinite refresh token loop
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up axios interceptor for token refresh
  useEffect(() => {
    let isRefreshing = false;
    let failedQueue = [];
    
    const processQueue = (error, token = null) => {
      failedQueue.forEach(prom => {
        if (error) {
          prom.reject(error);
        } else {
          prom.resolve(token);
        }
      });
      failedQueue = [];
    };
    
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Skip if already retried
        if (originalRequest._retry) {
          console.log('[AuthContext] Request already retried, rejecting');
          return Promise.reject(error);
        }
        
        // Skip if this is the refresh-token request itself (prevent infinite loop)
        if (originalRequest.url?.includes('/api/auth/refresh-token')) {
          console.log('[AuthContext] This IS a refresh-token request, rejecting to prevent loop');
          return Promise.reject(error);
        }
        
        // Only handle 401 errors for protected endpoints (not auth endpoints)
        if (error.response?.status === 401 && !originalRequest.url?.includes('/api/auth/')) {
          console.log('[AuthContext] Got 401, checking if should refresh...');
          
          if (isRefreshing) {
            console.log('[AuthContext] Already refreshing, queuing request');
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then(token => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
              })
              .catch(err => Promise.reject(err));
          }
          
          originalRequest._retry = true;
          isRefreshing = true;
          
          try {
            console.log('[AuthContext] Attempting token refresh...');
            
            const response = await api.post('/api/auth/refresh-token');
            const { accessToken: newToken } = response.data.data;
            
            console.log('[AuthContext] Token refreshed successfully');
            
            setAccessToken(newToken);
            localStorage.setItem('accessToken', newToken);
            
            processQueue(null, newToken);
            
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            // Retry the original request
            const retryResponse = await api(originalRequest);
            isRefreshing = false;
            return retryResponse;
          } catch (refreshError) {
            console.error('[AuthContext] Token refresh failed:', refreshError);
            processQueue(refreshError, null);
            isRefreshing = false;
            // Only logout if it's a real auth error, not a network error
            if (refreshError.response?.status === 401) {
              console.log('[AuthContext] Refresh failed with 401, logging out');
              logout();
            }
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  // Check if user is logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      if (accessToken) {
        try {
          const response = await api.get('/api/auth/me');
          setUser(response.data.data.user);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [accessToken]);

  /**
   * Login function
   */
  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/api/auth/login', { email, password });
      
      const { user: userData, accessToken: token } = response.data.data;
      
      setUser(userData);
      setAccessToken(token);
      localStorage.setItem('accessToken', token);
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, message };
    }
  }, []);

  /**
   * Register function
   */
  const register = useCallback(async (name, email, password, role) => {
    try {
      setError(null);
      const response = await api.post('/api/auth/register', { name, email, password, role });
      return { success: true, message: response.data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, message };
    }
  }, []);

  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    accessToken,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default AuthContext;
