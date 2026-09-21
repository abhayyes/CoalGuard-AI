import axios from 'axios';
import { supabase } from './supabase';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://coalguard-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  try {
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder-supabase.supabase.co') {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    }
  } catch (err) {
    console.warn('Could not attach auth session to request:', err);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional handling for unauthorized token expiry
    }
    return Promise.reject(error);
  }
);
