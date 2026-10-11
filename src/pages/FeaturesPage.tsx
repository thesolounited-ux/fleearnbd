import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PlatformFeature } from '../types';
import { ThreeCanvas } from '../components/ThreeCanvas';
import { 
  CheckCircle2, 
  Clock, 
  Globe2
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const { navigateTo } = useApp();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-16 text-[#F3F7F5]">
      {/* Animated Brand Introduction with 3D Centerpiece */}
      <div className="relative rounded-3xl border border-[#34433B] bg-[#111714] p-6 sm:p-8 lg:p-12 overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#18D6A0]">
              Ecosystem Architecture
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#F3F7F5] tracking-tight leading-tight">
              Built for Sustainable Digital Micro-Labor & Scalable Settlement
            </h1>
            <p className="text-xs sm:text-base text-[#A7B5AE] leading-relaxed max-w-xl">
              Fleearn unifies certified task verification, low-latency mobile client synchronization, multi-party escrow agreements, and localized payment rails under a cohesive architecture.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigateTo('apps')}
                className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#F3F7F5] bg-[#044541] hover:bg-[#065b56] border border-[#18D6A0]/40 transition-all cursor-pointer"
              >
                Download Mobile Client
              </button>
              <button
                onClick={() => navigateTo('pricing')}
                className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#F3F7F5] bg-[#1A211E] hover:bg-[#232D29] border border-[#34433B] cursor-pointer"
              >
                View Participation Tiers
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 h-64 lg:h-80 rounded-2xl bg-[#1A211E] border border-[#34433B] flex items-center justify-center p-4">
            <ThreeCanvas className="w-full h-full" />
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#34433B] pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F3F7F5]">
              Platform Modules & Capabilities
            </h2>
            <p className="text-xs text-[#A7B5AE] mt-1">
              Active operational services versus planned roadmap modules.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#1A211E] border border-[#34433B] rounded-xl self-start overflow-x-auto max-w-full">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`min-h-[36px] px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === c
                    ? 'bg-[#044541] text-[#F3F7F5] border border-[#18D6A0]/40 shadow-sm'
                    : 'text-[#A7B5AE] hover:text-[#F3F7F5]'
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
              className="p-6 rounded-2xl border border-[#34433B] bg-[#111714] flex flex-col justify-between space-y-4 hover:border-[#18D6A0]/60 transition-all shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#84958C]">{feat.category}</span>
                  {feat.isImplemented ? (
                    <span className="flex items-center gap-1 text-[#18D6A0] font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{feat.status}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-400 font-semibold text-[11px]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{feat.status}</span>
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-[#F3F7F5]">
                  {feat.title}
                </h3>

                <p className="text-xs text-[#A7B5AE] leading-relaxed">
                  {feat.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#34433B] text-[11px] text-[#84958C] font-medium">
                {feat.isImplemented ? "Verified Operational API" : "Under Infrastructure Testing"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimers & Payment Rails Clarity */}
      <div className="p-6 rounded-2xl bg-[#1A211E] border border-[#34433B] space-y-3 text-xs text-[#A7B5AE]">
        <h4 className="font-bold text-[#F3F7F5] text-sm flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-[#18D6A0]" />
          <span>Payment Gateway Availability & Compliance Disclosures</span>
        </h4>
        <p className="leading-relaxed">
          The payment rail names listed (e.g. bKash, Nagad, Rocket, Upay, Bank transfers, Payoneer, RedotPay, Binance, PhonePe) represent examples of tested settlement integrations. Payment availability is strictly contingent on user country of residence, currency regulations, identity tier completion, and provider compliance protocols. Fleearn does not claim that every payment rail is globally unrestricted.
        </p>
      </div>
    </div>
  );
};
