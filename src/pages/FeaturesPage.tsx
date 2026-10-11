import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PlatformFeature } from '../types';
import { ThreeCanvas } from '../components/ThreeCanvas';
import { 
  Briefcase, 
  MessageSquare, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Globe2, 
  Layers,
  ArrowRight
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const { t, navigateTo } = useApp();
  const [features, setFeatures] = useState<PlatformFeature[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    fetch('/api/features')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setFeatures(data);
      })
      .catch(console.error);
  }, []);

  const categories = ['All', 'Earning & Digital Work', 'Communication', 'Wallet & Payments'];

  const filteredFeatures = features.filter(f => {
    if (activeCategory === 'All') return true;
    return f.category === activeCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-16">
      {/* Animated Brand Introduction with 3D Centerpiece */}
      <div className="relative rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] p-8 lg:p-12 overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#044541] dark:text-emerald-400">
              Ecosystem Architecture
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 dark:text-white tracking-tight leading-tight">
              Built for Sustainable Digital Micro-Labor & Scalable Settlement
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-xl">
              Fleearn unifies certified task verification, low-latency mobile client synchronization, multi-party escrow agreements, and localized payment rails under a cohesive architecture.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigateTo('apps')}
                className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-[#044541] hover:bg-[#033633] transition-all cursor-pointer"
              >
                Download Mobile Client
              </button>
              <button
                onClick={() => navigateTo('pricing')}
                className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 cursor-pointer"
              >
                View Participation Tiers
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 h-64 lg:h-80 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center p-4">
            <ThreeCanvas className="w-full h-full" />
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Platform Modules & Capabilities
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Active operational services versus planned roadmap modules.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg self-start">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === c
                    ? 'bg-white dark:bg-[#111816] text-[#044541] dark:text-emerald-400 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map(feat => (
            <div
              key={feat.id}
              className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] flex flex-col justify-between space-y-4 hover:border-[#044541] dark:hover:border-emerald-600 transition-all shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-500">{feat.category}</span>
                  {feat.isImplemented ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{feat.status}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold text-[11px]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{feat.status}</span>
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  {feat.title}
                </h3>

                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {feat.description}
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 text-[11px] text-neutral-400 font-medium">
                {feat.isImplemented ? "Verified Operational API" : "Under Infrastructure Testing"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimers & Payment Rails Clarity */}
      <div className="p-6 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 space-y-3 text-xs text-neutral-600 dark:text-neutral-400">
        <h4 className="font-bold text-neutral-900 dark:text-white text-sm flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-[#044541] dark:text-emerald-400" />
          <span>Payment Gateway Availability & Compliance Disclosures</span>
        </h4>
        <p className="leading-relaxed">
          The payment rail names listed (e.g. bKash, Nagad, Rocket, Upay, Bank transfers, Payoneer, RedotPay, Binance, PhonePe) represent examples of tested settlement integrations. Payment availability is strictly contingent on user country of residence, currency regulations, identity tier completion, and provider compliance protocols. Fleearn does not claim that every payment rail is globally unrestricted.
        </p>
      </div>
    </div>
  );
};
