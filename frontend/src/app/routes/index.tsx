import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import { ProtectedRoute } from './ProtectedRoute';

// Auth Pages
import { PortalSelectorPage } from '../../pages/auth/PortalSelectorPage';
import { RoleLoginPage } from '../../pages/auth/RoleLoginPage';
import { RoleRegisterPage } from '../../pages/auth/RoleRegisterPage';

// Mine Scoped Pages
import { MineDashboardPage } from '../../pages/mine/MineDashboardPage';
import { CompliancePage } from '../../pages/mine/CompliancePage';
import { InspectionsPage } from '../../pages/mine/InspectionsPage';
import { CreateInspectionPage } from '../../pages/mine/CreateInspectionPage';
import { ObservationsPage } from '../../pages/mine/ObservationsPage';
import { ContractorsPage } from '../../pages/mine/ContractorsPage';
import { AlertsPage } from '../../pages/mine/AlertsPage';
import { DocumentsPage } from '../../pages/mine/DocumentsPage';
import { RiskDashboardPage } from '../../pages/RiskDashboardPage';
import { CoalGisPage } from '../../pages/mine/CoalGisPage';

// Admin Pages
import { AdminDashboardPage } from '../../pages/admin/AdminDashboardPage';
import { UsersPage } from '../../pages/admin/UsersPage';
import { MinesConfigPage } from '../../pages/admin/MinesConfigPage';
import { AuditLogPage } from '../../pages/admin/AuditLogPage';

// Corporate Pages
import { CorporateDashboardPage } from '../../pages/corporate/CorporateDashboardPage';
import { CorporateReportsPage } from '../../pages/corporate/CorporateReportsPage';
import { ComplianceDetailPage } from '../../pages/mine/ComplianceDetailPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Login Routes */}
      <Route path="/login" element={<PortalSelectorPage />} />
      <Route path="/login/:role" element={<RoleLoginPage />} />
      <Route path="/register/:role" element={<RoleRegisterPage />} />
      <Route path="/register" element={<RoleRegisterPage />} />

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
        <Route path="/mine/risk" element={<RiskDashboardPage />} />
        <Route path="/mine/gis" element={<CoalGisPage />} />
        <Route path="/mine/map" element={<CoalGisPage />} />

        {/* Corporate Routes */}
        <Route
          path="/corporate/dashboard"
          element={
            <ProtectedRoute allowedRoles={['corporate', 'admin', 'regulatory']}>
              <CorporateDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/corporate/reports"
          element={
            <ProtectedRoute allowedRoles={['corporate', 'admin', 'regulatory']}>
              <CorporateReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/corporate/gis"
          element={
            <ProtectedRoute allowedRoles={['corporate', 'admin', 'regulatory']}>
              <CoalGisPage />
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
        <Route
          path="/admin/mines"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MinesConfigPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit-log"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AuditLogPage />
            </ProtectedRoute>
          }
        />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};


