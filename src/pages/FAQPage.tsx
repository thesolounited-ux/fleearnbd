import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FAQItem } from '../types';
import { Search, ChevronDown, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';

export const FAQPage: React.FC = () => {
  const { t, language } = useApp();
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [votedMap, setVotedMap] = useState<Record<string, 'yes' | 'no'>>({});
  const [, setLoading] = useState(true);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-12 text-[#F3F7F5]">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-[#18D6A0]">
          Knowledge Base & User Assistance
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#F3F7F5] tracking-tight">
          {t('faqTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-[#A7B5AE] leading-relaxed">
          {t('faqSubtitle')}
        </p>
      </div>

      {/* Search Input */}
      <div className="max-w-2xl mx-auto relative">
        <Search className="w-5 h-5 text-[#84958C] absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('searchFaq')}
          className="w-full pl-12 pr-4 py-3.5 text-xs sm:text-sm bg-[#1A211E] border border-[#34433B] rounded-xl text-[#F3F7F5] placeholder:text-[#84958C] shadow-sm focus:border-[#18D6A0] focus:ring-1 focus:ring-[#18D6A0] outline-none min-h-[44px] transition-colors"
        />
      </div>

      {/* 20 Categories Pills / Horizontal Scroll Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`min-h-[38px] px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#044541] text-[#F3F7F5] border border-[#18D6A0]/50 shadow'
                : 'bg-[#1A211E] border border-[#34433B] text-[#A7B5AE] hover:text-[#F3F7F5] hover:bg-[#232D29]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ Accordion List */}
      {filteredFaqs.length === 0 ? (
        <div className="text-center py-16 border border-[#34433B] rounded-2xl bg-[#111714] p-8">
          <AlertCircle className="w-8 h-8 text-[#84958C] mx-auto mb-3" />
          <p className="text-xs sm:text-sm font-medium text-[#A7B5AE]">
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
                className="rounded-2xl border border-[#34433B] bg-[#111714] overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#1A211E]/40 transition-colors"
                >
                  <div className="space-y-1 pr-2">
                    <span className="text-[11px] font-semibold text-[#18D6A0] block">
                      {faq.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-[#F3F7F5] leading-snug">
                      {q}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-[#84958C] shrink-0 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-[#18D6A0]' : ''
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-[#34433B] space-y-4">
                    <p className="text-xs sm:text-sm text-[#A7B5AE] leading-relaxed">
                      {a}
                    </p>

                    {/* Helpful / Not Helpful Feedback */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#34433B] text-xs text-[#84958C]">
                      <div className="flex items-center gap-2">
                        <span className="text-[#A7B5AE]">{t('wasHelpful')}</span>
                        <button
                          onClick={() => handleVote(faq.id, true)}
                          disabled={!!userVote}
                          className={`min-h-[32px] px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-colors cursor-pointer ${
                            userVote === 'yes'
                              ? 'bg-[#044541] text-[#F3F7F5] border-[#18D6A0] font-bold'
                              : 'border-[#34433B] bg-[#1A211E] text-[#A7B5AE] hover:text-[#F3F7F5] hover:bg-[#232D29]'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5 text-[#18D6A0]" />
                          <span>{t('yes')} ({faq.helpfulCount || 0})</span>
                        </button>

                        <button
                          onClick={() => handleVote(faq.id, false)}
                          disabled={!!userVote}
                          className={`min-h-[32px] px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-colors cursor-pointer ${
                            userVote === 'no'
                              ? 'bg-red-950/60 text-red-300 border-red-800 font-bold'
                              : 'border-[#34433B] bg-[#1A211E] text-[#A7B5AE] hover:text-[#F3F7F5] hover:bg-[#232D29]'
                          }`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5 text-red-400" />
                          <span>{t('no')} ({faq.unhelpfulCount || 0})</span>
                        </button>
                      </div>

                      <span className="text-[11px] text-[#84958C] font-mono">
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
