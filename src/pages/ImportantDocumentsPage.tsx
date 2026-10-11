import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LegalDocument } from '../types';
import { Search, Printer } from 'lucide-react';

export const ImportantDocumentsPage: React.FC = () => {
  const { t, language, pageParams } = useApp();
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [, setLoading] = useState(true);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-10 text-[#F3F7F5]">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#34433B] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#18D6A0]">
            Compliance & Legal Architecture
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#F3F7F5] tracking-tight mt-1">
            {t('legalDocsTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B5AE] mt-1">
            {t('legalDocsSubtitle')}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="min-h-[44px] px-4 py-2 text-xs font-semibold rounded-xl border border-[#34433B] bg-[#1A211E] text-[#F3F7F5] hover:bg-[#232D29] transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-[#18D6A0]" />
          <span>{t('printDocument')}</span>
        </button>
      </div>

      {/* Main Grid: Sidebar Navigator + Document Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Nav */}
        <div className="lg:col-span-4 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-[#84958C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchDocuments')}
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#1A211E] border border-[#34433B] rounded-xl text-[#F3F7F5] placeholder:text-[#84958C] focus:border-[#18D6A0] focus:ring-1 focus:ring-[#18D6A0] outline-none min-h-[44px] transition-colors"
            />
          </div>

          <div className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
            {filteredCategories.map((doc) => {
              const isCurrent = doc.id === activeDoc?.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`w-full text-left p-3 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer min-h-[44px] ${
                    isCurrent
                      ? 'bg-[#044541] text-[#F3F7F5] font-bold border border-[#18D6A0]/50 shadow-md'
                      : 'text-[#A7B5AE] bg-[#1A211E]/40 border border-[#34433B]/40 hover:bg-[#1A211E] hover:text-[#F3F7F5]'
                  }`}
                >
                  <span className="truncate pr-2">
                    {language === 'bn' && doc.title_bn ? doc.title_bn : doc.title}
                  </span>
                  <span className="text-[10px] text-[#84958C] font-mono shrink-0">
                    {doc.version}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Document Body View */}
        {activeDoc && (
          <div className="lg:col-span-8 rounded-2xl border border-[#34433B] bg-[#111714] p-6 sm:p-10 shadow-sm space-y-6">
            {/* Document Header */}
            <div className="border-b border-[#34433B] pb-6 space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#84958C]">
                <span className="font-semibold text-[#18D6A0]">{activeDoc.category}</span>
                <span aria-hidden="true">·</span>
                <span>{t('version')} {activeDoc.version}</span>
                <span aria-hidden="true">·</span>
                <span>{t('lastUpdated')}: {activeDoc.lastUpdated}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-[#F3F7F5]">
                {language === 'bn' && activeDoc.title_bn ? activeDoc.title_bn : activeDoc.title}
              </h2>
            </div>

            {/* Document Body Text */}
            <div className="text-sm text-[#A7B5AE] leading-relaxed space-y-4 whitespace-pre-line font-serif sm:font-sans">
              {activeDoc.body}
            </div>

            {/* Disclaimer & Advisory */}
            <div className="pt-6 border-t border-[#34433B] text-xs text-[#84958C] space-y-1">
              <p>
                <strong className="text-[#F3F7F5]">Legal Advisory:</strong> This regulatory charter represents active operational guidelines established by Fleearn management. Jurisdiction-specific arbitration clauses apply.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
