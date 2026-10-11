import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Lock, Key, AlertTriangle, ArrowLeft } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { setAdminToken, navigateTo } = useApp();
  const [uid, setUid] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUid = uid.trim();
    const cleanPin = pin.trim();

    if (!cleanUid ||!cleanPin) {
      setError('UID and PIN are required.');
      return;
    }

    setLoading(true);
    setError(null);

    // 1. HARDCODED LOGIN FIRST - Works on Vercel + Cloudflare even without API
    if (cleanUid === '250660' && cleanPin === '1331') {
      const fallbackToken = 'adm_sess_' + Math.random().toString(36).substring(2) + '_' + Date.now();
      setAdminToken(fallbackToken);
      sessionStorage.removeItem('fleearn_gate_token');
      navigateTo('admin-dashboard');
      setLoading(false);
      return;
    }

    // 2. Try API Login (for future dynamic login)
    const gateToken = sessionStorage.getItem('fleearn_gate_token');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: cleanUid, pin: cleanPin, gateToken })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.token) {
        setAdminToken(data.token);
        sessionStorage.removeItem('fleearn_gate_token');
        navigateTo('admin-dashboard');
        return;
      }
      if (data.error) {
        setError(data.error);
      }
    } catch {
      // Network fail - ignore, will show invalid below
    }

    setError('Invalid administrator credentials.');
    setLoading(false);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-md bg-[#111816] rounded-2xl border border-[#1E2B27] p-6 sm:p-8 shadow-2xl space-y-6 text-neutral-100">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 mx-auto flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Fleearn Central Console
          </h1>
          <p className="text-xs text-neutral-400">
            Authorized Administrator Authentication Terminal
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/50 border border-red-900/60 text-xs text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Admin UID
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                autoComplete="username"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                placeholder="Enter UID"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[#1E2B27] bg-[#16201D] text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Security PIN
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter Security PIN"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[#1E2B27] bg-[#16201D] text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[#044541] hover:bg-[#065b56] active:scale-[0.99] transition-all cursor-pointer shadow-lg disabled:opacity-50 mt-2"
          >
            {loading? 'Authenticating...' : 'Authenticate Admin Session'}
          </button>
        </form>

        <div className="pt-4 border-t border-[#1E2B27] flex items-center justify-between text-xs text-neutral-400">
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Portal</span>
          </button>
          <span className="font-mono text-[10px] text-neutral-500">Session Secure</span>
        </div>
      </div>
    </div>
  );
};
