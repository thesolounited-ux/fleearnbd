import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Notice } from '../types';
import { Search, Clock, Eye, AlertCircle, FileText, Image as ImageIcon, Download, ExternalLink, X } from 'lucide-react';

export const NoticesPage: React.FC = () => {
  const { t, language, pageParams } = useApp();
  const [activeTab, setActiveTab] = useState<'active' | 'previous'>('active');
  const [activeNotices, setActiveNotices] = useState<Notice[]>([]);
  const [previousNotices, setPreviousNotices] = useState<Notice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/notices').then(r => r.json()),
      fetch('/api/notices/previous').then(r => r.json())
    ]).then(([active, prev]) => {
      if (Array.isArray(active)) setActiveNotices(active);
      if (Array.isArray(prev)) setPreviousNotices(prev);
      setLoading(false);

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
      n.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || n.category === categoryFilter;
    const matchesType = typeFilter === 'All' || (n.noticeType || 'text') === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
          {t('latestNoticesTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-w-2xl leading-relaxed">
          {t('latestNoticesSubtitle')}
        </p>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg self-start">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-white dark:bg-[#111816] text-[#044541] dark:text-emerald-400 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {t('activeNoticesTab')} ({activeNotices.length})
          </button>
          <button
            onClick={() => setActiveTab('previous')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'previous'
                ? 'bg-white dark:bg-[#111816] text-[#044541] dark:text-emerald-400 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {t('expiredNoticesTab')} ({previousNotices.length})
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 sm:w-60 min-w-[180px]">
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
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-2 text-xs bg-white dark:bg-[#111816] border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#044541]"
          >
            <option value="All">All Formats</option>
            <option value="text">Text Notice</option>
            <option value="pdf">PDF Notice</option>
            <option value="image">Image Notice</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-2 text-xs bg-white dark:bg-[#111816] border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#044541]"
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
          <p className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {t('noNoticesFound')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotices.map((n) => {
            const isPdf = n.noticeType === 'pdf';
            const isImage = n.noticeType === 'image';

            return (
              <div
                key={n.id}
                onClick={() => setSelectedNotice(n)}
                className="group p-5 sm:p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] hover:border-[#044541] dark:hover:border-emerald-600 transition-all cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    {/* Clean unboxed metadata (zero-pill discipline) */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                      <span className="font-semibold text-[#044541] dark:text-emerald-400">{n.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize font-mono text-[11px] text-neutral-400">
                        {isPdf ? 'PDF Notice' : isImage ? 'Image Notice' : 'Text Notice'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{t('publishedOn')}: {new Date(n.publicationDate).toLocaleDateString()}</span>
                      <span aria-hidden="true">·</span>
                      <span className={n.priority === 'High' ? 'text-red-600 font-semibold' : ''}>
                        {n.priority}
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white group-hover:text-[#044541] dark:group-hover:text-emerald-400 transition-colors leading-snug">
                      {getNoticeTitle(n)}
                    </h2>

                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-4xl line-clamp-2">
                      {getNoticeDesc(n)}
                    </p>

                    {/* Notice Attachment Preview Badge */}
                    {isPdf && (
                      <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span>Attached Document: {n.fileName || 'Notice_Document.pdf'}</span>
                      </div>
                    )}
                    {isImage && n.fileUrl && (
                      <div className="pt-2">
                        <img
                          src={n.fileUrl}
                          alt={n.title}
                          className="h-20 w-auto rounded border border-neutral-200 dark:border-neutral-800 object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-neutral-400 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span className="tabular-nums">{n.views || 0}</span>
                    </span>
                    <span className="font-semibold text-[#044541] dark:text-emerald-400 group-hover:underline">
                      View Details →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-3xl bg-white dark:bg-[#111816] rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                  <span className="font-semibold text-[#044541] dark:text-emerald-400">{selectedNotice.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{selectedNotice.noticeType || 'text'} Notice</span>
                  <span aria-hidden="true">·</span>
                  <span>{new Date(selectedNotice.publicationDate).toLocaleDateString()}</span>
                  <span aria-hidden="true">·</span>
                  <span className={selectedNotice.priority === 'High' ? 'text-red-600 font-semibold' : ''}>
                    {selectedNotice.priority}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
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
              {getNoticeDesc(selectedNotice) && (
                <p className="font-medium text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-900/60 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  {getNoticeDesc(selectedNotice)}
                </p>
              )}

              {/* Notice Content */}
              {selectedNotice.content && (
                <div className="whitespace-pre-line leading-relaxed">
                  {selectedNotice.content}
                </div>
              )}

              {/* If Image Notice: show high-res image */}
              {selectedNotice.noticeType === 'image' && selectedNotice.fileUrl && (
                <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 my-4 bg-neutral-50 dark:bg-neutral-900">
                  <img
                    src={selectedNotice.fileUrl}
                    alt={selectedNotice.title}
                    className="w-full max-h-[460px] object-contain mx-auto"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* If PDF Notice: show PDF action */}
              {selectedNotice.noticeType === 'pdf' && (
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-red-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                        {selectedNotice.fileName || 'Notice_Document.pdf'}
                      </h4>
                      <span className="text-xs text-neutral-400">
                        {selectedNotice.fileSize || 'PDF Document'} · Cloudflare R2 Storage
                      </span>
                    </div>
                  </div>

                  <a
                    href={selectedNotice.fileUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="px-4 py-2 rounded-lg bg-[#044541] hover:bg-[#033633] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download / Open PDF</span>
                  </a>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-500">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Expiration: {new Date(selectedNotice.expirationDate).toLocaleString()}</span>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold hover:bg-neutral-200 cursor-pointer self-end sm:self-auto"
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
