import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Image, ArrowLeft } from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const { t, navigateTo } = useApp();
  const [gallerySettings, setGallerySettings] = useState<{ enabled: boolean; message: string }>({
    enabled: false,
    message: "This service is currently unavailable."
  });

  useEffect(() => {
    fetch('/api/gallery')
      .then(r => r.json())
      .then(data => {
        if (data && typeof data.enabled === 'boolean') {
          setGallerySettings(data);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 lg:py-32 flex flex-col items-center justify-center text-center space-y-6 text-[#F3F7F5]">
      {/* Refined subtle illustration container */}
      <div className="relative w-28 h-28 rounded-3xl bg-[#111714] border border-[#34433B] flex items-center justify-center shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-[#044541] border border-[#18D6A0]/40 text-[#18D6A0] flex items-center justify-center">
          <Image className="w-8 h-8" />
        </div>
      </div>

      <div className="space-y-3 max-w-md">
        <h1 className="text-2xl sm:text-3xl font-black text-[#F3F7F5] tracking-tight">
          {gallerySettings.message || t('serviceUnavailableMsg')}
        </h1>
        <p className="text-xs sm:text-sm text-[#A7B5AE] leading-relaxed">
          The verified Fleearn media gallery and credential archive is scheduled for release following regional audit completion.
        </p>
      </div>

      <div className="pt-2">
        <button
          onClick={() => navigateTo('home')}
          className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#F3F7F5] bg-[#044541] hover:bg-[#065b56] border border-[#18D6A0]/40 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#18D6A0]" />
          <span>{t('backToHome')}</span>
        </button>
      </div>
    </div>
  );
};
