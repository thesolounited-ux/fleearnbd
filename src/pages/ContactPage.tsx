import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Globe, MapPin, Send, CheckCircle2, Phone, ExternalLink } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { t, company } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(true);
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        setErrorMsg(data.error || 'Failed to deliver message.');
      }
    } catch (e) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-12">
      {/* Title */}
      <div className="max-w-2xl space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[#044541] dark:text-emerald-400">
          Institutional & Media Outreach
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
          {t('contactUsTitle')}
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t('contactUsSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Form */}
        <div className="lg:col-span-7 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              Send an Official Message
            </h2>
          </div>

          {successMsg ? (
            <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Message Received Successfully</span>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Our communications desk will reach out via your provided email address shortly.
              </p>
              <button
                onClick={() => setSuccessMsg(false)}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 underline cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                  {errorMsg}
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
                    placeholder="Your name"
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

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  {t('subject')}
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Inquiry topic"
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#044541]"
                />
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
                  placeholder="Write your message here..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#044541]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-lg text-xs font-bold text-white bg-[#044541] hover:bg-[#033633] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Transmitting...' : t('sendMessage')}</span>
              </button>
            </form>
          )}
        </div>

        {/* Company Official Information Card */}
        <div className="lg:col-span-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              Corporate Headquarters
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Verified physical entity & compliance contacts.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-neutral-400 block text-[11px]">Primary Office</span>
                <p className="font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5 leading-relaxed">
                  {company.address}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <span className="text-neutral-400 block text-[11px]">Direct Support Email</span>
                <a href={`mailto:${company.email}`} className="font-semibold text-[#044541] dark:text-emerald-400 hover:underline">
                  {company.email}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <span className="text-neutral-400 block text-[11px]">Official Web Domain</span>
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#044541] dark:text-emerald-400 hover:underline">
                  {company.website}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <span className="text-neutral-400 block text-[11px]">Direct Switchboard</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {company.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Official Media Channels
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(company.socialLinks).map(([k, v]) => (
                <a
                  key={k}
                  href={v}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 hover:bg-[#044541] hover:text-white transition-colors flex items-center justify-between text-neutral-700 dark:text-neutral-300 capitalize"
                >
                  <span>{k}</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
