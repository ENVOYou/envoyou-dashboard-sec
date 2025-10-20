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

      initialize: () => {
        const state = get();
        if (!state.isInitialized) {
          console.log('AuthStore - Initializing auth state');

          // For development/testing, assume no valid authentication
          // In production, check for valid persisted data
          const hasValidAuth = !!(state.token && state.user);
          console.log('AuthStore - Has valid authentication:', hasValidAuth);

          set({
            isLoading: false,
            isInitialized: true,
          });

          console.log('AuthStore - Initialization complete');
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