import { create } from 'zustand';
import { User, Mine } from '../types';
import { apiClient } from '../lib/api';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  assignedMines: Mine[];
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  fetchProfile: () => Promise<void>;
  initialize: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  assignedMines: [],
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  initialize: () => set({ isLoading: false }),

  fetchProfile: async () => {
    try {
      set({ isLoading: true });
      const response = await apiClient.get('/auth/me');
      const { user, assigned_mines } = response.data;
      set({
        user,
        assignedMines: assigned_mines || [],
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      set({ user: null, assignedMines: [], isAuthenticated: false, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Supabase signOut error:', e);
    }
    set({ user: null, assignedMines: [], isAuthenticated: false, isLoading: false });
    window.location.href = '/login';
  },
}));
