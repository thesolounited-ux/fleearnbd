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
    if (!uid.trim() || !pin.trim()) {
      setError('UID and PIN are required.');
      return;
    }

    setLoading(true);
    setError(null);

    const gateToken = sessionStorage.getItem('fleearn_gate_token');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: uid.trim(), pin: pin.trim(), gateToken })
      });
      const data = await res.json();

      if (data.success && data.token) {
        setAdminToken(data.token);
        sessionStorage.removeItem('fleearn_gate_token');
        navigateTo('admin-dashboard');
      } else {
        setError(data.error || 'Invalid administrator credentials.');
      }
    } catch (e) {
      setError('Authentication server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white dark:bg-[#111816] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#044541] dark:text-emerald-400 mx-auto flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            Fleearn Central Console
          </h1>
          <p className="text-xs text-neutral-500">
            Authorized Administrator Authentication Terminal
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
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
                placeholder="Setup default: 250660"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#044541]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
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
                placeholder="Setup default: 131"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#044541]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-xs font-bold text-white bg-[#044541] hover:bg-[#033633] transition-all cursor-pointer shadow disabled:opacity-60"
          >
            {loading ? 'Authenticating...' : 'Authenticate Admin Session'}
          </button>
        </form>

        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
          <button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Portal</span>
          </button>
          <span className="font-mono text-[10px]">Session Timeout: 4h</span>
        </div>
      </div>
    </div>
  );
};
