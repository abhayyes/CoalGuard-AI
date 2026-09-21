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

      const mockRole = localStorage.getItem('mock_role');
      if (mockRole) {
        set({
          user: {
            id: 'mock-user-123',
            email: mockRole + '@coalguard.in',
            full_name: 'Demo ' + mockRole,
            role: mockRole as any,
            is_active: true,
            created_at: new Date().toISOString(), updated_at: new Date().toISOString()
          },
          assignedMines: [],
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      }

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
    localStorage.removeItem('mock_role');
    set({ user: null, assignedMines: [], isAuthenticated: false, isLoading: false });
    window.location.href = '/login';
  },
}));

