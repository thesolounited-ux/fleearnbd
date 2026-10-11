import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Phone, MapPin, Globe, ExternalLink, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { t, company } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: name,
          userEmail: email,
          category: subject || 'General Inquiry',
          subject: subject || 'Official Website Contact Form Inquiry',
          message: message,
        }),
      });

      if (res.ok) {
        setSuccessMsg(true);
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        setErrorMsg('Failed to submit message. Please try again.');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#34433B] bg-[#1A211E] text-[#F3F7F5] placeholder:text-[#84958C] focus:border-[#18D6A0] focus:ring-1 focus:ring-[#18D6A0] outline-none min-h-[44px] transition-colors";
  const labelClass = "block text-xs font-semibold text-[#A7B5AE] mb-1.5";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-12 text-[#F3F7F5]">
      {/* Title */}
      <div className="max-w-2xl space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[#18D6A0]">
          Institutional & Media Outreach
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#F3F7F5] tracking-tight">
          {t('contactUsTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-[#A7B5AE]">
          {t('contactUsSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Form */}
        <div className="lg:col-span-7 rounded-2xl border border-[#34433B] bg-[#111714] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-[#34433B] pb-4">
            <h2 className="text-lg font-bold text-[#F3F7F5]">
              Send an Official Message
            </h2>
          </div>

          {successMsg ? (
            <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-800 space-y-3">
              <div className="flex items-center gap-2 text-[#18D6A0] font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-[#18D6A0]" />
                <span>Message Received Successfully</span>
              </div>
              <p className="text-xs text-[#A7B5AE]">
                Our communications desk will reach out via your provided email address shortly.
              </p>
              <button
                onClick={() => setSuccessMsg(false)}
                className="text-xs font-semibold text-[#18D6A0] underline cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-950/50 border border-red-900 text-xs text-red-300">
                  {errorMsg}
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
                    placeholder="Your name"
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

              <div>
                <label className={labelClass}>
                  {t('subject')}
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Inquiry topic"
                  className={inputClass}
                />
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
                  placeholder="Write your message here..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#34433B] bg-[#1A211E] text-[#F3F7F5] placeholder:text-[#84958C] focus:border-[#18D6A0] focus:ring-1 focus:ring-[#18D6A0] outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold text-white bg-[#044541] hover:bg-[#065b56] border border-[#18D6A0]/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow"
              >
                <Send className="w-4 h-4 text-[#18D6A0]" />
                <span>{submitting ? 'Transmitting...' : t('sendMessage')}</span>
              </button>
            </form>
          )}
        </div>

        {/* Company Official Information Card */}
        <div className="lg:col-span-5 rounded-2xl border border-[#34433B] bg-[#111714] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-[#34433B] pb-4">
            <h2 className="text-lg font-bold text-[#F3F7F5]">
              Corporate Headquarters
            </h2>
            <p className="text-xs text-[#A7B5AE] mt-0.5">
              Verified physical entity & compliance contacts.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#18D6A0] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#84958C] block text-[11px]">Primary Office</span>
                <p className="font-semibold text-[#F3F7F5] mt-0.5 leading-relaxed">
                  {company.address}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#18D6A0] shrink-0" />
              <div>
                <span className="text-[#84958C] block text-[11px]">Direct Support Email</span>
                <a href={`mailto:${company.email}`} className="font-semibold text-[#18D6A0] hover:underline">
                  {company.email}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-[#18D6A0] shrink-0" />
              <div>
                <span className="text-[#84958C] block text-[11px]">Official Web Domain</span>
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#18D6A0] hover:underline">
                  {company.website}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#18D6A0] shrink-0" />
              <div>
                <span className="text-[#84958C] block text-[11px]">Direct Switchboard</span>
                <span className="font-semibold text-[#F3F7F5]">
                  {company.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="pt-4 border-t border-[#34433B] space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#84958C]">
              Official Media Channels
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(company.socialLinks).map(([k, v]) => (
                <a
                  key={k}
                  href={v}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-[#1A211E] border border-[#34433B] hover:border-[#18D6A0] hover:bg-[#232D29] text-[#F3F7F5] transition-colors flex items-center justify-between capitalize"
                >
                  <span className="truncate">{k}</span>
                  <ExternalLink className="w-3 h-3 text-[#18D6A0] shrink-0 opacity-80" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
