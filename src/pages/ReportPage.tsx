import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Flag, CheckCircle2, Lock } from 'lucide-react';

export const ReportPage: React.FC = () => {
  const { t } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Fraud & Deception');
  const [relatedItem, setRelatedItem] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; referenceId?: string; error?: string } | null>(null);

  const categories = [
    'Fraud & Deception',
    'Malicious APK / Tampered Package',
    'Task Abuse / Fake Completion',
    'Account Hijacking or Compromise',
    'System Vulnerability / Exploit Report',
    'Harassment / Impersonation',
    'Payment Grievance',
    'Other Integrity Violation',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterName: name || 'Anonymous Reporter',
          reporterEmail: email,
          category,
          relatedItem,
          description,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResult({ success: true, referenceId: data.report?.id || 'REP-' + Date.now().toString().slice(-6) });
        setName('');
        setEmail('');
        setRelatedItem('');
        setDescription('');
      } else {
        setResult({ error: data.error || 'Failed to file report. Please verify details and retry.' });
      }
    } catch {
      setResult({ error: 'Connection error while contacting integrity desk. Please check network.' });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#34433B] bg-[#1A211E] text-[#F3F7F5] placeholder:text-[#84958C] focus:border-[#18D6A0] focus:ring-1 focus:ring-[#18D6A0] outline-none min-h-[44px] transition-colors";
  const labelClass = "block text-xs font-semibold text-[#A7B5AE] mb-1.5";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-10 text-[#F3F7F5]">
      <div className="max-w-2xl space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-red-400 uppercase tracking-wider">
          <Flag className="w-4 h-4 text-red-400" />
          <span>Integrity & Security Dispatch</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#F3F7F5] tracking-tight">
          {t('reportIssueTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-[#A7B5AE]">
          {t('reportIssueSubtitle')}
        </p>
      </div>

      <div className="rounded-2xl border border-[#34433B] bg-[#111714] p-6 sm:p-10 shadow-sm space-y-8">
        {result?.success ? (
          <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-800 space-y-3">
            <div className="flex items-center gap-2 text-[#18D6A0] font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-[#18D6A0]" />
              <span>Report Transmitted to Security Auditing Board</span>
            </div>
            <p className="text-xs text-[#A7B5AE] leading-relaxed">
              Your security alert has been routed into our confidential arbitration queue. Case Reference Code:
            </p>
            <div className="p-3 bg-[#111714] rounded-lg border border-emerald-700 font-mono text-sm font-bold text-[#18D6A0] select-all">
              {result.referenceId}
            </div>
            <button
              onClick={() => setResult(null)}
              className="text-xs font-semibold text-[#18D6A0] underline cursor-pointer"
            >
              Submit an additional report
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {result?.error && (
              <div className="p-3 rounded-lg bg-red-950/50 border border-red-900 text-xs text-red-300">
                {result.error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  Reporter Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Leave blank for anonymous report"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Contact Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="reporter@example.com"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  Incident Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={inputClass}
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-[#1A211E] text-[#F3F7F5]">{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Related Task ID / User / Page URL
                </label>
                <input
                  type="text"
                  value={relatedItem}
                  onChange={(e) => setRelatedItem(e.target.value)}
                  placeholder="e.g. Task #904 or Member UID"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Detailed Incident Description & Evidence *
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what occurred, timestamp, evidence links, and suspected violation..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#34433B] bg-[#1A211E] text-[#F3F7F5] placeholder:text-[#84958C] focus:border-[#18D6A0] focus:ring-1 focus:ring-[#18D6A0] outline-none transition-colors"
              />
            </div>

            {/* Privacy Notice */}
            <div className="p-4 rounded-xl bg-[#1A211E] border border-[#34433B] text-xs text-[#A7B5AE] space-y-1.5 flex items-start gap-3">
              <Lock className="w-4 h-4 text-[#18D6A0] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#F3F7F5] block">Reporter Confidentiality Guarantee</strong>
                <span>
                  All incident reports and evidence logs are strictly encrypted and processed under privileged internal review. Your details will never be exposed to accused accounts or outside parties.
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow"
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
