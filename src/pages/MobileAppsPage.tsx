import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MobileApp } from '../types';
import { 
  Download, 
  ShieldCheck, 
  Smartphone, 
  History, 
  Check, 
  ExternalLink, 
  FileText, 
  Info,
  Layers,
  Sparkles
} from 'lucide-react';

export const MobileAppsPage: React.FC = () => {
  const { t, language } = useApp();
  const [apps, setApps] = useState<MobileApp[]>([]);
  const [activeTab, setActiveTab] = useState<'latest' | 'versions'>('latest');
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [isAndroid, setIsAndroid] = useState<boolean>(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetch('/api/apps')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setApps(data);
      })
      .catch(console.error);

    // Detect user agent
    const ua = navigator.userAgent.toLowerCase();
    setIsAndroid(ua.includes('android'));
  }, []);

  const primaryApp = apps[0];

  const handleDownload = (appId: string) => {
    setDownloading(true);
    // Trigger download route
    window.location.href = `/api/apps/${appId}/download`;
    setTimeout(() => {
      setDownloading(false);
    }, 2000);
  };

  if (!primaryApp) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-sm text-neutral-500">
        Loading mobile distribution package...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-12">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#044541] dark:text-emerald-400 uppercase tracking-wider mb-2">
          <span>Official Distribution Channel</span>
          <span aria-hidden="true">·</span>
          <span>Google Play Security Parity</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
          {t('mobileAppsTitle')}
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-w-2xl leading-relaxed">
          {t('mobileAppsSubtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg self-start max-w-xs">
        <button
          onClick={() => setActiveTab('latest')}
          className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all cursor-pointer ${
            activeTab === 'latest'
              ? 'bg-white dark:bg-[#111816] text-[#044541] dark:text-emerald-400 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          {t('latestReleaseTab')}
        </button>
        <button
          onClick={() => setActiveTab('versions')}
          className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all cursor-pointer ${
            activeTab === 'versions'
              ? 'bg-white dark:bg-[#111816] text-[#044541] dark:text-emerald-400 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          {t('versionsHistoryTab')} ({primaryApp.versions?.length || 0})
        </button>
      </div>

      {/* TAB 1: LATEST RELEASE */}
      {activeTab === 'latest' && (
        <div className="space-y-12">
          {/* Main Card */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] p-6 lg:p-10 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* App Summary & Actions */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 mb-2">
                    <span className="font-semibold text-[#044541] dark:text-emerald-400">
                      Version {primaryApp.currentVersion}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Build Date: {primaryApp.releaseDate}</span>
                    <span aria-hidden="true">·</span>
                    <span>{primaryApp.fileSize}</span>
                    {primaryApp.isHot && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-600 font-bold">Featured Build</span>
                      </>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                    {primaryApp.name}
                  </h2>
                  <p className="text-xs text-neutral-400 font-mono mt-1">
                    Package: {primaryApp.packageName}
                  </p>
                </div>

                <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {primaryApp.description}
                </p>

                {/* Specs Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-400 block">{t('downloadsCount')}</span>
                    <span className="font-bold text-neutral-900 dark:text-white text-sm tabular-nums">
                      {primaryApp.downloadCount.toLocaleString()}+
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-400 block">{t('fileSize')}</span>
                    <span className="font-bold text-neutral-900 dark:text-white text-sm">
                      {primaryApp.fileSize}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 col-span-2 sm:col-span-1">
                    <span className="text-neutral-400 block">{t('supportedDevices')}</span>
                    <span className="font-bold text-neutral-900 dark:text-white text-sm truncate block">
                      {primaryApp.supportedPlatforms.join(', ')}
                    </span>
                  </div>
                </div>

                {/* Download CTA & Device Compatibility Warning */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => handleDownload(primaryApp.id)}
                      disabled={downloading}
                      className="px-6 py-3 rounded-lg text-sm font-bold text-white bg-[#044541] hover:bg-[#033633] transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      <Download className="w-5 h-5" />
                      <span>{downloading ? 'Preparing Download...' : t('downloadApk')}</span>
                    </button>
                    <span className="text-xs text-neutral-500 font-mono">
                      MD5 / SHA-256 Verified
                    </span>
                  </div>

                  {!isAndroid && (
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        Note: You are visiting from a non-Android device. You may download this APK file to transfer to an Android smartphone or emulator.
                      </span>
                    </div>
                  )}
                </div>

                {/* SHA256 Box */}
                <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-1">
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                    Cryptographic Integrity Checksum (SHA-256)
                  </span>
                  <p className="font-mono text-xs text-neutral-800 dark:text-neutral-300 break-all select-all">
                    {primaryApp.sha256}
                  </p>
                </div>
              </div>

              {/* Four Screenshot Slots */}
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
                  Interface Screenshots (4 Slots)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {primaryApp.screenshots.slice(0, 4).map((shot, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedScreenshot(shot)}
                      className="group relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 aspect-3/4 bg-neutral-100 dark:bg-neutral-900 cursor-pointer shadow-sm hover:shadow transition-all"
                    >
                      <img
                        src={shot}
                        alt={`Screenshot ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-semibold px-2 py-1 bg-black/60 rounded backdrop-blur-sm transition-opacity">
                          Expand
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Android Step-by-Step Installation Instruction Card */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#044541] dark:text-emerald-400" />
              <span>{t('installAndroidTitle')}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-neutral-600 dark:text-neutral-300">
              <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-2">
                <span className="font-bold text-[#044541] dark:text-emerald-400 block text-sm">Step 01</span>
                <p>{t('installAndroidStep1')}</p>
              </div>
              <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-2">
                <span className="font-bold text-[#044541] dark:text-emerald-400 block text-sm">Step 02</span>
                <p>{t('installAndroidStep2')}</p>
              </div>
              <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-2">
                <span className="font-bold text-[#044541] dark:text-emerald-400 block text-sm">Step 03</span>
                <p>{t('installAndroidStep3')}</p>
              </div>
              <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-2">
                <span className="font-bold text-[#044541] dark:text-emerald-400 block text-sm">Step 04</span>
                <p>{t('installAndroidStep4')}</p>
              </div>
            </div>
          </div>

          {/* Changelog & Release Notes */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              {t('changelogTitle')}
            </h3>
            <div className="space-y-3">
              {primaryApp.changelog.map((entry, index) => (
                <div key={index} className="flex items-start gap-3 text-xs text-neutral-600 dark:text-neutral-300">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{entry}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VERSION HISTORY */}
      {activeTab === 'versions' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] divide-y divide-neutral-200 dark:divide-neutral-800">
            {primaryApp.versions.map((ver, idx) => (
              <div key={idx} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <span className="font-bold text-neutral-900 dark:text-white text-sm">v{ver.version}</span>
                    {ver.isLatest && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                        Current Release
                      </span>
                    )}
                    <span aria-hidden="true">·</span>
                    <span>Released: {ver.releaseDate}</span>
                    <span aria-hidden="true">·</span>
                    <span>{ver.fileSize}</span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {ver.notes}
                  </p>
                  <p className="text-[11px] font-mono text-neutral-400 break-all">
                    SHA-256: {ver.sha256}
                  </p>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => handleDownload(primaryApp.id)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-[#044541] dark:text-emerald-400 border border-[#044541] dark:border-emerald-500 hover:bg-[#044541] hover:text-white dark:hover:bg-emerald-500 dark:hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download v{ver.version}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Screenshot Lightbox */}
      {selectedScreenshot && (
        <div
          onClick={() => setSelectedScreenshot(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-pointer animate-in fade-in"
        >
          <div className="relative max-w-lg max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={selectedScreenshot}
              alt="Screenshot Preview"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
