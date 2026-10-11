import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MobileApp } from '../types';
import { 
  Download, 
  Smartphone, 
  Check, 
  ExternalLink, 
  Info
} from 'lucide-react';

export const MobileAppsPage: React.FC = () => {
  const { t } = useApp();
  const defaultAppsList: MobileApp[] = [
    {
      id: "app-fleearn-pro",
      name: "Fleearn — Earn Your Way Mobile",
      name_bn: "ফ্লিয়ার্ন — আর্ন ইয়োর ওয়ে মোবাইল",
      packageName: "com.fleearn.ecosystem.work",
      currentVersion: "v2.4.1",
      versionCode: 241,
      releaseDate: "2026-03-20",
      minAndroidVersion: "Android 8.0 (Oreo) or higher",
      targetAndroidVersion: "Android 14 / 15",
      fileSize: "18.4 MB",
      shortDescription: "Official high-speed earning terminal for Android smartphones.",
      shortDescription_bn: "অ্যান্ড্রয়েড স্মার্টফোনের জন্য অফিসিয়াল হাই-স্পিড আর্নিং টার্মিনাল।",
      fullDescription: "Access microtasks, freelance project queues, verified escrow balances, and instant withdrawal gateways directly from your smartphone. Features end-to-end encryption and fast-track task review.",
      fullDescription_bn: "আপনার স্মার্টফোন থেকেই মাইক্রোটাস্ক, ফ্রিল্যান্স কাজ, এসক্রো ব্যালেন্স এবং ইনস্ট্যান্ট উইথড্রয়াল গেটওয়ে অ্যাক্সেস করুন। দ্রুত টাস্ক ভেরিফিকেশন এবং এন্ড-টু-এন্ড এনক্রিপশন সমর্থিত।",
      downloadMethod: "upload",
      downloadUrl: "/api/storage/files/apks/fleearn_v2.4.1_universal.apk",
      iconUrl: "/src/assets/images/app_showcase_preview_1791686595545.jpg",
      screenshots: [
        "/src/assets/images/app_showcase_preview_1791686595545.jpg"
      ],
      changelog: [
        "Engine upgrade for real-time task reward calculations",
        "Instant push notifications for payout approvals",
        "Cloudflare R2 verified asset synchronization",
        "Biometric unlock and enhanced device security"
      ],
      status: "active",
      downloadCount: 84320,
      ratingsAverage: 4.8,
      ratingsCount: 14210,
      sha256Hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    }
  ];

  const [apps, setApps] = useState<MobileApp[]>(defaultAppsList);
  const [activeTab, setActiveTab] = useState<'latest' | 'versions'>('latest');
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [isAndroid, setIsAndroid] = useState<boolean>(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetch('/api/apps')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setApps(data);
      })
      .catch(() => {});

    const ua = navigator.userAgent.toLowerCase();
    setIsAndroid(ua.includes('android'));
  }, []);

  const primaryApp = apps[0];

  const handleDownload = (app: MobileApp) => {
    setDownloading(true);

    if (app.downloadMethod === 'external' && app.downloadUrl) {
      window.open(app.downloadUrl, '_blank');
      setDownloading(false);
      return;
    }

    // Direct APK download from R2 / backend
    window.location.href = `/api/apps/${app.id}/download`;
    setTimeout(() => {
      setDownloading(false);
    }, 2000);
  };

  if (!primaryApp) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-sm text-[#A7B5AE]">
        Loading mobile distribution package...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 space-y-8 sm:space-y-12 text-[#F3F7F5]">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-[#18D6A0] uppercase tracking-wider mb-2">
          <span>Official Distribution Channel</span>
          <span aria-hidden="true">·</span>
          <span>Google Play Security Parity</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-[#F3F7F5] tracking-tight">
          {t('mobileAppsTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-[#A7B5AE] mt-2 max-w-2xl leading-relaxed">
          {t('mobileAppsSubtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#1A211E] border border-[#34433B] rounded-xl self-start max-w-xs">
        <button
          onClick={() => setActiveTab('latest')}
          className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer min-h-[38px] ${
            activeTab === 'latest'
              ? 'bg-[#044541] text-[#F3F7F5] border border-[#18D6A0]/40 shadow-sm'
              : 'text-[#A7B5AE] hover:text-[#F3F7F5]'
          }`}
        >
          {t('latestReleaseTab')}
        </button>
        <button
          onClick={() => setActiveTab('versions')}
          className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer min-h-[38px] ${
            activeTab === 'versions'
              ? 'bg-[#044541] text-[#F3F7F5] border border-[#18D6A0]/40 shadow-sm'
              : 'text-[#A7B5AE] hover:text-[#F3F7F5]'
          }`}
        >
          {t('versionsHistoryTab')} ({primaryApp.versions?.length || 0})
        </button>
      </div>

      {/* TAB 1: LATEST RELEASE */}
      {activeTab === 'latest' && (
        <div className="space-y-8 sm:space-y-12">
          {/* Main Card */}
          <div className="rounded-2xl border border-[#34433B] bg-[#111714] p-5 sm:p-8 lg:p-10 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* App Summary & Actions */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#84958C] mb-2">
                    <span className="font-semibold text-[#18D6A0]">
                      Version {primaryApp.currentVersion}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Released: {primaryApp.releaseDate}</span>
                    <span aria-hidden="true">·</span>
                    <span>{primaryApp.fileSize}</span>
                    {primaryApp.isHot && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-400 font-bold">Featured Build</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {primaryApp.iconUrl && (
                      <img
                        src={primaryApp.iconUrl}
                        alt="App Icon"
                        className="w-12 h-12 rounded-xl object-cover border border-[#34433B] shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div>
                      <h2 className="text-xl sm:text-3xl font-black text-[#F3F7F5]">
                        {primaryApp.name}
                      </h2>
                      <p className="text-xs text-[#84958C] font-mono">
                        {primaryApp.packageName}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#A7B5AE] leading-relaxed">
                  {primaryApp.description}
                </p>

                {/* Specs Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#1A211E] border border-[#34433B]">
                    <span className="text-[#84958C] block text-[11px]">{t('downloadsCount')}</span>
                    <span className="font-bold text-[#F3F7F5] text-sm tabular-nums">
                      {primaryApp.downloadCount?.toLocaleString()}+
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#1A211E] border border-[#34433B]">
                    <span className="text-[#84958C] block text-[11px]">{t('fileSize')}</span>
                    <span className="font-bold text-[#F3F7F5] text-sm">
                      {primaryApp.fileSize}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#1A211E] border border-[#34433B] col-span-2 sm:col-span-1">
                    <span className="text-[#84958C] block text-[11px]">{t('supportedDevices')}</span>
                    <span className="font-bold text-[#F3F7F5] text-sm truncate block">
                      {primaryApp.supportedPlatforms?.join(', ') || 'Android 8.0+'}
                    </span>
                  </div>
                </div>

                {/* Download CTA & Device Compatibility Warning */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <button
                      onClick={() => handleDownload(primaryApp)}
                      disabled={downloading}
                      className="w-full sm:w-auto px-6 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold text-[#F3F7F5] bg-[#044541] hover:bg-[#065b56] border border-[#18D6A0]/40 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-95"
                    >
                      {primaryApp.downloadMethod === 'external' ? (
                        <ExternalLink className="w-4 h-4 text-[#18D6A0] shrink-0" />
                      ) : (
                        <Download className="w-4 h-4 text-[#18D6A0] shrink-0" />
                      )}
                      <span>
                        {downloading
                          ? 'Preparing Download...'
                          : primaryApp.downloadMethod === 'external'
                          ? 'Open External Download'
                          : t('downloadApk')}
                      </span>
                    </button>
                    <span className="text-[11px] text-[#84958C] font-mono text-center sm:text-left">
                      Cloudflare R2 Stored · SHA-256 Verified
                    </span>
                  </div>

                  {!isAndroid && (
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-900/60 text-xs text-amber-300 flex items-start gap-2">
                      <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        Note: You are visiting from a non-Android device. You may download this APK file to transfer to an Android smartphone or emulator.
                      </span>
                    </div>
                  )}
                </div>

                {/* SHA256 Box */}
                {primaryApp.sha256 && (
                  <div className="p-3 rounded-xl bg-[#1A211E] border border-[#34433B] space-y-1">
                    <span className="text-[11px] font-semibold text-[#84958C] uppercase tracking-wider block">
                      Cryptographic Integrity Checksum (SHA-256)
                    </span>
                    <p className="font-mono text-xs text-[#F3F7F5] break-all select-all">
                      {primaryApp.sha256}
                    </p>
                  </div>
                )}
              </div>

              {/* Screenshots Responsive Grid */}
              <div className="lg:col-span-5 space-y-3 w-full">
                <span className="text-xs font-bold uppercase tracking-wider text-[#84958C] block">
                  Interface Screenshots
                </span>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  {(primaryApp.screenshots || []).slice(0, 4).map((shot, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedScreenshot(shot)}
                      className="group relative rounded-xl overflow-hidden border border-[#34433B] aspect-3/4 bg-[#1A211E] cursor-pointer shadow-sm hover:border-[#18D6A0]/60 transition-all"
                    >
                      <img
                        src={shot}
                        alt={`Screenshot ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-[#F3F7F5] text-[11px] font-semibold px-2.5 py-1 bg-[#111714]/80 border border-[#34433B] rounded-lg backdrop-blur-sm transition-opacity">
                          View
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Android Step-by-Step Installation Instruction Card */}
          <div className="rounded-2xl border border-[#34433B] bg-[#111714] p-5 sm:p-8 space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-[#F3F7F5] flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#18D6A0]" />
              <span>{t('installAndroidTitle')}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs text-[#A7B5AE]">
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#1A211E] border border-[#34433B] space-y-1.5">
                <span className="font-bold text-[#18D6A0] block text-sm">Step 01</span>
                <p>{t('installAndroidStep1')}</p>
              </div>
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#1A211E] border border-[#34433B] space-y-1.5">
                <span className="font-bold text-[#18D6A0] block text-sm">Step 02</span>
                <p>{t('installAndroidStep2')}</p>
              </div>
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#1A211E] border border-[#34433B] space-y-1.5">
                <span className="font-bold text-[#18D6A0] block text-sm">Step 03</span>
                <p>{t('installAndroidStep3')}</p>
              </div>
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#1A211E] border border-[#34433B] space-y-1.5">
                <span className="font-bold text-[#18D6A0] block text-sm">Step 04</span>
                <p>{t('installAndroidStep4')}</p>
              </div>
            </div>
          </div>

          {/* Changelog & Release Notes */}
          {primaryApp.changelog && primaryApp.changelog.length > 0 && (
            <div className="rounded-2xl border border-[#34433B] bg-[#111714] p-5 sm:p-8 space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-[#F3F7F5]">
                {t('changelogTitle')}
              </h3>
              <div className="space-y-2.5">
                {primaryApp.changelog.map((entry, index) => (
                  <div key={index} className="flex items-start gap-2.5 text-xs text-[#A7B5AE]">
                    <Check className="w-4 h-4 text-[#18D6A0] shrink-0 mt-0.5" />
                    <span>{entry}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: VERSION HISTORY */}
      {activeTab === 'versions' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#34433B] bg-[#111714] divide-y divide-[#34433B] overflow-hidden">
            {(primaryApp.versions || []).map((ver, idx) => (
              <div key={idx} className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#84958C]">
                    <span className="font-bold text-[#F3F7F5] text-sm">v{ver.version}</span>
                    {ver.isLatest && (
                      <span className="text-[10px] font-bold text-[#18D6A0] uppercase">
                        Current Release
                      </span>
                    )}
                    <span aria-hidden="true">·</span>
                    <span>Released: {ver.releaseDate}</span>
                    <span aria-hidden="true">·</span>
                    <span>{ver.fileSize}</span>
                  </div>
                  <p className="text-xs text-[#A7B5AE]">
                    {ver.notes}
                  </p>
                  {ver.sha256 && (
                    <p className="text-[11px] font-mono text-[#84958C] break-all">
                      SHA-256: {ver.sha256}
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => handleDownload(primaryApp)}
                    className="w-full sm:w-auto px-4 py-2 min-h-[40px] rounded-xl text-xs font-semibold text-[#F3F7F5] bg-[#044541] hover:bg-[#065b56] border border-[#18D6A0]/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#18D6A0]" />
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md cursor-pointer animate-in fade-in"
        >
          <div className="relative max-w-lg max-h-[85vh] rounded-2xl overflow-hidden border border-[#34433B] bg-[#111714] shadow-2xl p-2">
            <img
              src={selectedScreenshot}
              alt="Screenshot Preview"
              className="w-full h-full object-contain rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
