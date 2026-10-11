import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PricingPlan } from '../types';
import { Check, Smartphone, Info } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const { t, language, navigateTo } = useApp();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pricing')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setPlans(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
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
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#044541] dark:text-emerald-400">
          Participation Tiers & Subscriptions
        </span>
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
          {t('pricingTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl mx-auto">
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
              className={`relative rounded-2xl border p-6 sm:p-8 flex flex-col justify-between transition-all w-full ${
                plan.isFeatured
                  ? 'border-[#044541] dark:border-emerald-500 bg-white dark:bg-[#111816] shadow-xl ring-2 ring-[#044541]/10 dark:ring-emerald-500/20'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] shadow-sm'
              }`}
            >
              {plan.isFeatured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold text-white bg-[#044541] uppercase tracking-wider shadow">
                  {t('featuredPlan')}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white">
                    {language === 'bn' && plan.name_bn ? plan.name_bn : plan.name}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 min-h-[30px] leading-relaxed">
                    {desc}
                  </p>
                </div>

                {/* Pricing Display */}
                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
                  <div className="flex items-baseline flex-wrap gap-2">
                    <span className="text-2xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tabular-nums">
                      {formatPrice(plan)}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                      / {billingLabel}
                    </span>
                  </div>
                  {plan.priceFSD !== undefined && (
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono mt-1">
                      Platform Credit: <strong className="text-neutral-700 dark:text-neutral-300">{plan.priceFSD} FSD</strong>
                    </div>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Included Benefits
                  </span>
                  <ul className="space-y-2">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 sm:pt-8 mt-6 border-t border-neutral-100 dark:border-neutral-800/80">
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-3 px-4 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                    plan.isFeatured
                      ? 'bg-[#044541] hover:bg-[#033633] text-white shadow'
                      : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4 shrink-0" />
                  <span>{t('buyNow')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mandatory App Checkout & Settlement Security Notice */}
      <div className="p-4 sm:p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 text-xs text-neutral-600 dark:text-neutral-400 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#044541] dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-neutral-900 dark:text-white">
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
