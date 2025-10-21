import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false, // Start with false to avoid infinite loading
      isInitialized: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setToken: (token) => set({ token }),

      login: (user, token) => {
        console.log('AuthStore - Login called with user:', user, 'token:', token);

        // Store user data in localStorage for persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user));
        }

        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
        console.log('AuthStore - State updated after login');
      },

      logout: () => {
        console.log('AuthStore - Logout called');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
        console.log('AuthStore - Logout complete');
      },

      setLoading: (isLoading) => set({ isLoading }),

      initialize: async () => {
        const state = get();
        if (!state.isInitialized) {
          console.log('AuthStore - Initializing auth state');

          // Check for persisted authentication data
          if (typeof window !== 'undefined') {
            const storedToken = localStorage.getItem('auth_token');
            const storedUser = localStorage.getItem('user');

            console.log('AuthStore - Found stored token:', !!storedToken);
            console.log('AuthStore - Found stored user:', !!storedUser);

            if (storedToken) {
              console.log('AuthStore - Attempting to restore authentication');

              // Try to validate token by fetching user data
              try {
                // Import apiClient dynamically to avoid circular dependency
                const { apiClient } = await import('../lib/api-client');
                const userData = await apiClient.getCurrentUser();

                console.log('AuthStore - Successfully restored user:', userData);

                // Store the validated user data
                localStorage.setItem('user', JSON.stringify(userData));

                set({
                  user: userData,
                  token: storedToken,
                  isAuthenticated: true,
                  isLoading: false,
                  isInitialized: true,
                });

                console.log('AuthStore - Authentication restored successfully');
                return;
              } catch (error) {
                console.log('AuthStore - Failed to restore authentication:', error);

                // Token is invalid, clear stored data
                localStorage.removeItem('auth_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
              }
            }
          }

          // No valid authentication found
          set({
            isLoading: false,
            isInitialized: true,
          });

          console.log('AuthStore - Initialization complete (no valid auth)');
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper hooks
export const useUser = () => useAuthStore((state) => state.user);
export const useToken = () => useAuthStore((state) => state.token);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthInitialized = () => useAuthStore((state) => state.isInitialized);