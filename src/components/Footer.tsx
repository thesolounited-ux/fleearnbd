import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Globe, MapPin, Send, ExternalLink, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  const { company, navigateTo, t, setIsGateModalOpen } = useApp();
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const HOLD_DURATION_MS = 5000;

  const startHold = () => {
    setIsHolding(true);
    setHoldProgress(0);

    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / HOLD_DURATION_MS) * 100));
      setHoldProgress(pct);
    }, 50);

    timerRef.current = setTimeout(() => {
      clearHold();
      setIsGateModalOpen(true);
    }, HOLD_DURATION_MS);
  };

  const clearHold = () => {
    setIsHolding(false);
    setHoldProgress(0);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  return (
    <footer className="w-full bg-neutral-900 text-neutral-300 border-t border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Col 1 & 2: Brand & Company info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white">
                {company.name}
              </span>
              <span className="text-xs text-emerald-400 font-medium">
                · {company.tagline}
              </span>
            </div>
            <p className="text-sm text-neutral-400 max-w-sm leading-relaxed">
              International digital earning ecosystem providing verified microtask distribution, freelance client contracts, and secure multi-currency payouts.
            </p>

            <div className="space-y-2 text-xs text-neutral-400 pt-2">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href={`mailto:${company.email}`} className="hover:text-white transition-colors">
                  {company.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  {company.website}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{company.address}</span>
              </div>
            </div>

            {/* Verified Social Media Links */}
            <div className="flex items-center gap-3 pt-2">
              {Object.entries(company.socialLinks).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-[#044541] hover:text-white text-xs text-neutral-300 font-medium capitalize transition-colors flex items-center gap-1"
                >
                  <span>{platform}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 3: Navigation Destinations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Ecosystem
            </h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <button onClick={() => navigateTo('home')} className="hover:text-white transition-colors cursor-pointer">
                  {t('home')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('notices')} className="hover:text-white transition-colors cursor-pointer">
                  {t('notices')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('apps')} className="hover:text-white transition-colors cursor-pointer">
                  {t('mobileApps')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('features')} className="hover:text-white transition-colors cursor-pointer">
                  {t('features')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('pricing')} className="hover:text-white transition-colors cursor-pointer">
                  {t('pricing')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('gallery')} className="hover:text-white transition-colors cursor-pointer">
                  {t('gallery')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Compliance
            </h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <button onClick={() => navigateTo('documents', { category: 'Terms and Conditions' })} className="hover:text-white transition-colors cursor-pointer">
                  Terms and Conditions
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('documents', { category: 'Privacy Policy' })} className="hover:text-white transition-colors cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('documents', { category: 'Acceptable Use Policy' })} className="hover:text-white transition-colors cursor-pointer">
                  Acceptable Use Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('documents', { category: 'Withdrawal Policy' })} className="hover:text-white transition-colors cursor-pointer">
                  Withdrawal Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('documents')} className="hover:text-white transition-colors cursor-pointer">
                  All Legal Documents
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Support & Assistance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Assistance
            </h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <button onClick={() => navigateTo('faq')} className="hover:text-white transition-colors cursor-pointer">
                  {t('faq')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('support')} className="hover:text-white transition-colors cursor-pointer">
                  {t('support')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('report')} className="hover:text-white transition-colors cursor-pointer">
                  {t('report')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('contact')} className="hover:text-white transition-colors cursor-pointer">
                  {t('contact')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Hidden Access Trigger */}
        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-3">
            {/* The Hidden Trigger: Press & Hold for 5 seconds on company name */}
            <div className="relative inline-block">
              <button
                type="button"
                onMouseDown={startHold}
                onMouseUp={clearHold}
                onMouseLeave={clearHold}
                onTouchStart={startHold}
                onTouchEnd={clearHold}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') startHold();
                }}
                onKeyUp={clearHold}
                className="select-none font-semibold text-neutral-400 hover:text-neutral-200 transition-colors focus:outline-none cursor-default"
                title=""
                aria-label="Fleearn Brand Wordmark"
              >
                {company.name}
              </button>

              {/* Discreet progress indicator */}
              {isHolding && (
                <div className="absolute -top-3 left-0 w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-75"
                    style={{ width: `${holdProgress}%` }}
                  />
                </div>
              )}
            </div>
            <span>© {new Date().getFullYear()} {company.name} Ecosystem. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-500">
            <span>Official International Portal</span>
            <span aria-hidden="true">·</span>
            <span>WCAG 2.1 Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
