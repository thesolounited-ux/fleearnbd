import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SupportTicket } from '../types';
import { Send, CheckCircle2, Search, AlertTriangle } from 'lucide-react';

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
    } catch {
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
    } catch {
      setTrackError('Failed to fetch ticket status.');
    } finally {
      setTracking(false);
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#34433B] bg-[#1A211E] text-[#F3F7F5] placeholder:text-[#84958C] focus:border-[#18D6A0] focus:ring-1 focus:ring-[#18D6A0] outline-none min-h-[44px] transition-colors";
  const labelClass = "block text-xs font-semibold text-[#A7B5AE] mb-1.5";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-12 text-[#F3F7F5]">
      {/* Title */}
      <div className="max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-widest text-[#18D6A0]">
          Official Helpdesk
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#F3F7F5] tracking-tight mt-1">
          {t('supportCenterTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-[#A7B5AE] mt-2">
          {t('supportCenterSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Support Request Form */}
        <div className="lg:col-span-7 rounded-2xl border border-[#34433B] bg-[#111714] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-[#34433B] pb-4">
            <h2 className="text-lg font-bold text-[#F3F7F5]">
              Open a New Support Ticket
            </h2>
            <p className="text-xs text-[#A7B5AE] mt-0.5">
              Tickets are reviewed by designated regional support officers within 24 business hours.
            </p>
          </div>

          {submissionResult?.success ? (
            <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-800 space-y-3">
              <div className="flex items-center gap-2 text-[#18D6A0] font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-[#18D6A0]" />
                <span>Ticket Submitted Successfully</span>
              </div>
              <p className="text-xs text-[#A7B5AE] leading-relaxed">
                Your inquiry has been stored in our support dispatch queue. Keep the following reference code:
              </p>
              <div className="p-3 bg-[#111714] rounded-lg border border-emerald-700 font-mono text-sm font-bold text-[#18D6A0] select-all">
                {submissionResult.ticketId}
              </div>
              <button
                onClick={() => setSubmissionResult(null)}
                className="text-xs font-semibold text-[#18D6A0] underline cursor-pointer"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {submissionResult?.error && (
                <div className="p-3 rounded-lg bg-red-950/50 border border-red-900 text-xs text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{submissionResult.error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    {t('fullName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tariq Rahman"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    {t('emailAddress')} *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    {t('category')} *
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
                    {t('subject')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of inquiry"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  {t('message')} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide comprehensive details regarding your query..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#34433B] bg-[#1A211E] text-[#F3F7F5] placeholder:text-[#84958C] focus:border-[#18D6A0] focus:ring-1 focus:ring-[#18D6A0] outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold text-white bg-[#044541] hover:bg-[#065b56] border border-[#18D6A0]/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow"
              >
                <Send className="w-4 h-4 text-[#18D6A0]" />
                <span>{submitting ? 'Transmitting Ticket...' : t('submitTicket')}</span>
              </button>
            </form>
          )}
        </div>

        {/* Real-time Ticket Status Tracker */}
        <div className="lg:col-span-5 rounded-2xl border border-[#34433B] bg-[#111714] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-[#34433B] pb-4">
            <h2 className="text-lg font-bold text-[#F3F7F5] flex items-center gap-2">
              <Search className="w-5 h-5 text-[#18D6A0]" />
              <span>{t('trackTicket')}</span>
            </h2>
            <p className="text-xs text-[#A7B5AE] mt-0.5">
              Check live status updates for a previously lodged inquiry.
            </p>
          </div>

          <form onSubmit={handleTrackTicket} className="space-y-3">
            <div>
              <label className={labelClass}>
                {t('ticketIdLabel')}
              </label>
              <input
                type="text"
                required
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                placeholder="e.g. FLN-TK-81204"
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={tracking}
              className="w-full py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold bg-[#1A211E] hover:bg-[#232D29] border border-[#34433B] text-[#F3F7F5] transition-colors cursor-pointer"
            >
              {tracking ? 'Querying Status...' : t('searchTicket')}
            </button>
          </form>

          {trackError && (
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-900 text-xs text-red-300">
              {trackError}
            </div>
          )}

          {trackedTicket && (
            <div className="p-4 rounded-xl bg-[#1A211E] border border-[#34433B] space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[#84958C]">{trackedTicket.id}</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                  trackedTicket.status === 'Resolved'
                    ? 'bg-emerald-950/80 text-[#18D6A0] border-emerald-800'
                    : trackedTicket.status === 'In Progress'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                    : 'bg-blue-950/80 text-blue-300 border-blue-800'
                }`}>
                  {trackedTicket.status}
                </span>
              </div>

              <div>
                <span className="text-[#84958C] block text-[11px]">Subject</span>
                <p className="font-bold text-[#F3F7F5] mt-0.5">
                  {trackedTicket.subject}
                </p>
              </div>

              <div>
                <span className="text-[#84958C] block text-[11px]">Category</span>
                <p className="text-[#A7B5AE]">
                  {trackedTicket.category}
                </p>
              </div>

              <div className="pt-2 border-t border-[#34433B] text-[11px] text-[#84958C]">
                Created: {new Date(trackedTicket.createdAt || '').toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
