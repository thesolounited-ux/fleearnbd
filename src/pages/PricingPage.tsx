import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PricingPlan } from '../types';
import { Check, Smartphone, Info } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const { t, language, navigateTo } = useApp();
  const defaultPlans: PricingPlan[] = [
    {
      id: "plan-starter",
      name: "Starter Community",
      name_bn: "স্টার্টার কমিউনিটি",
      price: 0,
      priceUSD: 0,
      priceFSD: 0,
      currency: "Free",
      billingType: "Lifetime",
      duration: "Lifetime",
      validity: "Lifetime",
      shortDescription: "Open access for beginner task contributors and micro-earners.",
      description: "Zero barrier to start. Browse verified notice boards, take onboarding skill tests, and complete baseline community microtasks.",
      features: [
        "Full access to beginner verified task queues",
        "Public notice board & official document access",
        "Standard multi-currency withdrawal channels",
        "Community forum & self-service knowledge base"
      ],
      isFeatured: false,
      status: "active",
      order: 1
    },
    {
      id: "plan-pro",
      name: "Pro Freelancer",
      name_bn: "প্রো ফ্রিল্যান্সার",
      price: 24,
      priceUSD: 24,
      priceFSD: 240,
      currency: "USD / FSD",
      billingType: "Monthly",
      duration: "1 Month",
      validity: "Monthly",
      shortDescription: "Accelerated earning opportunities & priority queue.",
      description: "Accelerated earning opportunities, prioritized contract allocation, lower withdrawal margins, and enhanced verification.",
      features: [
        "Priority queue for high-yield freelance tasks",
        "Fast-track 6-hour payout approvals",
        "Reduced transaction fee (1.8%)",
        "Skill verification badge & client rating boost",
        "Dedicated ticket response SLA (<4 hours)",
        "Access to Pro skill courses & toolkits"
      ],
      isFeatured: true,
      status: "active",
      order: 2
    },
    {
      id: "plan-elite",
      name: "Elite Creator & Agency",
      name_bn: "এলিট ক্রিয়েটর ও এজেন্সি",
      price: 69,
      priceUSD: 69,
      priceFSD: 690,
      currency: "USD / FSD",
      billingType: "Monthly",
      duration: "1 Month",
      validity: "Monthly",
      shortDescription: "Full suite for power task creators and team accounts.",
      description: "Full suite for power task creators, agency leads, direct client escrow, and team multi-accounts.",
      features: [
        "Unlimited custom task campaigns creation",
        "Zero payout platform commission",
        "Multi-agent team delegate accounts",
        "Dedicated VIP Account Concierge",
        "Direct API webhook access for bulk payouts",
        "Custom branded contractor certification"
      ],
      isFeatured: false,
      status: "active",
      order: 3
    }
  ];

  const [plans, setPlans] = useState<PricingPlan[]>(defaultPlans);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/pricing')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setPlans(data);
      })
      .catch(() => {});
  }, []);

  const handleSelectPlan = (plan: PricingPlan) => {
    // Redirect to Mobile Apps page for genuine installation & app reconciliation
    navigateTo('apps', { selectedPlan: plan.name });
  };

  const formatPrice = (plan: PricingPlan) => {
    const p = plan.price ?? plan.priceUSD ?? 0;
    if (p === 0) return "Free";
    const cur = plan.currency && !plan.currency.includes('USD') && plan.currency !== 'Free' ? ` ${plan.currency}` : '';
    return `$${p}${cur}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 space-y-10 sm:space-y-12">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3 px-2">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#18D6A0]">
          Participation Tiers & Subscriptions
        </span>
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#F3F7F5] tracking-tight">
          {t('pricingTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-[#A7B5AE] leading-relaxed max-w-xl mx-auto">
          {t('pricingSubtitle')}
        </p>
      </div>

      {/* Plans Grid - Fully responsive on mobile, tablet, and desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-2">
        {plans.map((plan) => {
          const billingLabel = plan.duration || plan.billingType || plan.validity || 'Monthly';
          const desc = plan.shortDescription || plan.description;

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border p-6 sm:p-8 flex flex-col justify-between transition-all w-full bg-[#111714] text-[#F3F7F5] ${
                plan.isFeatured
                  ? 'border-[#18D6A0] shadow-xl ring-1 ring-[#18D6A0]/40'
                  : 'border-[#34433B] shadow-sm'
              }`}
            >
              {plan.isFeatured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold text-[#F3F7F5] bg-[#044541] border border-[#18D6A0]/60 uppercase tracking-wider shadow">
                  {t('featuredPlan')}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#F3F7F5]">
                    {language === 'bn' && plan.name_bn ? plan.name_bn : plan.name}
                  </h3>
                  <p className="text-xs text-[#A7B5AE] mt-1.5 min-h-[30px] leading-relaxed">
                    {desc}
                  </p>
                </div>

                {/* Pricing Display */}
                <div className="pt-3 border-t border-[#34433B]">
                  <div className="flex items-baseline flex-wrap gap-2">
                    <span className="text-2xl sm:text-4xl font-extrabold text-[#F3F7F5] tabular-nums">
                      {formatPrice(plan)}
                    </span>
                    <span className="text-xs text-[#A7B5AE] font-medium">
                      / {billingLabel}
                    </span>
                  </div>
                  {plan.priceFSD !== undefined && (
                    <div className="text-[11px] text-[#84958C] font-mono mt-1">
                      Platform Credit: <strong className="text-[#18D6A0]">{plan.priceFSD} FSD</strong>
                    </div>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#84958C]">
                    Included Benefits
                  </span>
                  <ul className="space-y-2.5">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-[#A7B5AE]">
                        <Check className="w-4 h-4 text-[#18D6A0] shrink-0 mt-0.5" />
                        <span className="leading-snug text-[#F3F7F5]">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 sm:pt-8 mt-6 border-t border-[#34433B]">
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                    plan.isFeatured
                      ? 'bg-[#044541] hover:bg-[#065b56] text-[#F3F7F5] border border-[#18D6A0]/60 shadow-lg'
                      : 'bg-[#1A211E] hover:bg-[#232D29] text-[#F3F7F5] border border-[#34433B]'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-[#18D6A0] shrink-0" />
                  <span>{t('buyNow')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mandatory App Checkout & Settlement Security Notice */}
      <div className="p-4 sm:p-6 rounded-2xl border border-[#34433B] bg-[#111714] text-xs text-[#A7B5AE] flex items-start gap-3 shadow-sm">
        <Info className="w-5 h-5 text-[#18D6A0] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-[#F3F7F5]">
            Official Checkout Requisite
          </p>
          <p className="leading-relaxed">
            {t('pricingAppNotice')} Subscriptions purchased through verified channels undergo real-time cryptographic settlement on our server cluster before granting elevated tier privileges.
          </p>
        </div>
      </div>
    </div>
  );
};
