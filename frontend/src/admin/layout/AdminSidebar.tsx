import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Server,
  Users,
  CreditCard,
  Cpu,
  ScrollText,
  LifeBuoy,
  Settings,
  Activity,
  Package,
  ChevronLeft,
  Cloud,
} from 'lucide-react';
import { useAdminContext } from '../context/AdminContext';

const navItems = [
  { to: '/admin', end: true, label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/vps', label: 'VPS Instances', icon: Server },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/billing', label: 'Billing', icon: CreditCard },
  { to: '/admin/gpu', label: 'GPU Nodes', icon: Cpu },
  { to: '/admin/monitoring', label: 'Monitoring', icon: Activity },
  { to: '/admin/plans', label: 'Plans & Pricing', icon: Package },
  { to: '/admin/logs', label: 'Logs', icon: ScrollText },
  { to: '/admin/tickets', label: 'Support Tickets', icon: LifeBuoy },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export const AdminSidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar, wsConnected } = useAdminContext();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-white/10 bg-slate-950/90 backdrop-blur-xl"
    >
      <div className={`flex items-center gap-3 p-5 border-b border-white/10 ${sidebarCollapsed ? 'justify-center' : ''}`}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 shrink-0">
          <Cloud className="h-5 w-5 text-white" />
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <div className="font-bold text-white tracking-tight">HexCloud</div>
            <div className="text-[10px] text-slate-500 truncate">Admin Console</div>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, end, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={sidebarCollapsed ? label : undefined}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 shadow-[0_0_20px_rgba(34,211,238,0.08)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              } ${sidebarCollapsed ? 'justify-center' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-cyan-400' : ''
                  }`}
                />
                {!sidebarCollapsed && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-2">
        {!sidebarCollapsed && (
          <div className="px-3 py-2 rounded-xl bg-white/5 text-[10px]">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-slate-400">WebSocket</span>
              <span className="text-emerald-400 font-semibold ml-auto">{wsConnected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 text-xs"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          {!sidebarCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
};
