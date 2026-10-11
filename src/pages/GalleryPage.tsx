import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Image, ArrowLeft, ShieldAlert } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 lg:py-32 flex flex-col items-center justify-center text-center space-y-6">
      {/* Refined subtle illustration container */}
      <div className="relative w-28 h-28 rounded-3xl bg-neutral-100 dark:bg-[#111816] border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-[#044541] dark:text-emerald-400 flex items-center justify-center">
          <Image className="w-8 h-8 opacity-75" />
        </div>
        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 text-xs">
          ·
        </div>
      </div>

      <div className="space-y-3 max-w-md">
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
          {gallerySettings.message || t('serviceUnavailableMsg')}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
          The verified Fleearn media gallery and credential archive is scheduled for release following regional audit completion.
        </p>
      </div>

      <div className="pt-2">
        <button
          onClick={() => navigateTo('home')}
          className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-[#044541] hover:bg-[#033633] transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToHome')}</span>
        </button>
      </div>
    </div>
  );
};
