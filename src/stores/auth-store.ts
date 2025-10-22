import { create } from 'zustand';
import { apiClient } from '../lib/api-client';
import { User } from '../types/reports';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  initialize: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  error: null,
  initialize: async () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const user = await apiClient.getCurrentUser();
        set({ user, isAuthenticated: true, isLoading: false, isInitialized: true });
      } else {
        set({ isLoading: false, isInitialized: true });
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true, error: (error as Error).message });
    }
  },
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false });
  },
}));
