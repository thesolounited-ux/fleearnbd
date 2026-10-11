import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Flag, CheckCircle2, AlertOctagon, Shield, Lock } from 'lucide-react';

export const ReportPage: React.FC = () => {
  const { t } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Suspicious Activity');
  const [relatedItem, setRelatedItem] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; referenceId?: string; error?: string } | null>(null);

  const categories = [
    "Suspicious Activity & Bot Farms",
    "Misleading Task Content",
    "Security Vulnerability or Bug",
    "Payment Gateway Malfunction",
    "Plagiarism & Copyright Infringement",
    "Harassment & Community Violation",
    "Other Policy Infraction"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !description.trim()) {
      setResult({ success: false, error: 'Email and description are required.' });
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, category, relatedItem, description })
      });
      const data = await res.json();

      if (data.success && data.referenceId) {
        setResult({ success: true, referenceId: data.referenceId });
        setName('');
        setEmail('');
        setRelatedItem('');
        setDescription('');
      } else {
        setResult({ success: false, error: data.error || 'Failed to submit report.' });
      }
    } catch (e) {
      setResult({ success: false, error: 'Network transmission failure.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-10">
      <div className="max-w-2xl space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
          <Flag className="w-4 h-4" />
          <span>Integrity & Security Dispatch</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
          {t('reportIssueTitle')}
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t('reportIssueSubtitle')}
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] p-6 sm:p-10 shadow-sm space-y-8">
        {result?.success ? (
          <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Report Transmitted to Security Auditing Board</span>
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
              Your security alert has been routed into our confidential arbitration queue. Case Reference Code:
            </p>
            <div className="p-3 bg-white dark:bg-[#111816] rounded-lg border border-emerald-300 dark:border-emerald-700 font-mono text-sm font-bold text-emerald-900 dark:text-emerald-200 select-all">
              {result.referenceId}
            </div>
            <button
              onClick={() => setResult(null)}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 underline cursor-pointer"
            >
              Submit an additional report
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {result?.error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                {result.error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Reporter Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Leave blank for anonymous report"
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#044541]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Contact Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="reporter@example.com"
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#044541]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Incident Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#044541]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Related Task ID / User / Page URL
                </label>
                <input
                  type="text"
                  value={relatedItem}
                  onChange={(e) => setRelatedItem(e.target.value)}
                  placeholder="e.g. Task #904 or Member UID"
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#044541]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Detailed Incident Description & Evidence *
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what occurred, timestamp, evidence links, and suspected violation..."
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#044541]"
              />
            </div>

            {/* Privacy Notice */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 space-y-1.5 flex items-start gap-3">
              <Lock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-800 dark:text-neutral-200 block">Reporter Confidentiality Guarantee</strong>
                <span>
                  All incident reports and evidence logs are strictly encrypted and processed under privileged internal review. Your details will never be exposed to accused accounts or outside parties.
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow"
            >
              <Flag className="w-4 h-4" />
              <span>{submitting ? 'Submitting Report...' : t('submitReport')}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
