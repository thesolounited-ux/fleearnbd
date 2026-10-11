import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LegalDocument } from '../types';
import { Search, Printer, FileText, CheckCircle2, Calendar, Shield, ExternalLink } from 'lucide-react';

export const ImportantDocumentsPage: React.FC = () => {
  const { t, language, pageParams } = useApp();
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/documents')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDocuments(data);
          if (pageParams?.category) {
            const found = data.find(d => d.category.toLowerCase().includes(pageParams.category.toLowerCase()));
            setSelectedDocId(found ? found.id : data[0].id);
          } else {
            setSelectedDocId(data[0].id);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [pageParams]);

  const activeDoc = documents.find(d => d.id === selectedDocId) || documents[0];

  const filteredCategories = documents.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#044541] dark:text-emerald-400">
            Compliance & Legal Architecture
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight mt-1">
            {t('legalDocsTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {t('legalDocsSubtitle')}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>{t('printDocument')}</span>
        </button>
      </div>

      {/* Main Grid: Sidebar Navigator + Document Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Nav */}
        <div className="lg:col-span-4 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchDocuments')}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-[#111816] border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#044541]"
            />
          </div>

          <div className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
            {filteredCategories.map((doc) => {
              const isCurrent = doc.id === activeDoc?.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`w-full text-left p-3 rounded-lg text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-[#044541] dark:text-emerald-400 font-bold border-l-2 border-[#044541] dark:border-emerald-400'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900'
                  }`}
                >
                  <span className="truncate pr-2">
                    {language === 'bn' && doc.title_bn ? doc.title_bn : doc.title}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono shrink-0">
                    {doc.version}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Document Body View */}
        {activeDoc && (
          <div className="lg:col-span-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] p-6 sm:p-10 shadow-sm space-y-6">
            {/* Document Header */}
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6 space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                <span className="font-semibold text-[#044541] dark:text-emerald-400">{activeDoc.category}</span>
                <span aria-hidden="true">·</span>
                <span>{t('version')} {activeDoc.version}</span>
                <span aria-hidden="true">·</span>
                <span>{t('lastUpdated')}: {activeDoc.lastUpdated}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                {language === 'bn' && activeDoc.title_bn ? activeDoc.title_bn : activeDoc.title}
              </h2>
            </div>

            {/* Document Body Text */}
            <div className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-4 whitespace-pre-line font-serif sm:font-sans">
              {activeDoc.body}
            </div>

            {/* Disclaimer & Advisory */}
            <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 space-y-1">
              <p>
                <strong>Legal Advisory:</strong> This regulatory charter represents active operational guidelines established by Fleearn management. Jurisdiction-specific arbitration clauses apply.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
