import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './app/routes';
import { useAuthStore } from './stores/authStore';
import { useMineStore } from './stores/mineStore';

export const App: React.FC = () => {
  const { fetchProfile, isAuthenticated } = useAuthStore();
  const { fetchMines } = useMineStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMines();
    }
  }, [isAuthenticated, fetchMines]);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;

