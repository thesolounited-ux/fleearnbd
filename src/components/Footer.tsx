import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Globe, MapPin, Send, ExternalLink, Shield, Server } from 'lucide-react';

export const Footer: React.FC = () => {
  const { company, navigateTo, t, setIsGateModalOpen } = useApp();
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [userCountry, setUserCountry] = useState<string>('Bangladesh');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const HOLD_DURATION_MS = 5000;

  // Detect user IP and country on mount
  useEffect(() => {
    let isMounted = true;

    const detectLocation = async () => {
      try {
        // Fast geo-lookup
        const res = await fetch('https://ipapi.co/json/', {
          signal: AbortSignal.timeout ? AbortSignal.timeout(2500) : undefined
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.country_name && isMounted) {
            setUserCountry(data.country_name);
            return;
          }
        }
      } catch {
        // Try secondary fallback
      }

      try {
        const res2 = await fetch('https://api.country.is/', {
          signal: AbortSignal.timeout ? AbortSignal.timeout(2000) : undefined
        });
        if (res2.ok) {
          const data2 = await res2.json();
          if (data2 && data2.country && isMounted) {
            try {
              const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
              const name = regionNames.of(data2.country) || data2.country;
              setUserCountry(name);
              return;
            } catch {
              setUserCountry(data2.country);
              return;
            }
          }
        }
      } catch {
        // Fallback default
      }

      if (isMounted) {
        setUserCountry('Bangladesh');
      }
    };

    detectLocation();

    return () => {
      isMounted = false;
    };
  }, []);

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
    <footer className="w-full bg-[#0B0F0E] text-[#A7B5AE] border-t border-[#34433B] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Col 1 & 2: Brand & Company info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-[#F3F7F5]">
                {company.name}
              </span>
              <span className="text-xs text-[#18D6A0] font-medium">
                · {company.tagline}
              </span>
            </div>
            <p className="text-sm text-[#A7B5AE] max-w-sm leading-relaxed">
              International digital earning ecosystem providing verified microtask distribution, freelance client contracts, and secure multi-currency payouts.
            </p>

            <div className="space-y-2 text-xs text-[#A7B5AE] pt-2">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#18D6A0] shrink-0" />
                <a href={`mailto:${company.email}`} className="hover:text-[#F3F7F5] transition-colors">
                  {company.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[#18D6A0] shrink-0" />
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:text-[#F3F7F5] transition-colors">
                  {company.website}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#18D6A0] shrink-0" />
                <span>{company.address}</span>
              </div>
            </div>

            {/* Social channels */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-[#F3F7F5] block mb-2">Verified Community Channels</span>
              <div className="flex flex-wrap items-center gap-2">
                {Object.entries(company.socialLinks || {}).map(([network, url]) => (
                  <a
                    key={network}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-[#141C1A] hover:bg-[#1E2B27] border border-[#34433B] text-[11px] font-medium text-[#F3F7F5] capitalize flex items-center gap-1 transition-colors"
                  >
                    <span>{network}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-[#18D6A0]" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Col 3: Ecosystem */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider uppercase text-[#F3F7F5]">
              {t('features')}
            </h4>
            <ul className="space-y-2 text-xs text-[#A7B5AE]">
              <li>
                <button onClick={() => navigateTo('apps')} className="hover:text-[#F3F7F5] transition-colors cursor-pointer">
                  {t('mobileApps')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('pricing')} className="hover:text-[#F3F7F5] transition-colors cursor-pointer">
                  {t('pricing')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('notices')} className="hover:text-[#F3F7F5] transition-colors cursor-pointer">
                  {t('notices')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('features')} className="hover:text-[#F3F7F5] transition-colors cursor-pointer">
                  {t('exploreFeatures')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('gallery')} className="hover:text-[#F3F7F5] transition-colors cursor-pointer">
                  {t('gallery')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider uppercase text-[#F3F7F5]">
              {t('documents')}
            </h4>
            <ul className="space-y-2 text-xs text-[#A7B5AE]">
              <li>
                <button onClick={() => navigateTo('documents', { docId: 'doc-terms' })} className="hover:text-[#F3F7F5] transition-colors cursor-pointer">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('documents', { docId: 'doc-privacy' })} className="hover:text-[#F3F7F5] transition-colors cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('documents', { docId: 'doc-aup' })} className="hover:text-[#F3F7F5] transition-colors cursor-pointer">
                  Acceptable Use Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('documents', { docId: 'doc-refund' })} className="hover:text-[#F3F7F5] transition-colors cursor-pointer">
                  Refund & Cancellation
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('documents', { docId: 'doc-payment' })} className="hover:text-[#F3F7F5] transition-colors cursor-pointer">
                  Payment & Escrow Policies
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Support & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider uppercase text-[#F3F7F5]">
              Support Desk
            </h4>
            <ul className="space-y-2 text-xs text-[#A7B5AE]">
              <li>
                <button onClick={() => navigateTo('faq')} className="hover:text-[#F3F7F5] transition-colors cursor-pointer">
                  {t('faq')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('support')} className="hover:text-[#F3F7F5] transition-colors cursor-pointer">
                  {t('support')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('report')} className="hover:text-[#F3F7F5] transition-colors cursor-pointer">
                  {t('report')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('contact')} className="hover:text-[#F3F7F5] transition-colors cursor-pointer">
                  {t('contact')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* User IP Detected Server Location Banner */}
        <div className="mt-10 pt-6 border-t border-[#34433B]">
          <div className="w-full py-3 px-4 rounded-xl bg-[#141C1A] border border-[#34433B] text-center text-xs text-[#A7B5AE] flex flex-col sm:flex-row items-center justify-center gap-2 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#18D6A0] animate-pulse shrink-0" />
              <Server className="w-3.5 h-3.5 text-[#18D6A0]" />
            </div>
            <span className="font-semibold text-[#F3F7F5] tracking-wide">
              {userCountry} — You are now under the service of our {userCountry} server.
            </span>
          </div>
        </div>

        {/* Bottom Bar with Hidden Access Trigger */}
        <div className="mt-6 pt-6 border-t border-[#1E2B27] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#84958C]">
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
                onTouchCancel={clearHold}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') startHold();
                }}
                onKeyUp={clearHold}
                className="select-none font-semibold text-[#A7B5AE] hover:text-[#F3F7F5] transition-colors focus:outline-none cursor-default"
                title=""
                aria-label="Fleearn Brand Wordmark"
              >
                {company.name}
              </button>

              {/* Discreet progress indicator */}
              {isHolding && (
                <div className="absolute -top-3 left-0 w-full h-1 bg-[#1A211E] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#18D6A0] transition-all duration-75"
                    style={{ width: `${holdProgress}%` }}
                  />
                </div>
              )}
            </div>
            <span>© {new Date().getFullYear()} {company.name} Ecosystem. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-[#84958C]">
            <span>Official International Portal</span>
            <span aria-hidden="true">·</span>
            <span>WCAG 2.1 Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
