import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../types';

interface ProtectedRouteProps { children: React.ReactNode; 
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, isLoading, isAuthenticated } = useAuthStore();



  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-600">Verifying session...</span>
        </div>
      </div>
    );
  }

  // If in development mode and no auth, allow through as mock admin
  if (!isAuthenticated && !user && import.meta.env.DEV) {
    return children ? <>{children}</> : <Outlet />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role) && user.role !== 'admin') {
    return <Navigate to="/mine/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

