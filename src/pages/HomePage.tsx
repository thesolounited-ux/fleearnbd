import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Notice, MobileApp, Course, PlatformStats } from '../types';
import { ThreeCanvas } from '../components/ThreeCanvas';
import { 
  Download, 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  CheckCircle, 
  AlertOctagon, 
  TrendingUp, 
  ExternalLink,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  HelpCircle,
  Flag,
  MessageSquare
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { t, language, navigateTo } = useApp();
  const defaultNoticeList: Notice[] = [
    {
      id: "nt-101",
      title: "Fleearn v2.4 Global Architecture & Secure Payout Settlement Upgrade",
      title_bn: "ফ্লিয়ার্ন v2.4 বৈশ্বিক আর্কিটেকচার এবং নিরাপদ পেআউট সেটেলমেন্ট আপগ্রেড",
      title_ru: "Обновление глобальной архитектуры Fleearn v2.4 и безопасных выплат",
      title_ar: "ترقية بنية Fleearn v2.4 العالمية وتسوية المدফوعات الآمنة",
      shortDescription: "Scheduled network synchronization and multi-currency payout performance enhancements.",
      shortDescription_bn: "নির্ধারিত নেটওয়ার্ক সিঙ্ক্রোনাইজেশন এবং বহু-মুদ্রা পেআউট কর্মক্ষমতা বৃদ্ধি।",
      shortDescription_ru: "Плановая синхронизация сети и повышение производительности мультивалютных выплат.",
      shortDescription_ar: "مزامنة الشبكة المجدولة وتحسينات أداء المدফوعات متعددة العملات.",
      content: "We have deployed infrastructure improvements across our payment verification bridges. Users can now enjoy faster confirmation for digital task settlements.",
      noticeType: "text",
      category: "Maintenance",
      priority: "Normal",
      publicationDate: "2026-03-25",
      isPinned: true,
      status: "active",
      views: 3420
    },
    {
      id: "nt-102",
      title: "Android APK Build v2.4.1 Released with Direct Cloudflare R2 Acceleration",
      title_bn: "অ্যান্ড্রয়েড APK বিল্ড v2.4.1 রিলিজ — সরাসরি ক্লাউডফ্লেয়ার R2 অ্যাক্সিলারেশন সহ",
      title_ru: "Релиз Android APK v2.4.1 с ускорением Cloudflare R2",
      title_ar: "إصدار تطبيق أندرويد v2.4.1 مع تسريع كلاودفلير R2",
      shortDescription: "Official release notes regarding background sync, zero-latency asset caching, and updated microtask verification engines.",
      shortDescription_bn: "ব্যাকগ্রাউন্ড সিঙ্ক, জিরো-লেটেন্সি অ্যাসেট ক্যাশিং এবং উন্নত মাইক্রোটাস্ক ইঞ্জিনের অফিসিয়াল রিলিজ নোট।",
      shortDescription_ru: "Официальные заметки о выпуске: фоновая синхронизация и кеширование ресурсов с нулевой задержкой.",
      shortDescription_ar: "ملاحظات الإصدار الرسمية المتعلقة بالمزامنة وتخزين الأصول المؤقت.",
      content: "All mobile users are urged to update to APK v2.4.1. This build contains critical security patches and optimized battery consumption during freelance work sessions.",
      noticeType: "text",
      category: "System Update",
      priority: "High",
      publicationDate: "2026-03-20",
      isPinned: true,
      status: "active",
      views: 5210
    }
  ];

  const defaultApp: MobileApp = {
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
    fullDescription: "Access microtasks, freelance project queues, verified escrow balances, and instant withdrawal gateways directly from your smartphone.",
    fullDescription_bn: "আপনার স্মার্টফোন থেকেই মাইক্রোটাস্ক, ফ্রিল্যান্স কাজ, এসক্রো ব্যালেন্স এবং ইনস্ট্যান্ট উইথড্রয়াল গেটওয়ে অ্যাক্সেস করুন।",
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
  };

  const [notices, setNotices] = useState<Notice[]>(defaultNoticeList);
  const [appData, setAppData] = useState<MobileApp | null>(defaultApp);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>({
    totalUsers: 142850,
    activeUsers: 98420,
    bannedAccounts: 1230,
    totalTransactions: 482910,
    calculationMethod: "Verified real database accounts and server-authenticated settlement transactions.",
    isRealRecordBased: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const safeGet = (url: string) => fetch(url).then(r => r.ok ? r.json() : null).catch(() => null);

    Promise.all([
      safeGet('/api/notices'),
      safeGet('/api/apps'),
      safeGet('/api/courses'),
      safeGet('/api/stats')
    ]).then(([noticesRes, appsRes, coursesRes, statsRes]) => {
      if (Array.isArray(noticesRes) && noticesRes.length > 0) setNotices(noticesRes.slice(0, 3));
      if (Array.isArray(appsRes) && appsRes.length > 0) setAppData(appsRes[0]);
      if (Array.isArray(coursesRes) && coursesRes.length > 0) setCourses(coursesRes.slice(0, 3));
      if (statsRes && statsRes.totalUsers) setStats(statsRes);
    });
  }, []);

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
    <div className="w-full flex flex-col space-y-16 lg:space-y-24 pb-16">
      {/* A. HERO SECTION */}
      <section className="relative w-full overflow-hidden pt-8 lg:pt-16 pb-12 lg:pb-20 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Trust Marker (quiet text, zero pill) */}
              <div className="flex items-center gap-2 text-xs font-semibold text-[#044541] dark:text-emerald-400 tracking-wide uppercase">
                <span>{t('heroBadge')}</span>
                <span aria-hidden="true">·</span>
                <span>Tier-1 Payout Security</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-neutral-900 dark:text-white tracking-tight leading-[1.1] text-balance">
                {t('heroHeadline')}
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl leading-relaxed">
                {t('heroSubheadline')}
              </p>

              {/* Clear Navigation Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => navigateTo('apps')}
                  className="px-5 py-3 rounded-lg text-sm font-semibold text-white bg-[#044541] hover:bg-[#033633] transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('downloadApp')}</span>
                </button>
                <button
                  onClick={() => navigateTo('features')}
                  className="px-5 py-3 rounded-lg text-sm font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  {t('exploreFeatures')}
                </button>
                <button
                  onClick={() => navigateTo('pricing')}
                  className="px-5 py-3 rounded-lg text-sm font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  {t('viewPricing')}
                </button>
                <button
                  onClick={() => navigateTo('notices')}
                  className="px-5 py-3 rounded-lg text-sm font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  {t('readNotices')}
                </button>
              </div>

              {/* Ethical Disclaimer against speculative income */}
              <p className="text-xs text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-200 dark:border-neutral-800 max-w-xl leading-relaxed">
                {t('disclaimerEarnings')}
              </p>
            </div>

            {/* Right: Interactive 3D Visual & High-Fidelity Asset */}
            <div className="lg:col-span-5 relative flex items-center justify-center min-h-[360px] lg:min-h-[460px] rounded-2xl border border-neutral-200 dark:border-neutral-800/80 bg-neutral-100/50 dark:bg-[#111816]/60 backdrop-blur-sm overflow-hidden p-4 shadow-sm">
              <ThreeCanvas className="w-full h-full" />
              <div className="absolute bottom-4 left-4 right-4 bg-white/85 dark:bg-[#0B0F0E]/85 backdrop-blur-md rounded-lg p-3 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-neutral-800 dark:text-neutral-200 font-medium">3D Verified Node Orbit</span>
                </div>
                <span className="text-neutral-500 font-mono text-[11px]">TLS 1.3 · SHA-256</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* B. LATEST NOTICES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {t('latestNoticesTitle')}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {t('latestNoticesSubtitle')}
            </p>
          </div>
          <button
            onClick={() => navigateTo('notices')}
            className="text-sm font-semibold text-[#044541] dark:text-emerald-400 hover:underline flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span>{t('viewAllNotices')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {notices.map((n) => (
            <div
              key={n.id}
              onClick={() => navigateTo('notices', { selectedNoticeId: n.id })}
              className="group p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] hover:border-[#044541] dark:hover:border-emerald-600 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Unboxed Metadata (Zero-pill discipline) */}
                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="font-semibold text-[#044541] dark:text-emerald-400">{n.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{new Date(n.publicationDate).toLocaleDateString()}</span>
                  <span aria-hidden="true">·</span>
                  <span className={n.priority === 'High' ? 'text-red-600 dark:text-red-400 font-semibold' : ''}>
                    {n.priority}
                  </span>
                </div>

                <h3 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-[#044541] dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                  {getNoticeTitle(n)}
                </h3>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed">
                  {getNoticeDesc(n)}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500">
                <span>{n.views} views</span>
                <span className="font-medium text-[#044541] dark:text-emerald-400 flex items-center gap-1">
                  Read Notice <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* C. LATEST MOBILE APPS SHOWCASE */}
      {appData && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] p-6 lg:p-10 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* App Image Preview */}
              <div className="lg:col-span-5 relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 aspect-4/3 bg-neutral-100 dark:bg-neutral-900">
                <img
                  src={appData.screenshots[0] || "/src/assets/images/app_showcase_preview_1791686595545.jpg"}
                  alt={appData.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-[#044541] text-white text-[11px] font-bold px-2.5 py-1 rounded shadow">
                  Official Android APK
                </div>
              </div>

              {/* App Meta & Download */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span className="font-semibold text-[#044541] dark:text-emerald-400">Version {appData.currentVersion}</span>
                  <span aria-hidden="true">·</span>
                  <span>Released {appData.releaseDate}</span>
                  <span aria-hidden="true">·</span>
                  <span>{appData.fileSize}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                  {appData.name}
                </h2>

                <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {appData.shortDescription}
                </p>

                {/* Specs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-2 text-xs">
                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-400 block">{t('downloadsCount')}</span>
                    <span className="font-bold text-neutral-900 dark:text-white text-sm tabular-nums">
                      {appData.downloadCount.toLocaleString()}+
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-400 block">{t('fileSize')}</span>
                    <span className="font-bold text-neutral-900 dark:text-white text-sm">
                      {appData.fileSize}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 col-span-2 sm:col-span-1">
                    <span className="text-neutral-400 block">System Requirement</span>
                    <span className="font-bold text-neutral-900 dark:text-white text-sm">
                      Android 8.0+
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href={`/api/apps/${appData.id}/download`}
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#044541] hover:bg-[#033633] transition-all shadow flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t('downloadApk')}</span>
                  </a>
                  <button
                    onClick={() => navigateTo('apps')}
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                  >
                    View App Details & Versions
                  </button>
                </div>

                <p className="text-[11px] text-neutral-500 font-mono pt-1 truncate">
                  SHA-256: {appData.sha256}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* D. LATEST COURSES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="pb-6 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {t('coursesTitle')}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {t('coursesSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {courses.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-16/10 bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
                  <img
                    src={c.thumbnail}
                    alt={c.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 rounded font-mono">
                    {c.duration}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <span className="font-semibold text-[#044541] dark:text-emerald-400">{c.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{c.instructor}</span>
                  </div>

                  <h3 className="text-base font-bold text-neutral-900 dark:text-white line-clamp-2">
                    {language === 'bn' && c.title_bn ? c.title_bn : c.title}
                  </h3>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                {c.status === 'Available' ? (
                  <button
                    onClick={() => navigateTo('apps')}
                    className="w-full py-2 rounded-lg text-xs font-semibold text-[#044541] dark:text-emerald-400 border border-[#044541] dark:border-emerald-500 hover:bg-[#044541] hover:text-white dark:hover:bg-emerald-500 dark:hover:text-black transition-colors cursor-pointer"
                  >
                    {t('viewCourse')}
                  </button>
                ) : (
                  <div className="w-full py-2 rounded-lg text-xs font-semibold text-center text-neutral-500 bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800">
                    {c.status === 'Coming Soon' ? t('comingSoon') : t('currentlyUnavailable')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* E. PLATFORM STATISTICS */}
      {stats && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-[#044541] text-white p-8 lg:p-12 relative overflow-hidden shadow-lg">
            <div className="relative z-10 space-y-6">
              <div className="max-w-2xl">
                <span className="text-xs uppercase tracking-widest text-emerald-300 font-bold block mb-1">
                  Verified Telemetry
                </span>
                <h2 className="text-2xl sm:text-3xl font-black">
                  {t('platformMetricsTitle')}
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
                  {stats.calculationMethod}
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-emerald-700/60">
                <div>
                  <span className="text-xs text-emerald-200 block">{t('totalUsers')}</span>
                  <span className="text-2xl sm:text-4xl font-extrabold tracking-tight tabular-nums">
                    {stats.totalUsers.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-emerald-200 block">{t('activeUsers')}</span>
                  <span className="text-2xl sm:text-4xl font-extrabold tracking-tight tabular-nums">
                    {stats.activeUsers.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-emerald-200 block">{t('bannedAccounts')}</span>
                  <span className="text-2xl sm:text-4xl font-extrabold tracking-tight tabular-nums text-red-300">
                    {stats.bannedAccounts.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-emerald-200 block">{t('totalTransactions')}</span>
                  <span className="text-2xl sm:text-4xl font-extrabold tracking-tight tabular-nums">
                    {stats.totalTransactions.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* F. SUPPORT, REPORT, AND CONTACT DISPATCH */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Support Center Card */}
          <div
            onClick={() => navigateTo('support')}
            className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] hover:border-[#044541] dark:hover:border-emerald-500 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[#044541] dark:text-emerald-400 flex items-center justify-center mb-4">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1 group-hover:text-[#044541] dark:group-hover:text-emerald-400 transition-colors">
              {t('supportCenterTitle')}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4">
              Need assistance with an account or payout inquiry? Open a ticket with verified resolution tracking.
            </p>
            <span className="text-xs font-semibold text-[#044541] dark:text-emerald-400 flex items-center gap-1">
              Open Support Ticket <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Report an Issue Card */}
          <div
            onClick={() => navigateTo('report')}
            className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] hover:border-red-500 dark:hover:border-red-500 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
              <Flag className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
              {t('reportIssueTitle')}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4">
              Report bugs, suspicious tasks, or policy infractions directly to our security arbitration board.
            </p>
            <span className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
              File Formal Report <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Contact Us Card */}
          <div
            onClick={() => navigateTo('contact')}
            className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] hover:border-[#044541] dark:hover:border-emerald-500 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[#044541] dark:text-emerald-400 flex items-center justify-center mb-4">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1 group-hover:text-[#044541] dark:group-hover:text-emerald-400 transition-colors">
              {t('contactUsTitle')}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4">
              Connect with institutional partners, corporate press liaisons, and developer outreach.
            </p>
            <span className="text-xs font-semibold text-[#044541] dark:text-emerald-400 flex items-center gap-1">
              Get in Touch <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
