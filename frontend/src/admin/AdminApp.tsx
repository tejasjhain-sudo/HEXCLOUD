import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './layout/AdminLayout';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminVpsPage } from './pages/AdminVpsPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminBillingPage } from './pages/AdminBillingPage';
import { AdminGpuPage } from './pages/AdminGpuPage';
import { AdminMonitoringPage } from './pages/AdminMonitoringPage';
import { AdminLogsPage } from './pages/AdminLogsPage';
import { AdminTicketsPage } from './pages/AdminTicketsPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';
import { AdminPlansPage } from './pages/AdminPlansPage';
import { AdminTrialRequestsPage } from './pages/AdminTrialRequestsPage';

export const AdminApp: React.FC = () => (
  <Routes>
    <Route element={<AdminLayout />}>
      <Route index element={<AdminDashboardPage />} />
      <Route path="vps" element={<AdminVpsPage />} />
      <Route path="users" element={<AdminUsersPage />} />
      <Route path="billing" element={<AdminBillingPage />} />
      <Route path="gpu" element={<AdminGpuPage />} />
      <Route path="monitoring" element={<AdminMonitoringPage />} />
      <Route path="plans" element={<AdminPlansPage />} />
      <Route path="logs" element={<AdminLogsPage />} />
      <Route path="tickets" element={<AdminTicketsPage />} />
      <Route path="trial-requests" element={<AdminTrialRequestsPage />} />
      <Route path="settings" element={<AdminSettingsPage />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Route>
  </Routes>
);

export default AdminApp;
