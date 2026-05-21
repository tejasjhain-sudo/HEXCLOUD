import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const token = useStore((state) => state.token);
  const user = useStore((state) => state.user);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
