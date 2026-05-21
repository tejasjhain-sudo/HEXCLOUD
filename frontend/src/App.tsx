import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Vps } from './pages/Vps';
import { VpsManage } from './pages/VpsManage';
import { CloudPc } from './pages/CloudPc';
import { Billing } from './pages/Billing';
import { AdminApp } from './admin/AdminApp';
import { useStore } from './store/useStore';
import { AiChatbot } from './components/AiChatbot';

export const App: React.FC = () => {
  const init = useStore((state) => state.init);
  const location = useLocation();
  const isAdminShell = location.pathname.startsWith('/admin');

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isAdminShell ? 'bg-[#030712] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <Navbar />
      <div className="flex-1">
        <Routes>
          {/* Public Views */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Developer / User Dashboard Views */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vps"
            element={
              <ProtectedRoute>
                <Vps />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vps/:id"
            element={
              <ProtectedRoute>
                <VpsManage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cloud-pc"
            element={
              <ProtectedRoute>
                <CloudPc />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            }
          />

          {/* Protected System Administrator Views */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requireAdmin>
                <AdminApp />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      {!isAdminShell && <AiChatbot />}
    </div>
  );
};

export default App;
