import React, { useState } from 'react';
import { Key, Mail, Globe, Palette, Shield, Save } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';

type SettingsTab = 'api' | 'smtp' | 'domain' | 'branding' | 'security';

export const AdminSettingsPage: React.FC = () => {
  const [tab, setTab] = useState<SettingsTab>('api');
  const [brandName, setBrandName] = useState('HexCloud');
  const [tagline, setTagline] = useState('High performance cloud VPS & GPU infrastructure');

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'smtp', label: 'SMTP Email', icon: Mail },
    { id: 'domain', label: 'Domain', icon: Globe },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">System Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Platform configuration for multi-tenant cloud</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                tab === t.id ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400' : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          );
        })}
      </div>

      <GlassCard padding="lg" className="max-w-2xl">
        {tab === 'api' && (
          <div className="space-y-4">
            <h2 className="font-bold text-white">API Keys</h2>
            <input placeholder="Production API key" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-mono text-slate-300" defaultValue="hc_live_••••••••••••••••" />
            <input placeholder="Webhook signing secret" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-mono text-slate-300" />
          </div>
        )}
        {tab === 'smtp' && (
          <div className="space-y-4">
            <h2 className="font-bold text-white">SMTP Email</h2>
            {['Host', 'Port', 'Username', 'Password'].map((f) => (
              <input key={f} placeholder={f} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white" />
            ))}
          </div>
        )}
        {tab === 'domain' && (
          <div className="space-y-4">
            <h2 className="font-bold text-white">Domain configuration</h2>
            <input defaultValue="cloud.hexcloud.io" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white" />
            <input placeholder="Custom CNAME for console" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white" />
          </div>
        )}
        {tab === 'branding' && (
          <div className="space-y-4">
            <h2 className="font-bold text-white">Branding</h2>
            <label className="text-xs text-slate-500">Company name</label>
            <input value={brandName} onChange={(e) => setBrandName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white" />
            <label className="text-xs text-slate-500">Tagline</label>
            <input value={tagline} onChange={(e) => setTagline(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white" />
            <div className="p-6 rounded-xl border border-dashed border-white/20 text-center text-slate-500 text-sm">
              Drop logo (SVG/PNG) — 512×512 recommended
            </div>
          </div>
        )}
        {tab === 'security' && (
          <div className="space-y-4">
            <h2 className="font-bold text-white">Security</h2>
            {[
              { label: 'Enforce 2FA for admins', on: true },
              { label: 'JWT rotation (7 days)', on: true },
              { label: 'Role-based access control', on: true },
              { label: 'IP allowlist for API', on: false },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-sm text-slate-300">{s.label}</span>
                <div className={`w-10 h-6 rounded-full ${s.on ? 'bg-cyan-500' : 'bg-slate-700'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white mt-1 ${s.on ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
              </div>
            ))}
          </div>
        )}
        <button className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-500">
          <Save className="h-4 w-4" /> Save changes
        </button>
      </GlassCard>
    </div>
  );
};
