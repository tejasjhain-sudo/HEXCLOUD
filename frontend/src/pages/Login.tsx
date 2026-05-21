import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { supabase, supabaseConfigError } from '../config/supabase';
import { KeyRound, Mail, AlertTriangle, ArrowRight, Chrome } from 'lucide-react';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  
  const { error, setError, token } = useStore();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setError(null);
    setLocalLoading(true);

    if (!email || !password) {
      setValidationError('Please fill in all fields');
      setLocalLoading(false);
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      setLocalLoading(false);
      return;
    }

    if (supabaseConfigError) {
      setError(supabaseConfigError);
      setLocalLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Supabase sign in
        const { error: supabaseErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (supabaseErr) {
          setError(supabaseErr.message);
        } else {
          navigate('/dashboard');
        }
      } else {
        // Supabase sign up
        const { error: supabaseErr } = await supabase.auth.signUp({
          email,
          password,
        });
        if (supabaseErr) {
          setError(supabaseErr.message);
        } else {
          setValidationError('Registration successful! Please sign in.');
          setIsLogin(true);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'Load failed' || msg === 'Failed to fetch') {
        setError(
          'Cannot reach Supabase. In Vercel, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, redeploy, and add your Vercel URL in Supabase → Authentication → URL Configuration.',
        );
      } else {
        setError(msg || 'An error occurred during authentication.');
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard',
        }
      });
      if (oauthErr) {
        setError(oauthErr.message);
      }
    } catch (err) {
      setError('OAuth login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex items-center justify-center select-none text-slate-800">
      {/* Background radial effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(99,102,241,0.08),rgba(255,255,255,0))]" />

      <div className="relative z-10 w-full max-w-md p-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-3xl font-extrabold tracking-wider">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">HEX</span>
            <span className="text-slate-800">Cloud</span>
          </span>
          <p className="text-sm text-slate-500 mt-2">Enterprise-grade computing on-demand</p>
        </div>

        {/* Auth Panel */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-8 relative shadow-xl">
          <div className="flex border-b border-slate-100 pb-4 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 text-center py-2 text-sm font-extrabold transition-all ${
                isLogin ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 text-center py-2 text-sm font-extrabold transition-all ${
                !isLogin ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-all text-slate-900 font-semibold"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-all text-slate-900 font-semibold"
                />
              </div>
            </div>

            {/* Notifications */}
            {(validationError || error) && (
              <div className="flex items-start space-x-2 rounded-xl bg-rose-50 p-3.5 text-rose-700 border border-rose-100 text-xs">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-rose-600" />
                <span>{validationError || error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={localLoading}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <span>{isLogin ? 'Sign In to Dashboard' : 'Create Free Account'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center justify-between text-xs text-slate-450 font-bold">
            <span className="w-full h-px bg-slate-100" />
            <span className="px-3 shrink-0">OR CONTINUE WITH</span>
            <span className="w-full h-px bg-slate-100" />
          </div>

          {/* Social login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-xs rounded-xl font-bold transition-all text-slate-700 shadow-sm"
          >
            <Chrome className="h-4 w-4" />
            <span>Continue with Google</span>
          </button>

          {/* Quick Info */}
          <div className="mt-6 text-center text-[10px] text-slate-500 leading-relaxed">
            <p>Admin credentials: register and use an email ending in <b>@hexcloud.com</b></p>
          </div>
        </div>
      </div>
    </div>
  );
};
