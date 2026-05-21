import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import type { RegionId } from '../types/admin';
import { REGIONS } from '../data/constants';

interface AdminContextValue {
  region: RegionId;
  setRegion: (r: RegionId) => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  wsConnected: boolean;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [region, setRegion] = useState<RegionId>('mumbai');
  const [globalSearch, setGlobalSearch] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [wsConnected] = useState(true);

  const toggleSidebar = useCallback(() => setSidebarCollapsed((c) => !c), []);

  const value = useMemo(
    () => ({
      region,
      setRegion,
      globalSearch,
      setGlobalSearch,
      sidebarCollapsed,
      toggleSidebar,
      wsConnected,
    }),
    [region, globalSearch, sidebarCollapsed, toggleSidebar, wsConnected],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export function useAdminContext(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdminContext must be used within AdminProvider');
  return ctx;
}

export function useAdminRegionLabel(regionId: RegionId): string {
  return REGIONS.find((r) => r.id === regionId)?.label ?? regionId;
}
