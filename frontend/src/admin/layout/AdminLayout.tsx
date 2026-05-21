import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminProvider, useAdminContext } from '../context/AdminContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';
import { useStore } from '../../store/useStore';

const AdminLayoutInner: React.FC = () => {
  const { sidebarCollapsed } = useAdminContext();
  const fetchAdminData = useStore((s) => s.fetchAdminData);

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 15000);
    return () => clearInterval(interval);
  }, [fetchAdminData]);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 admin-shell">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
      </div>
      <AdminSidebar />
      <div
        className="relative min-h-screen transition-[margin] duration-300"
        style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}
      >
        <AdminTopBar />
        <main className="p-6 pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const AdminLayout: React.FC = () => (
  <AdminProvider>
    <AdminLayoutInner />
  </AdminProvider>
);
