import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FAQItem } from '../types';
import { Search, ChevronDown, ThumbsUp, ThumbsDown, HelpCircle, Check, AlertCircle } from 'lucide-react';

export const FAQPage: React.FC = () => {
  const { t, language } = useApp();
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [votedMap, setVotedMap] = useState<Record<string, 'yes' | 'no'>>({});
  const [loading, setLoading] = useState(true);

  const categories = [
    "All",
    "General Information",
    "Account Registration & Login",
    "Earning Methods",
    "Rewards & Balance",
    "Withdrawals & Payments",
    "Referral Program",
    "Security & Privacy",
    "Tasks & Verification",
    "Apps & Downloads",
    "Pricing & Plans",
    "Wallet & Transactions",
    "Courses & Learning",
    "Notifications & Notices",
    "Technical Support",
    "Account Restrictions",
    "Privacy & Data Requests",
    "Rules & Compliance",
    "Troubleshooting",
    "Contact & Complaints",
    "Additional Questions"
  ];

  useEffect(() => {
    fetch('/api/faqs')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFaqs(data);
          if (data.length > 0) setExpandedId(data[0].id);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleVote = async (id: string, helpful: boolean) => {
    if (votedMap[id]) return;
    setVotedMap(prev => ({ ...prev, [id]: helpful ? 'yes' : 'no' }));

    try {
      const res = await fetch(`/api/faqs/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ helpful })
      });
      const data = await res.json();
      if (data.success) {
        setFaqs(prev => prev.map(f => {
          if (f.id === id) {
            return {
              ...f,
              helpfulCount: data.helpfulCount,
              unhelpfulCount: data.unhelpfulCount
            };
          }
          return f;
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredFaqs = faqs.filter(item => {
    const q = language === 'bn' && item.question_bn ? item.question_bn : item.question;
    const a = language === 'bn' && item.answer_bn ? item.answer_bn : item.answer;

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-12">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-[#044541] dark:text-emerald-400">
          Knowledge Base & User Assistance
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
          {t('faqTitle')}
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t('faqSubtitle')}
        </p>
      </div>

      {/* Search Input */}
      <div className="max-w-2xl mx-auto relative">
        <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('searchFaq')}
          className="w-full pl-12 pr-4 py-3.5 text-sm bg-white dark:bg-[#111816] border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#044541]"
        />
      </div>

      {/* 20 Categories Pills / Horizontal Scroll Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#044541] text-white shadow'
                : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ Accordion List */}
      {filteredFaqs.length === 0 ? (
        <div className="text-center py-16 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-[#111816] p-8">
          <AlertCircle className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            No FAQ entries found for your query. Try searching with different keywords.
          </p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-3">
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            const q = language === 'bn' && faq.question_bn ? faq.question_bn : faq.question;
            const a = language === 'bn' && faq.answer_bn ? faq.answer_bn : faq.answer;
            const userVote = votedMap[faq.id];

            return (
              <div
                key={faq.id}
                className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition-colors"
                >
                  <div className="space-y-1 pr-2">
                    <span className="text-[11px] font-semibold text-[#044541] dark:text-emerald-400 block">
                      {faq.category}
                    </span>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white leading-snug">
                      {q}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-400 shrink-0 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-[#044541] dark:text-emerald-400' : ''
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-neutral-100 dark:border-neutral-800/80 space-y-4">
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                      {a}
                    </p>

                    {/* Helpful / Not Helpful Feedback */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/60 text-xs text-neutral-500">
                      <div className="flex items-center gap-2">
                        <span>{t('wasHelpful')}</span>
                        <button
                          onClick={() => handleVote(faq.id, true)}
                          disabled={!!userVote}
                          className={`px-2.5 py-1 rounded border flex items-center gap-1 transition-colors cursor-pointer ${
                            userVote === 'yes'
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 border-emerald-400 font-bold'
                              : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{t('yes')} ({faq.helpfulCount || 0})</span>
                        </button>

                        <button
                          onClick={() => handleVote(faq.id, false)}
                          disabled={!!userVote}
                          className={`px-2.5 py-1 rounded border flex items-center gap-1 transition-colors cursor-pointer ${
                            userVote === 'no'
                              ? 'bg-red-50 dark:bg-red-950 text-red-700 border-red-400 font-bold'
                              : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900'
                          }`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                          <span>{t('no')} ({faq.unhelpfulCount || 0})</span>
                        </button>
                      </div>

                      <span className="text-[11px] text-neutral-400 font-mono">
                        Item ID: {faq.id}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
