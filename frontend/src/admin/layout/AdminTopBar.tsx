import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Bell, ChevronDown, Globe, LogOut, User, Shield,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useAdminContext } from '../context/AdminContext';
import { REGIONS } from '../data/constants';

const NOTIFICATIONS = [
  { id: '1', title: 'Node us-east degraded', body: 'CPU > 90% on node-us-01', time: '2m ago', type: 'warning' as const },
  { id: '2', title: 'New enterprise signup', body: 'fintech.co upgraded to PRO', time: '14m ago', type: 'info' as const },
  { id: '3', title: 'Abuse flag triggered', body: 'High outbound traffic on vps-882', time: '1h ago', type: 'critical' as const },
];

export const AdminTopBar: React.FC = () => {
  const { user, logout } = useStore();
  const { globalSearch, setGlobalSearch, region, setRegion, sidebarCollapsed } = useAdminContext();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header
      className="sticky top-0 z-30 h-16 flex items-center gap-4 px-6 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl"
      style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}
    >
      <div className="flex-1 max-w-xl relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          placeholder="Search VPS, users, invoices…"
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
          <Globe className="h-4 w-4 text-cyan-400" />
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value as typeof region)}
            className="bg-transparent text-xs font-semibold text-slate-300 focus:outline-none cursor-pointer"
          >
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id} className="bg-slate-900">
                {r.flag} {r.label.split(' ')[0]}
              </option>
            ))}
          </select>
        </div>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl p-2 shadow-glass z-50">
              <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase">Notifications</div>
              {NOTIFICATIONS.map((n) => (
                <div key={n.id} className="px-3 py-3 rounded-xl hover:bg-white/5 cursor-pointer">
                  <div className="text-sm font-semibold text-white">{n.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{n.body}</div>
                  <div className="text-[10px] text-slate-600 mt-1">{n.time}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white">
              {user?.email?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-white truncate max-w-[120px]">{user?.email ?? 'Admin'}</div>
              <div className="text-[10px] text-cyan-400 flex items-center gap-1">
                <Shield className="h-3 w-3" /> Super Admin
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 glass-panel rounded-2xl p-2 z-50">
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5">
                <User className="h-4 w-4" /> Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
