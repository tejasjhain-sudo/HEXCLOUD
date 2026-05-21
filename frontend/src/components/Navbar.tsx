import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Menu, X, Cpu, Server, Wallet, LogOut, ShieldAlert, CreditCard } from 'lucide-react';
import { formatInr } from '../lib/vpsPricing';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const { user, logout } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Cpu },
    { name: 'VPS VPS', path: '/vps', icon: Server },
    { name: 'Cloud PC', path: '/cloud-pc', icon: Cpu },
    { name: 'Billing', path: '/billing', icon: CreditCard },
  ];

  const isAdminShell = location.pathname.startsWith('/admin');
  const showNavbar = location.pathname !== '/' && location.pathname !== '/login' && !isAdminShell;

  if (!showNavbar) return null;

  return (
    <nav className="bg-white/80 border-b border-slate-200/80 backdrop-blur-md sticky top-0 z-50 w-full px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center space-x-2">
          <span className="text-2xl font-extrabold tracking-wider">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">HEX</span>
            <span className="text-slate-800">Cloud</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center space-x-8 md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-2 text-sm font-semibold transition-colors hover:text-indigo-600 ${
                  isActive ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : 'text-slate-500'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}

          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className={`flex items-center space-x-2 text-sm font-semibold text-purple-600 transition-colors hover:text-purple-500 ${
                location.pathname.startsWith('/admin') ? 'border-b-2 border-purple-600 pb-1' : ''
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Admin Panel</span>
            </Link>
          )}
        </div>

        {/* User Info & Actions */}
        <div className="hidden items-center space-x-6 md:flex">
          {/* Wallet Balance */}
          <div className="flex items-center space-x-2 rounded-full bg-slate-50 px-4 py-1.5 border border-slate-200">
            <Wallet className="h-4 w-4 text-indigo-600" />
            <span className="text-xs text-slate-500">Balance:</span>
            <span className="text-sm font-bold text-slate-800">{formatInr(user?.walletBalance ?? 0)}</span>
          </div>

          {/* User Tier Tag */}
          <span className="rounded bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-100">
            {user?.planType} Tier
          </span>

          {/* Log Out */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 md:hidden"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 flex flex-col space-y-2 md:hidden"
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 ${
                    location.pathname === link.path ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 rounded-lg px-4 py-2.5 text-sm font-semibold text-purple-650 hover:bg-slate-50"
              >
                <ShieldAlert className="h-5 w-5" />
                <span>Admin Panel</span>
              </Link>
            )}

            <div className="border-t border-slate-100 pt-4 flex flex-col space-y-3">
              <div className="flex items-center justify-between px-4">
                <span className="text-xs text-slate-500">Wallet Balance:</span>
                <span className="text-sm font-bold text-indigo-600">{formatInr(user?.walletBalance ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between px-4">
                <span className="text-xs text-slate-500">Subscription:</span>
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">{user?.planType}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center space-x-2 rounded-lg bg-rose-50 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-100/50"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
