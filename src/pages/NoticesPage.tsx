import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Notice } from '../types';
import { Search, Calendar, Filter, X, ArrowLeft, Clock, Eye, AlertCircle } from 'lucide-react';

export const NoticesPage: React.FC = () => {
  const { t, language, pageParams } = useApp();
  const [activeTab, setActiveTab] = useState<'active' | 'previous'>('active');
  const [activeNotices, setActiveNotices] = useState<Notice[]>([]);
  const [previousNotices, setPreviousNotices] = useState<Notice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/notices').then(r => r.json()),
      fetch('/api/notices/previous').then(r => r.json())
    ]).then(([active, prev]) => {
      if (Array.isArray(active)) setActiveNotices(active);
      if (Array.isArray(prev)) setPreviousNotices(prev);
      setLoading(false);

      // Check if a specific notice was requested in pageParams
      if (pageParams?.selectedNoticeId) {
        const found = [...(Array.isArray(active) ? active : []), ...(Array.isArray(prev) ? prev : [])]
          .find(n => n.id === pageParams.selectedNoticeId);
        if (found) setSelectedNotice(found);
      }
    }).catch(err => {
      console.error('Error fetching notices:', err);
      setLoading(false);
    });
  }, [pageParams]);

  const currentList = activeTab === 'active' ? activeNotices : previousNotices;

  const categories = ['All', ...Array.from(new Set(currentList.map(n => n.category)))];

  const filteredNotices = currentList.filter(n => {
    const title = language === 'bn' && n.title_bn ? n.title_bn : n.title;
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || n.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getNoticeTitle = (n: Notice) => {
    if (language === 'bn' && n.title_bn) return n.title_bn;
    if (language === 'ru' && n.title_ru) return n.title_ru;
    if (language === 'ar' && n.title_ar) return n.title_ar;
    return n.title;
  };

  const getNoticeDesc = (n: Notice) => {
    if (language === 'bn' && n.shortDescription_bn) return n.shortDescription_bn;
    if (language === 'ru' && n.shortDescription_ru) return n.shortDescription_ru;
    if (language === 'ar' && n.shortDescription_ar) return n.shortDescription_ar;
    return n.shortDescription;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
          {t('latestNoticesTitle')}
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-w-2xl">
          {t('latestNoticesSubtitle')}
        </p>
      </div>

      {/* Tabs (Functional segmented controls) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-2 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg self-start">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-white dark:bg-[#111816] text-[#044541] dark:text-emerald-400 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {t('activeNoticesTab')} ({activeNotices.length})
          </button>
          <button
            onClick={() => setActiveTab('previous')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'previous'
                ? 'bg-white dark:bg-[#111816] text-[#044541] dark:text-emerald-400 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {t('expiredNoticesTab')} ({previousNotices.length})
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchNoticesPlaceholder')}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-[#111816] border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#044541]"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-[#111816] border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#044541]"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notices List */}
      {filteredNotices.length === 0 ? (
        <div className="text-center py-16 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-[#111816] p-8">
          <AlertCircle className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {t('noNoticesFound')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotices.map((n) => (
            <div
              key={n.id}
              onClick={() => setSelectedNotice(n)}
              className="group p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] hover:border-[#044541] dark:hover:border-emerald-600 transition-all cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  {/* Clean unboxed metadata (zero-pill discipline) */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                    <span className="font-semibold text-[#044541] dark:text-emerald-400">{n.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{t('publishedOn')}: {new Date(n.publicationDate).toLocaleDateString()}</span>
                    <span aria-hidden="true">·</span>
                    <span>{t('expiresOn')}: {new Date(n.expirationDate).toLocaleDateString()}</span>
                    <span aria-hidden="true">·</span>
                    <span className={n.priority === 'High' ? 'text-red-600 font-semibold' : ''}>
                      {n.priority} Priority
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white group-hover:text-[#044541] dark:group-hover:text-emerald-400 transition-colors">
                    {getNoticeTitle(n)}
                  </h2>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-4xl">
                    {getNoticeDesc(n)}
                  </p>
                </div>

                <div className="text-xs text-neutral-400 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span className="tabular-nums">{n.views}</span>
                  </span>
                  <span className="font-semibold text-[#044541] dark:text-emerald-400 group-hover:underline">
                    View Details →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-3xl bg-white dark:bg-[#111816] rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 max-h-[85vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span className="font-semibold text-[#044541] dark:text-emerald-400">{selectedNotice.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{new Date(selectedNotice.publicationDate).toLocaleDateString()}</span>
                  <span aria-hidden="true">·</span>
                  <span className={selectedNotice.priority === 'High' ? 'text-red-600 font-semibold' : ''}>
                    {selectedNotice.priority}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {getNoticeTitle(selectedNotice)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-4">
              <p className="font-medium text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-900/60 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
                {getNoticeDesc(selectedNotice)}
              </p>
              <div className="whitespace-pre-line leading-relaxed">
                {selectedNotice.content}
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Expiration: {new Date(selectedNotice.expirationDate).toLocaleString()}</span>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold hover:bg-neutral-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
