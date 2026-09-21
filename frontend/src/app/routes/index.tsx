import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import { ProtectedRoute } from './ProtectedRoute';

// Auth Pages
import { LoginPage } from '../../pages/auth/LoginPage';
import { RegisterPage } from '../../pages/auth/RegisterPage';

// Mine Scoped Pages
import { MineDashboardPage } from '../../pages/mine/MineDashboardPage';
import { CompliancePage } from '../../pages/mine/CompliancePage';
import { InspectionsPage } from '../../pages/mine/InspectionsPage';
import { CreateInspectionPage } from '../../pages/mine/CreateInspectionPage';
import { ObservationsPage } from '../../pages/mine/ObservationsPage';
import { ContractorsPage } from '../../pages/mine/ContractorsPage';
import { AlertsPage } from '../../pages/mine/AlertsPage';
import { DocumentsPage } from '../../pages/mine/DocumentsPage';

// Admin Pages
import { AdminDashboardPage } from '../../pages/admin/AdminDashboardPage';
import { UsersPage } from '../../pages/admin/UsersPage';

// Corporate Pages
import { CorporateDashboardPage } from '../../pages/corporate/CorporateDashboardPage';
import { ComplianceDetailPage } from '../../pages/mine/ComplianceDetailPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected App Routes inside Shell */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        {/* Mine Scoped Routes */}
        <Route path="/mine/dashboard" element={<MineDashboardPage />} />
        <Route path="/mine/compliance" element={<CompliancePage />} />
        <Route path="/mine/inspections" element={<InspectionsPage />} />
        <Route path="/mine/inspections/new" element={<CreateInspectionPage />} />
        <Route path="/mine/observations" element={<ObservationsPage />} />
        <Route path="/mine/contractors" element={<ContractorsPage />} />
        <Route path="/mine/alerts" element={<AlertsPage />} />
        <Route path="/mine/documents" element={<DocumentsPage />} />

        {/* Corporate Routes */}
        <Route
          path="/corporate/dashboard"
          element={
            <ProtectedRoute allowedRoles={['corporate', 'admin', 'regulatory']}>
              <CorporateDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/mine/dashboard" replace />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
