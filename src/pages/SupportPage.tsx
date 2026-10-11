import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SupportTicket } from '../types';
import { Send, CheckCircle2, Search, Clock, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

export const SupportPage: React.FC = () => {
  const { t } = useApp();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Account Issues');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ success: boolean; ticketId?: string; error?: string } | null>(null);

  // Ticket Lookup State
  const [trackId, setTrackId] = useState('');
  const [tracking, setTracking] = useState(false);
  const [trackedTicket, setTrackedTicket] = useState<Partial<SupportTicket> | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  const categories = [
    "Account Issues",
    "App Downloads & Installation",
    "Payment & Settlements",
    "Withdrawal Inquiries",
    "Task Verification Disputes",
    "Security & Privacy",
    "General Inquiries"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setSubmissionResult({ success: false, error: 'Please fill in all required fields.' });
      return;
    }

    setSubmitting(true);
    setSubmissionResult(null);

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, category, subject, message })
      });
      const data = await res.json();

      if (data.success && data.ticketId) {
        setSubmissionResult({ success: true, ticketId: data.ticketId });
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        setSubmissionResult({ success: false, error: data.error || 'Failed to submit ticket.' });
      }
    } catch (err) {
      setSubmissionResult({ success: false, error: 'Network communication error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackId.trim()) return;

    setTracking(true);
    setTrackError(null);
    setTrackedTicket(null);

    try {
      const res = await fetch(`/api/support/track/${encodeURIComponent(trackId.trim())}`);
      const data = await res.json();

      if (res.ok && data.id) {
        setTrackedTicket(data);
      } else {
        setTrackError(data.error || 'Ticket record not found. Please verify your Ticket ID.');
      }
    } catch (e) {
      setTrackError('Failed to fetch ticket status.');
    } finally {
      setTracking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-12">
      {/* Title */}
      <div className="max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-widest text-[#044541] dark:text-emerald-400">
          Official Helpdesk
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight mt-1">
          {t('supportCenterTitle')}
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          {t('supportCenterSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Support Request Form */}
        <div className="lg:col-span-7 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              Open a New Support Ticket
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Tickets are reviewed by designated regional support officers within 24 business hours.
            </p>
          </div>

          {submissionResult?.success ? (
            <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Ticket Submitted Successfully</span>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                Your inquiry has been stored in our support dispatch queue. Keep the following reference code:
              </p>
              <div className="p-3 bg-white dark:bg-[#111816] rounded-lg border border-emerald-300 dark:border-emerald-700 font-mono text-sm font-bold text-emerald-900 dark:text-emerald-200 select-all">
                {submissionResult.ticketId}
              </div>
              <button
                onClick={() => setSubmissionResult(null)}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 underline cursor-pointer"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {submissionResult?.error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{submissionResult.error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    {t('fullName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tariq Rahman"
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#044541]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    {t('emailAddress')} *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#044541]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    {t('category')} *
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
                    {t('subject')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of inquiry"
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#044541]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  {t('message')} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide comprehensive details regarding your query..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#044541]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-lg text-xs font-bold text-white bg-[#044541] hover:bg-[#033633] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Transmitting Ticket...' : t('submitTicket')}</span>
              </button>
            </form>
          )}
        </div>

        {/* Real-time Ticket Status Tracker */}
        <div className="lg:col-span-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-[#044541] dark:text-emerald-400" />
              <span>{t('trackTicket')}</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Check live status updates for a previously lodged inquiry.
            </p>
          </div>

          <form onSubmit={handleTrackTicket} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                {t('ticketIdLabel')}
              </label>
              <input
                type="text"
                required
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                placeholder="e.g. FLN-TK-81204"
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#044541]"
              />
            </div>
            <button
              type="submit"
              disabled={tracking}
              className="w-full py-2.5 rounded-lg text-xs font-bold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white transition-colors cursor-pointer"
            >
              {tracking ? 'Querying Status...' : t('searchTicket')}
            </button>
          </form>

          {trackError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
              {trackError}
            </div>
          )}

          {trackedTicket && (
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-neutral-400">{trackedTicket.id}</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  trackedTicket.status === 'Resolved'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : trackedTicket.status === 'In Progress'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                }`}>
                  {trackedTicket.status}
                </span>
              </div>

              <div>
                <span className="text-neutral-400 block text-[11px]">Subject</span>
                <p className="font-bold text-neutral-900 dark:text-white mt-0.5">
                  {trackedTicket.subject}
                </p>
              </div>

              <div>
                <span className="text-neutral-400 block text-[11px]">Category</span>
                <p className="text-neutral-700 dark:text-neutral-300">
                  {trackedTicket.category}
                </p>
              </div>

              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-400">
                Created: {new Date(trackedTicket.createdAt || '').toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
