import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Notice, MobileApp, PricingPlan, Course, LegalDocument, FAQItem, SupportTicket, ReportItem, AuditLog } from '../types';
import { 
  BarChart3, 
  Bell, 
  Smartphone, 
  CreditCard, 
  FileText, 
  HelpCircle, 
  LifeBuoy, 
  Flag, 
  BookOpen, 
  Settings, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  ShieldCheck, 
  Image, 
  RefreshCw,
  Upload,
  Cloud,
  FolderUp,
  X,
  ExternalLink,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { adminToken, logoutAdmin, navigateTo, updateCompany } = useApp();
  const [activeTab, setActiveTab] = useState<string>('metrics');
  const [metrics, setMetrics] = useState<any>(null);
  const [storageStatus, setStorageStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Entities state
  const [notices, setNotices] = useState<Notice[]>([]);
  const [apps, setApps] = useState<MobileApp[]>([]);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [gallerySettings, setGallerySettings] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Action status message
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);

  // Modal / Edit forms state
  const [editingItem, setEditingItem] = useState<{ type: string; data: any } | null>(null);

  const fetchAllData = () => {
    if (!adminToken) return;
    setLoading(true);

    const headers = { Authorization: `Bearer ${adminToken}` };
    const safeFetch = (url: string, opts?: any) =>
      fetch(url, opts)
        .then(r => (r.ok ? r.json() : null))
        .catch(() => null);

    Promise.all([
      safeFetch('/api/admin/metrics', { headers }),
      safeFetch('/api/admin/storage-status', { headers }),
      safeFetch('/api/notices/all', { headers }),
      safeFetch('/api/apps/all', { headers }),
      safeFetch('/api/pricing/all', { headers }),
      safeFetch('/api/documents'),
      safeFetch('/api/faqs'),
      safeFetch('/api/courses'),
      safeFetch('/api/support', { headers }),
      safeFetch('/api/reports', { headers }),
      safeFetch('/api/company'),
      safeFetch('/api/gallery'),
    ]).then(([m, s, n, a, p, d, f, c, t, rep, comp, gal]) => {
      if (m) setMetrics(m);
      if (s) setStorageStatus(s);
      if (Array.isArray(n) && n.length > 0) {
        setNotices(n);
        localStorage.setItem('fleearn_admin_notices', JSON.stringify(n));
      } else {
        const cached = localStorage.getItem('fleearn_admin_notices');
        if (cached) try { setNotices(JSON.parse(cached)); } catch {}
      }

      if (Array.isArray(a) && a.length > 0) {
        setApps(a);
        localStorage.setItem('fleearn_admin_apps', JSON.stringify(a));
      } else {
        const cached = localStorage.getItem('fleearn_admin_apps');
        if (cached) try { setApps(JSON.parse(cached)); } catch {}
      }

      if (Array.isArray(p) && p.length > 0) {
        setPlans(p);
        localStorage.setItem('fleearn_admin_plans', JSON.stringify(p));
      } else {
        const cached = localStorage.getItem('fleearn_admin_plans');
        if (cached) try { setPlans(JSON.parse(cached)); } catch {}
      }

      if (Array.isArray(d)) setDocuments(d);
      if (Array.isArray(f)) setFaqs(f);
      if (Array.isArray(c)) setCourses(c);
      if (Array.isArray(t)) setTickets(t);
      if (Array.isArray(rep)) setReports(rep);
      if (comp) setCompanySettings(comp);
      if (gal) setGallerySettings(gal);
      if (m?.auditLogs) setAuditLogs(m.auditLogs);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (!adminToken) {
      navigateTo('admin-login');
      return;
    }
    fetchAllData();
  }, [adminToken]);

  const showStatus = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3500);
  };

  // Helper to upload a file directly to Cloudflare R2 via Backend API
  const handleFileUpload = async (file: File, folder: string): Promise<{ publicUrl: string; r2Key: string; fileName: string; fileSize: string } | null> => {
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload rejected by server');
      }

      const data = await res.json();
      if (data.success && data.file) {
        showStatus(`File uploaded to Cloudflare R2: ${data.file.originalName}`);
        return {
          publicUrl: data.file.publicUrl,
          r2Key: data.file.r2Key,
          fileName: data.file.originalName,
          fileSize: data.file.sizeFormatted
        };
      }
      throw new Error(data.error || 'Upload error');
    } catch (err: any) {
      alert(`File upload failed: ${err.message || 'Server error'}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Generic Save for any entity edit/creation
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const { type, data } = editingItem;
    const isNew = !data.id;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    };

    try {
      if (type === 'notice') {
        const url = isNew ? '/api/notices' : `/api/notices/${data.id}`;
        const method = isNew ? 'POST' : 'PUT';
        await fetch(url, { method, headers, body: JSON.stringify(data) });
      } else if (type === 'pricing') {
        const url = isNew ? '/api/pricing' : `/api/pricing/${data.id}`;
        const method = isNew ? 'POST' : 'PUT';
        await fetch(url, { method, headers, body: JSON.stringify(data) });
      } else if (type === 'app') {
        const url = isNew ? '/api/apps' : `/api/apps/${data.id}`;
        const method = isNew ? 'POST' : 'PUT';
        await fetch(url, { method, headers, body: JSON.stringify(data) });
      } else if (type === 'document') {
        const url = `/api/documents/${data.id}`;
        await fetch(url, { method: 'PUT', headers, body: JSON.stringify(data) });
      } else if (type === 'faq') {
        const url = isNew ? '/api/faqs' : `/api/faqs/${data.id}`;
        const method = isNew ? 'POST' : 'PUT';
        await fetch(url, { method, headers, body: JSON.stringify(data) });
      } else if (type === 'ticket') {
        await fetch(`/api/support/${data.id}/status`, { method: 'PUT', headers, body: JSON.stringify(data) });
      } else if (type === 'report') {
        await fetch(`/api/reports/${data.id}/status`, { method: 'PUT', headers, body: JSON.stringify(data) });
      } else if (type === 'company') {
        const res = await fetch('/api/company', { method: 'PUT', headers, body: JSON.stringify(data) });
        const resData = await res.json();
        if (resData.company) updateCompany(resData.company);
      } else if (type === 'gallery') {
        await fetch('/api/gallery', { method: 'PUT', headers, body: JSON.stringify(data) });
      } else if (type === 'stats') {
        await fetch('/api/stats', { method: 'PUT', headers, body: JSON.stringify(data) });
      }

      setEditingItem(null);
      showStatus('Record saved successfully.');
      fetchAllData();
    } catch (err) {
      alert('Save operation failed.');
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    const headers = { Authorization: `Bearer ${adminToken}` };
    try {
      if (type === 'notice') await fetch(`/api/notices/${id}`, { method: 'DELETE', headers });
      if (type === 'pricing') await fetch(`/api/pricing/${id}`, { method: 'DELETE', headers });
      if (type === 'app') await fetch(`/api/apps/${id}`, { method: 'DELETE', headers });
      if (type === 'faq') await fetch(`/api/faqs/${id}`, { method: 'DELETE', headers });
      showStatus('Record deleted.');
      fetchAllData();
    } catch (e) {
      alert('Failed to delete item.');
    }
  };

  const navTabs = [
    { id: 'metrics', label: 'Overview & Storage', icon: BarChart3 },
    { id: 'pricing', label: 'Pricing Plans', icon: CreditCard },
    { id: 'apps', label: 'Android Apps & APK', icon: Smartphone },
    { id: 'notices', label: 'Notices Board', icon: Bell },
    { id: 'company', label: 'Company & Official Links', icon: Settings },
    { id: 'documents', label: 'Legal Policies', icon: FileText },
    { id: 'faqs', label: 'FAQ Database', icon: HelpCircle },
    { id: 'courses', label: 'Course Catalog', icon: BookOpen },
    { id: 'tickets', label: 'Support Desk', icon: LifeBuoy },
    { id: 'reports', label: 'Abuse Reports', icon: Flag },
    { id: 'gallery', label: 'Gallery State', icon: Image },
  ];

  // Design Tokens CSS classes
  const inputClass = "w-full bg-[#1A211E] text-[#F3F7F5] border border-[#34433B] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm placeholder:text-[#84958C] focus:border-[#18D6A0] focus:ring-1 focus:ring-[#18D6A0] outline-none min-h-[44px] transition-colors";
  const labelClass = "block text-xs font-semibold text-[#A7B5AE] mb-1.5";
  const selectClass = "w-full bg-[#1A211E] text-[#F3F7F5] border border-[#34433B] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#18D6A0] focus:ring-1 focus:ring-[#18D6A0] outline-none min-h-[44px] transition-colors";
  const textareaClass = "w-full bg-[#1A211E] text-[#F3F7F5] border border-[#34433B] rounded-xl p-3 text-xs sm:text-sm placeholder:text-[#84958C] focus:border-[#18D6A0] focus:ring-1 focus:ring-[#18D6A0] outline-none transition-colors";

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 text-[#F3F7F5]">
      {/* Top Banner - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-[#34433B] bg-[#111714]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#044541] border border-[#18D6A0]/40 text-[#18D6A0] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#F3F7F5] tracking-tight">
              Administrator Master Console
            </h1>
            <span className="text-[11px] text-[#A7B5AE] font-mono">
              UID: 250660 · Role: Super Admin · Secured Terminal
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {statusMsg && (
            <span className="text-xs text-[#18D6A0] font-semibold px-2.5 py-1 bg-[#1A211E] border border-[#18D6A0]/40 rounded-lg">
              {statusMsg}
            </span>
          )}
          <button
            onClick={fetchAllData}
            className="min-h-[40px] px-3 py-2 rounded-xl border border-[#34433B] bg-[#1A211E] hover:bg-[#232D29] text-[#F3F7F5] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#18D6A0]" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={logoutAdmin}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-red-950/60 text-red-300 hover:bg-red-900/60 border border-red-900/60 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Strip - Horizontal Scroll on Mobile */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#34433B] scrollbar-thin">
        {navTabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`min-h-[42px] px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#044541] text-[#F3F7F5] border border-[#18D6A0]/50 shadow-md'
                  : 'text-[#A7B5AE] bg-[#1A211E]/60 hover:bg-[#1A211E] hover:text-[#F3F7F5] border border-[#34433B]/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#18D6A0]' : 'text-[#84958C]'}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW & CLOUDFLARE R2 STORAGE */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          {/* Cloudflare R2 Storage Status Card */}
          <div className="p-5 sm:p-6 rounded-2xl border border-[#34433B] bg-[#111714] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Cloud className={`w-5 h-5 ${storageStatus?.r2Configured ? 'text-[#18D6A0]' : 'text-amber-400'}`} />
                <h3 className="text-sm font-bold text-[#F3F7F5]">
                  Cloudflare R2 Object Storage Integration
                </h3>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 self-start sm:self-auto border ${
                storageStatus?.r2Configured
                  ? 'bg-emerald-950/70 text-[#18D6A0] border-emerald-800/60'
                  : 'bg-amber-950/70 text-amber-300 border-amber-800/60'
              }`}>
                {storageStatus?.r2Configured ? '✓ Cloudflare R2 Active' : '● Persistent Storage Engine Active'}
              </span>
            </div>

            <p className="text-xs text-[#A7B5AE] leading-relaxed">
              {storageStatus?.r2Configured
                ? `Files, APKs, screenshots, and notices are securely stored in your Cloudflare R2 bucket: "${storageStatus.bucketName}".`
                : `Active storage pipeline ready for files, APKs, screenshots, and PDF notices. Configured for high-speed delivery.`}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#1A211E] border border-[#34433B]">
                <span className="text-[#84958C] block text-[10px]">Bucket</span>
                <span className="text-[#F3F7F5] font-bold">{storageStatus?.bucketName || 'fleearn-storage'}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#1A211E] border border-[#34433B]">
                <span className="text-[#84958C] block text-[10px]">Total Uploaded Files</span>
                <span className="text-[#F3F7F5] font-bold">{metrics?.totalUploadedFiles || 0}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#1A211E] border border-[#34433B]">
                <span className="text-[#84958C] block text-[10px]">Active Provider</span>
                <span className="text-[#F3F7F5] font-bold">{storageStatus?.provider || 'Cloudflare R2 Ready'}</span>
              </div>
            </div>
          </div>

          {/* Metrics summary */}
          {metrics && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 sm:p-5 rounded-2xl border border-[#34433B] bg-[#111714]">
                <span className="text-[11px] text-[#A7B5AE] block">Total Users</span>
                <span className="text-xl sm:text-2xl font-black text-[#F3F7F5] tabular-nums mt-1 block">
                  {metrics.stats?.totalUsers?.toLocaleString()}
                </span>
              </div>
              <div className="p-4 sm:p-5 rounded-2xl border border-[#34433B] bg-[#111714]">
                <span className="text-[11px] text-[#A7B5AE] block">Active Users</span>
                <span className="text-xl sm:text-2xl font-black text-[#18D6A0] tabular-nums mt-1 block">
                  {metrics.stats?.activeUsers?.toLocaleString()}
                </span>
              </div>
              <div className="p-4 sm:p-5 rounded-2xl border border-[#34433B] bg-[#111714]">
                <span className="text-[11px] text-[#A7B5AE] block">Banned Accounts</span>
                <span className="text-xl sm:text-2xl font-black text-red-400 tabular-nums mt-1 block">
                  {metrics.stats?.bannedAccounts?.toLocaleString()}
                </span>
              </div>
              <div className="p-4 sm:p-5 rounded-2xl border border-[#34433B] bg-[#111714]">
                <span className="text-[11px] text-[#A7B5AE] block">Total Settlements</span>
                <span className="text-xl sm:text-2xl font-black text-[#F3F7F5] tabular-nums mt-1 block">
                  {metrics.stats?.totalTransactions?.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Quick Stats Config Button */}
          <div className="p-4 rounded-2xl border border-[#34433B] bg-[#111714] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#F3F7F5]">Configure Public Telemetry Stats</h3>
              <p className="text-xs text-[#A7B5AE]">Update verified user accounts and settlement figures displayed on the homepage.</p>
            </div>
            <button
              onClick={() => setEditingItem({ type: 'stats', data: metrics?.stats || {} })}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-[#044541] hover:bg-[#065b56] text-[#F3F7F5] text-xs font-semibold cursor-pointer self-start sm:self-auto border border-[#18D6A0]/40 transition-colors"
            >
              Update Telemetry
            </button>
          </div>

          {/* Audit Logs */}
          <div className="rounded-2xl border border-[#34433B] bg-[#111714] p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#F3F7F5]">Security & Audit Event Trail</h3>
            <div className="space-y-2 text-xs font-mono max-h-60 overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-2.5 rounded-xl bg-[#1A211E] border border-[#34433B] flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                  <span className="font-bold text-[#18D6A0]">{log.action}</span>
                  <span className="text-[#F3F7F5] flex-1 truncate">{log.detail}</span>
                  <span className="text-[#84958C] text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. PRICING SECTION - 100% ADMIN CONTROLLED */}
      {activeTab === 'pricing' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#F3F7F5]">
                Pricing Plans Management ({plans.length})
              </h2>
              <p className="text-xs text-[#A7B5AE]">
                Create, edit, toggle Active/Inactive, or delete plans. Live user website updates automatically.
              </p>
            </div>
            <button
              onClick={() => setEditingItem({
                type: 'pricing',
                data: {
                  name: '',
                  price: 19,
                  currency: 'USD / FSD',
                  priceFSD: 190,
                  billingType: 'Monthly',
                  duration: '1 Month',
                  shortDescription: '',
                  description: '',
                  features: ['Priority queue for high-yield tasks', 'Fast payout approval SLA'],
                  isFeatured: false,
                  status: 'active'
                }
              })}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#044541] hover:bg-[#065b56] text-[#F3F7F5] text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer self-start sm:self-auto border border-[#18D6A0]/50 shadow-md transition-all"
            >
              <Plus className="w-4 h-4 text-[#18D6A0]" />
              <span>Create New Plan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((p) => {
              const isActive = p.status === 'active' || !p.status;
              return (
                <div
                  key={p.id}
                  className={`p-5 rounded-2xl border bg-[#111714] space-y-3 flex flex-col justify-between transition-all ${
                    !isActive ? 'opacity-60 border-dashed border-[#34433B]' : 'border-[#34433B]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-[#F3F7F5]">{p.name}</h3>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold border ${
                          isActive ? 'bg-emerald-950 text-[#18D6A0] border-emerald-800' : 'bg-neutral-800 text-[#A7B5AE] border-neutral-700'
                        }`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                        {p.isFeatured && (
                          <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded-lg font-bold">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xl font-black text-[#F3F7F5]">
                      ${p.price ?? p.priceUSD} <span className="text-xs font-normal text-[#A7B5AE]">/ {p.duration || p.billingType}</span>
                    </div>

                    <p className="text-xs text-[#A7B5AE] line-clamp-2">
                      {p.shortDescription || p.description}
                    </p>

                    <div className="text-[11px] text-[#84958C] pt-1">
                      Billing Type: <strong className="text-[#F3F7F5]">{p.billingType || 'Monthly'}</strong>
                    </div>

                    <ul className="text-xs space-y-1.5 text-[#A7B5AE] pt-2 border-t border-[#34433B]">
                      {p.features?.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5 truncate">
                          <Check className="w-3.5 h-3.5 text-[#18D6A0] shrink-0" />
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#34433B]">
                    <button
                      onClick={async () => {
                        const newStatus = isActive ? 'inactive' : 'active';
                        await fetch(`/api/pricing/${p.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
                          body: JSON.stringify({ status: newStatus })
                        });
                        showStatus(`Plan marked ${newStatus}`);
                        fetchAllData();
                      }}
                      className="text-xs font-semibold text-[#A7B5AE] hover:text-[#18D6A0] transition-colors cursor-pointer"
                    >
                      {isActive ? 'Deactivate' : 'Activate'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditingItem({ type: 'pricing', data: p })}
                        className="p-2 rounded-xl bg-[#1A211E] text-[#F3F7F5] border border-[#34433B] hover:border-[#18D6A0] cursor-pointer transition-colors"
                        title="Edit Plan"
                      >
                        <Edit3 className="w-4 h-4 text-[#18D6A0]" />
                      </button>
                      <button
                        onClick={() => handleDelete('pricing', p.id)}
                        className="p-2 rounded-xl bg-red-950/60 text-red-300 border border-red-900/60 hover:bg-red-900/60 cursor-pointer transition-colors"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. ANDROID APPS & APK MANAGEMENT */}
      {activeTab === 'apps' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#F3F7F5]">
                Android Applications & APK Management ({apps.length})
              </h2>
              <p className="text-xs text-[#A7B5AE]">
                Manage Android apps, upload APKs to Cloudflare R2, or provide external download URLs.
              </p>
            </div>
            <button
              onClick={() => setEditingItem({
                type: 'app',
                data: {
                  name: 'Fleearn Mobile',
                  packageName: 'com.fleearn.ecosystem.app',
                  currentVersion: '2.5.0',
                  releaseDate: new Date().toISOString().split('T')[0],
                  fileSize: '28.0 MB',
                  sha256: '',
                  downloadMethod: 'upload',
                  downloadUrl: '',
                  r2Key: '',
                  iconUrl: '',
                  shortDescription: '',
                  description: '',
                  screenshots: [],
                  status: 'active'
                }
              })}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#044541] hover:bg-[#065b56] text-[#F3F7F5] text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer self-start sm:self-auto border border-[#18D6A0]/50 shadow-md transition-all"
            >
              <Plus className="w-4 h-4 text-[#18D6A0]" />
              <span>Add New App</span>
            </button>
          </div>

          <div className="space-y-4">
            {apps.map((app) => (
              <div key={app.id} className="p-5 sm:p-6 rounded-2xl border border-[#34433B] bg-[#111714] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {app.iconUrl ? (
                      <img
                        src={app.iconUrl}
                        alt="Icon"
                        className="w-12 h-12 rounded-xl object-cover border border-[#34433B] shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#1A211E] border border-[#34433B] text-[#18D6A0] flex items-center justify-center shrink-0">
                        <Smartphone className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-[#F3F7F5]">{app.name}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-lg font-bold bg-emerald-950 text-[#18D6A0] border border-emerald-800">
                          v{app.currentVersion}
                        </span>
                      </div>
                      <p className="text-xs text-[#A7B5AE] font-mono mt-0.5">
                        {app.packageName} · Download Method: <strong className="text-[#F3F7F5] uppercase">{app.downloadMethod || 'upload'}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingItem({ type: 'app', data: app })}
                      className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#044541] hover:bg-[#065b56] text-[#F3F7F5] text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-[#18D6A0]/40 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#18D6A0]" />
                      <span>Edit App</span>
                    </button>
                    <button
                      onClick={() => handleDelete('app', app.id)}
                      className="min-h-[38px] p-2 rounded-xl bg-red-950/60 text-red-300 border border-red-900/60 hover:bg-red-900/60 cursor-pointer transition-colors"
                      title="Delete App"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#A7B5AE] leading-relaxed">
                  {app.shortDescription || app.description}
                </p>

                {/* Specs row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-[#1A211E] border border-[#34433B]">
                    <span className="text-[#84958C] block text-[10px]">Downloads</span>
                    <span className="font-bold text-[#F3F7F5]">{app.downloadCount?.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#1A211E] border border-[#34433B]">
                    <span className="text-[#84958C] block text-[10px]">Package Size</span>
                    <span className="font-bold text-[#F3F7F5]">{app.fileSize}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#1A211E] border border-[#34433B] col-span-2">
                    <span className="text-[#84958C] block text-[10px]">Download Target</span>
                    <span className="font-bold text-[#F3F7F5] truncate block">
                      {app.downloadMethod === 'external' ? app.downloadUrl || 'External link pending' : app.r2Key || 'Uploaded to R2'}
                    </span>
                  </div>
                </div>

                {/* Screenshots preview */}
                {app.screenshots && app.screenshots.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-[#34433B]">
                    <span className="text-[11px] font-bold text-[#A7B5AE] uppercase">Registered Screenshots ({app.screenshots.length})</span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {app.screenshots.map((s, idx) => (
                        <img
                          key={idx}
                          src={s}
                          alt="Screenshot"
                          className="h-16 w-12 object-cover rounded-lg border border-[#34433B] shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. NOTICES BOARD */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#F3F7F5]">
                Notices Board Management ({notices.length})
              </h2>
              <p className="text-xs text-[#A7B5AE]">
                Publish Text notices, PDF documents, or Image banners directly to Cloudflare R2.
              </p>
            </div>
            <button
              onClick={() => setEditingItem({
                type: 'notice',
                data: {
                  title: '',
                  shortDescription: '',
                  content: '',
                  noticeType: 'text',
                  fileUrl: '',
                  r2Key: '',
                  category: 'General',
                  priority: 'Normal',
                  status: 'active'
                }
              })}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#044541] hover:bg-[#065b56] text-[#F3F7F5] text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer self-start sm:self-auto border border-[#18D6A0]/50 shadow-md transition-all"
            >
              <Plus className="w-4 h-4 text-[#18D6A0]" />
              <span>Create Notice</span>
            </button>
          </div>

          <div className="rounded-2xl border border-[#34433B] bg-[#111714] divide-y divide-[#34433B] overflow-hidden">
            {notices.map((n) => (
              <div key={n.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-xs">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2 text-[#84958C]">
                    <span className="font-bold text-[#18D6A0]">{n.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-[11px] uppercase bg-[#1A211E] text-[#F3F7F5] px-2 py-0.5 rounded-md border border-[#34433B]">
                      {n.noticeType || 'text'} Notice
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Status: {n.status}</span>
                    <span aria-hidden="true">·</span>
                    <span>Priority: {n.priority}</span>
                  </div>

                  <h3 className="text-sm font-bold text-[#F3F7F5]">{n.title}</h3>
                  <p className="text-[#A7B5AE] line-clamp-2">{n.shortDescription}</p>

                  {n.fileUrl && (
                    <div className="pt-1 text-[11px] text-[#18D6A0] flex items-center gap-1">
                      <FolderUp className="w-3.5 h-3.5" />
                      <span>Attached file: {n.fileName || n.fileUrl}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => setEditingItem({ type: 'notice', data: n })}
                    className="p-2 rounded-xl bg-[#1A211E] text-[#F3F7F5] border border-[#34433B] hover:border-[#18D6A0] cursor-pointer transition-colors"
                    title="Edit Notice"
                  >
                    <Edit3 className="w-4 h-4 text-[#18D6A0]" />
                  </button>
                  <button
                    onClick={() => handleDelete('notice', n.id)}
                    className="p-2 rounded-xl bg-red-950/60 text-red-300 border border-red-900/60 hover:bg-red-900/60 cursor-pointer transition-colors"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. COMPANY SETTINGS */}
      {activeTab === 'company' && companySettings && (
        <div className="rounded-2xl border border-[#34433B] bg-[#111714] p-5 sm:p-7 space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#F3F7F5]">
              Fleearn Official Information & Links Management
            </h2>
            <p className="text-xs text-[#A7B5AE] mt-1">
              Changes made here instantly propagate to the Footer, Contact page, and Official links sections across all user views.
            </p>
          </div>

          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Company Name</label>
                <input
                  type="text"
                  required
                  value={companySettings.name || ''}
                  onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Tagline</label>
                <input
                  type="text"
                  value={companySettings.tagline || ''}
                  onChange={(e) => setCompanySettings({ ...companySettings, tagline: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Fleearn Short Description</label>
              <textarea
                rows={2}
                value={companySettings.shortDescription || ''}
                onChange={(e) => setCompanySettings({ ...companySettings, shortDescription: e.target.value })}
                className={textareaClass}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Official Email</label>
                <input
                  type="email"
                  value={companySettings.email || ''}
                  onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Website Domain URL</label>
                <input
                  type="text"
                  value={companySettings.website || ''}
                  onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Direct Phone</label>
                <input
                  type="text"
                  value={companySettings.phone || ''}
                  onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Physical Address</label>
              <input
                type="text"
                value={companySettings.address || ''}
                onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                className={inputClass}
              />
            </div>

            {/* Official Social Links */}
            <div className="pt-4 border-t border-[#34433B] space-y-3">
              <h3 className="text-sm font-bold text-[#F3F7F5]">Official Social Channels</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Telegram URL</label>
                  <input
                    type="text"
                    value={companySettings.socialLinks?.telegram || ''}
                    onChange={(e) => setCompanySettings({
                      ...companySettings,
                      socialLinks: { ...companySettings.socialLinks, telegram: e.target.value }
                    })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Twitter / X URL</label>
                  <input
                    type="text"
                    value={companySettings.socialLinks?.twitter || ''}
                    onChange={(e) => setCompanySettings({
                      ...companySettings,
                      socialLinks: { ...companySettings.socialLinks, twitter: e.target.value }
                    })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>YouTube URL</label>
                  <input
                    type="text"
                    value={companySettings.socialLinks?.youtube || ''}
                    onChange={(e) => setCompanySettings({
                      ...companySettings,
                      socialLinks: { ...companySettings.socialLinks, youtube: e.target.value }
                    })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Facebook URL</label>
                  <input
                    type="text"
                    value={companySettings.socialLinks?.facebook || ''}
                    onChange={(e) => setCompanySettings({
                      ...companySettings,
                      socialLinks: { ...companySettings.socialLinks, facebook: e.target.value }
                    })}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#34433B]">
              <button
                type="button"
                onClick={async () => {
                  await fetch('/api/company', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
                    body: JSON.stringify(companySettings)
                  });
                  updateCompany(companySettings);
                  showStatus('Company settings & social links saved!');
                }}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#044541] hover:bg-[#065b56] text-[#F3F7F5] font-bold cursor-pointer border border-[#18D6A0]/40 transition-colors"
              >
                Save Official Information & Links
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. LEGAL DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-[#F3F7F5]">
            Legal Policy Charters ({documents.length})
          </h2>
          <div className="rounded-2xl border border-[#34433B] bg-[#111714] divide-y divide-[#34433B] overflow-hidden">
            {documents.map((d) => (
              <div key={d.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h3 className="font-bold text-sm text-[#F3F7F5]">{d.title}</h3>
                  <span className="text-[#84958C] font-mono">Category: {d.category} · Version {d.version}</span>
                </div>
                <button
                  onClick={() => setEditingItem({ type: 'document', data: d })}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#044541] hover:bg-[#065b56] text-[#F3F7F5] font-semibold cursor-pointer border border-[#18D6A0]/40 transition-colors self-start sm:self-auto"
                >
                  Edit Charter Body
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. FAQ DATABASE */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#F3F7F5]">
                FAQ Knowledge Base ({faqs.length})
              </h2>
              <p className="text-xs text-[#A7B5AE]">Manage FAQs across 20 categories.</p>
            </div>
            <button
              onClick={() => setEditingItem({
                type: 'faq',
                data: {
                  category: 'General Information',
                  question: '',
                  answer: ''
                }
              })}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#044541] hover:bg-[#065b56] text-[#F3F7F5] text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer self-start sm:self-auto border border-[#18D6A0]/50 shadow-md transition-all"
            >
              <Plus className="w-4 h-4 text-[#18D6A0]" />
              <span>Add New FAQ</span>
            </button>
          </div>

          <div className="rounded-2xl border border-[#34433B] bg-[#111714] divide-y divide-[#34433B] overflow-hidden">
            {faqs.map((f) => (
              <div key={f.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-xs">
                <div className="space-y-1 max-w-2xl">
                  <span className="text-[10px] font-mono uppercase bg-[#1A211E] text-[#18D6A0] px-2 py-0.5 rounded-md border border-[#34433B]">
                    {f.category}
                  </span>
                  <h3 className="font-bold text-sm text-[#F3F7F5] pt-1">{f.question}</h3>
                  <p className="text-[#A7B5AE] line-clamp-2">{f.answer}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => setEditingItem({ type: 'faq', data: f })}
                    className="p-2 rounded-xl bg-[#1A211E] text-[#F3F7F5] border border-[#34433B] hover:border-[#18D6A0] cursor-pointer transition-colors"
                  >
                    <Edit3 className="w-4 h-4 text-[#18D6A0]" />
                  </button>
                  <button
                    onClick={() => handleDelete('faq', f.id)}
                    className="p-2 rounded-xl bg-red-950/60 text-red-300 border border-red-900/60 hover:bg-red-900/60 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. SUPPORT TICKETS */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-[#F3F7F5]">
            Support Inquiries & Tickets ({tickets.length})
          </h2>
          <div className="rounded-2xl border border-[#34433B] bg-[#111714] divide-y divide-[#34433B] overflow-hidden">
            {tickets.map((t) => (
              <div key={t.id} className="p-4 sm:p-5 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono font-bold text-[#F3F7F5]">{t.id} · {t.name} ({t.email})</span>
                  <span className="font-bold text-[#18D6A0] px-2 py-0.5 bg-[#1A211E] rounded-md border border-[#34433B]">{t.status}</span>
                </div>
                <p className="font-semibold text-[#F3F7F5]">Subject: {t.subject}</p>
                <p className="text-[#A7B5AE] bg-[#1A211E] p-3 rounded-xl border border-[#34433B]">
                  {t.message}
                </p>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingItem({ type: 'ticket', data: t })}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#044541] hover:bg-[#065b56] text-[#F3F7F5] font-semibold cursor-pointer border border-[#18D6A0]/40 transition-colors"
                  >
                    Update Ticket Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. ABUSE REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-[#F3F7F5]">
            Security & Policy Infraction Reports ({reports.length})
          </h2>
          <div className="rounded-2xl border border-[#34433B] bg-[#111714] divide-y divide-[#34433B] overflow-hidden">
            {reports.map((r) => (
              <div key={r.id} className="p-4 sm:p-5 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono font-bold text-[#F3F7F5]">{r.id} · {r.category}</span>
                  <span className="font-bold text-red-400 px-2 py-0.5 bg-red-950/40 rounded-md border border-red-900/60">{r.status}</span>
                </div>
                <p className="text-[#A7B5AE] bg-[#1A211E] p-3 rounded-xl border border-[#34433B]">
                  {r.description}
                </p>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingItem({ type: 'report', data: r })}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#044541] hover:bg-[#065b56] text-[#F3F7F5] font-semibold cursor-pointer border border-[#18D6A0]/40 transition-colors"
                  >
                    Review & Change Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. GALLERY STATE */}
      {activeTab === 'gallery' && gallerySettings && (
        <div className="rounded-2xl border border-[#34433B] bg-[#111714] p-5 sm:p-8 space-y-4 text-xs">
          <h2 className="text-base font-bold text-[#F3F7F5]">Gallery Service State</h2>
          <p className="text-[#A7B5AE]">Current Status: <strong className="text-[#F3F7F5]">{gallerySettings.enabled ? 'Enabled' : 'Disabled (Unavailable)'}</strong></p>
          <p className="text-[#A7B5AE]">Display Message: <span className="text-[#F3F7F5]">"{gallerySettings.message}"</span></p>
          <button
            onClick={() => setEditingItem({ type: 'gallery', data: gallerySettings })}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#044541] hover:bg-[#065b56] text-[#F3F7F5] font-semibold cursor-pointer border border-[#18D6A0]/40 transition-colors"
          >
            Configure Gallery Availability
          </button>
        </div>
      )}

      {/* ============================================================
          UNIVERSAL EDIT MODAL WITH CLOUDFLARE R2 UPLOADS
      ============================================================ */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-2xl bg-[#111714] text-[#F3F7F5] rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-[#34433B] flex flex-col overflow-hidden">
            {/* Sticky Modal Header */}
            <div className="px-4 sm:px-6 py-3.5 border-b border-[#34433B] flex items-center justify-between bg-[#111714] shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#18D6A0]" />
                <h3 className="text-sm sm:text-base font-bold text-[#F3F7F5] capitalize">
                  {editingItem.data.id ? 'Edit' : 'Create New'} {editingItem.type}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-lg text-[#A7B5AE] hover:text-[#F3F7F5] hover:bg-[#1A211E] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Scroll Area */}
            <form onSubmit={handleSaveEdit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain">
                {/* EDITING PRICING PLAN */}
                {editingItem.type === 'pricing' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className={labelClass}>Plan Name *</label>
                        <input
                          type="text"
                          required
                          value={editingItem.data.name || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } })}
                          placeholder="e.g. Pro Freelancer"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Status *</label>
                        <select
                          value={editingItem.data.status || 'active'}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, status: e.target.value } })}
                          className={selectClass}
                        >
                          <option value="active" className="bg-[#1A211E] text-[#F3F7F5]">Active (Visible to users)</option>
                          <option value="inactive" className="bg-[#1A211E] text-[#F3F7F5]">Inactive (Hidden)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <label className={labelClass}>Price (USD) *</label>
                        <input
                          type="number"
                          required
                          value={editingItem.data.price ?? editingItem.data.priceUSD ?? 0}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, price: parseFloat(e.target.value) || 0 } })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Currency Label</label>
                        <input
                          type="text"
                          value={editingItem.data.currency || 'USD / FSD'}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, currency: e.target.value } })}
                          placeholder="USD / FSD"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>FSD Equivalent</label>
                        <input
                          type="number"
                          value={editingItem.data.priceFSD || 0}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, priceFSD: parseFloat(e.target.value) || 0 } })}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className={labelClass}>Billing Type *</label>
                        <select
                          value={editingItem.data.billingType || 'Monthly'}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, billingType: e.target.value } })}
                          className={selectClass}
                        >
                          <option value="Weekly" className="bg-[#1A211E] text-[#F3F7F5]">Weekly</option>
                          <option value="Monthly" className="bg-[#1A211E] text-[#F3F7F5]">Monthly</option>
                          <option value="Yearly" className="bg-[#1A211E] text-[#F3F7F5]">Yearly</option>
                          <option value="Lifetime" className="bg-[#1A211E] text-[#F3F7F5]">Lifetime</option>
                          <option value="Custom" className="bg-[#1A211E] text-[#F3F7F5]">Custom duration / নির্দিষ্ট কত বছর</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Duration Display Label</label>
                        <input
                          type="text"
                          value={editingItem.data.duration || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, duration: e.target.value } })}
                          placeholder="e.g. 1 Month, 1 Year, 2 Years, Lifetime"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Short Description</label>
                      <input
                        type="text"
                        value={editingItem.data.shortDescription || editingItem.data.description || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, shortDescription: e.target.value, description: e.target.value } })}
                        placeholder="Brief headline for the plan"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Features / Benefits (One per line)</label>
                      <textarea
                        rows={4}
                        value={Array.isArray(editingItem.data.features) ? editingItem.data.features.join('\n') : ''}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: {
                            ...editingItem.data,
                            features: e.target.value.split('\n').filter(Boolean)
                          }
                        })}
                        placeholder="Priority queue for tasks&#10;Fast-track payout approval&#10;Reduced withdrawal fees"
                        className={`${textareaClass} min-h-[110px]`}
                      />
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1A211E] border border-[#34433B]">
                      <input
                        type="checkbox"
                        id="isFeatured"
                        checked={Boolean(editingItem.data.isFeatured)}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, isFeatured: e.target.checked } })}
                        className="w-4 h-4 rounded text-[#18D6A0] bg-[#111714] border-[#34433B] focus:ring-[#18D6A0] cursor-pointer"
                      />
                      <label htmlFor="isFeatured" className="text-xs sm:text-sm font-semibold text-[#F3F7F5] cursor-pointer">
                        Mark as Featured / Most Popular Plan
                      </label>
                    </div>
                  </>
                )}

                {/* EDITING ANDROID APP */}
                {editingItem.type === 'app' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className={labelClass}>App Name *</label>
                        <input
                          type="text"
                          required
                          value={editingItem.data.name || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>App Version *</label>
                        <input
                          type="text"
                          required
                          value={editingItem.data.currentVersion || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, currentVersion: e.target.value } })}
                          placeholder="e.g. 2.5.0"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Package Name</label>
                      <input
                        type="text"
                        value={editingItem.data.packageName || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, packageName: e.target.value } })}
                        placeholder="e.g. com.fleearn.ecosystem.app"
                        className={`${inputClass} font-mono text-xs`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className={labelClass}>Download Method *</label>
                        <select
                          value={editingItem.data.downloadMethod || 'upload'}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, downloadMethod: e.target.value } })}
                          className={selectClass}
                        >
                          <option value="upload" className="bg-[#1A211E] text-[#F3F7F5]">Option A — Upload APK to Cloudflare R2</option>
                          <option value="external" className="bg-[#1A211E] text-[#F3F7F5]">Option B — External APK Download Link</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Status</label>
                        <select
                          value={editingItem.data.status || 'active'}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, status: e.target.value } })}
                          className={selectClass}
                        >
                          <option value="active" className="bg-[#1A211E] text-[#F3F7F5]">Active (Visible)</option>
                          <option value="inactive" className="bg-[#1A211E] text-[#F3F7F5]">Inactive (Hidden)</option>
                        </select>
                      </div>
                    </div>

                    {/* DOWNLOAD METHOD: OPTION A vs OPTION B */}
                    {editingItem.data.downloadMethod === 'upload' ? (
                      <div className="p-4 rounded-xl border border-dashed border-[#18D6A0]/50 bg-[#1A211E] space-y-2">
                        <label className="block text-xs font-bold text-[#18D6A0]">
                          Upload APK File to Cloudflare R2:
                        </label>
                        <input
                          type="file"
                          accept=".apk"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const res = await handleFileUpload(file, 'apps/apk');
                              if (res) {
                                setEditingItem({
                                  ...editingItem,
                                  data: {
                                    ...editingItem.data,
                                    r2Key: res.r2Key,
                                    downloadUrl: res.publicUrl,
                                    fileSize: res.fileSize
                                  }
                                });
                              }
                            }
                          }}
                          className="w-full text-xs text-[#A7B5AE] cursor-pointer file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#044541] file:text-[#F3F7F5] file:cursor-pointer"
                        />
                        {editingItem.data.r2Key && (
                          <p className="text-[11px] font-mono text-[#18D6A0]">
                            R2 Key: {editingItem.data.r2Key} ({editingItem.data.fileSize})
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className={labelClass}>External APK Download URL *</label>
                        <input
                          type="url"
                          value={editingItem.data.downloadUrl || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, downloadUrl: e.target.value } })}
                          placeholder="https://example.com/downloads/fleearn.apk"
                          className={`${inputClass} font-mono`}
                        />
                      </div>
                    )}

                    {/* App Icon Upload to R2 */}
                    <div className="p-4 rounded-xl border border-[#34433B] bg-[#1A211E] space-y-2">
                      <label className={labelClass}>App Icon (Upload to Cloudflare R2)</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const res = await handleFileUpload(file, 'apps/icons');
                              if (res) {
                                setEditingItem({
                                  ...editingItem,
                                  data: { ...editingItem.data, iconUrl: res.publicUrl }
                                });
                              }
                            }
                          }}
                          className="text-xs text-[#A7B5AE] cursor-pointer file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#044541] file:text-[#F3F7F5] file:cursor-pointer"
                        />
                        {editingItem.data.iconUrl && (
                          <img
                            src={editingItem.data.iconUrl}
                            alt="Icon Preview"
                            className="w-10 h-10 rounded-xl object-cover border border-[#34433B]"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>
                    </div>

                    {/* Screenshots Uploads to R2 */}
                    <div className="p-4 rounded-xl border border-[#34433B] bg-[#1A211E] space-y-2">
                      <label className={labelClass}>Add Screenshots to Cloudflare R2</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          for (const file of files) {
                            const res = await handleFileUpload(file, 'apps/screenshots');
                            if (res) {
                              const current = Array.isArray(editingItem.data.screenshots) ? editingItem.data.screenshots : [];
                              setEditingItem({
                                ...editingItem,
                                data: { ...editingItem.data, screenshots: [...current, res.publicUrl] }
                              });
                            }
                          }
                        }}
                        className="text-xs text-[#A7B5AE] cursor-pointer file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#044541] file:text-[#F3F7F5] file:cursor-pointer"
                      />
                      {editingItem.data.screenshots && editingItem.data.screenshots.length > 0 && (
                        <div className="flex items-center gap-2 overflow-x-auto pt-2">
                          {editingItem.data.screenshots.map((s: string, idx: number) => (
                            <div key={idx} className="relative group shrink-0">
                              <img src={s} alt="thumb" className="w-12 h-16 object-cover rounded-lg border border-[#34433B]" />
                              <button
                                type="button"
                                onClick={() => {
                                  const next = editingItem.data.screenshots.filter((_: any, i: number) => i !== idx);
                                  setEditingItem({ ...editingItem, data: { ...editingItem.data, screenshots: next } });
                                }}
                                className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 text-[8px]"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className={labelClass}>Short Description</label>
                      <input
                        type="text"
                        value={editingItem.data.shortDescription || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, shortDescription: e.target.value } })}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Full Description</label>
                      <textarea
                        rows={3}
                        value={editingItem.data.description || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, description: e.target.value } })}
                        className={textareaClass}
                      />
                    </div>
                  </>
                )}

                {/* EDITING NOTICE */}
                {editingItem.type === 'notice' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className={labelClass}>Notice Title *</label>
                        <input
                          type="text"
                          required
                          value={editingItem.data.title || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Notice Type *</label>
                        <select
                          value={editingItem.data.noticeType || 'text'}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, noticeType: e.target.value } })}
                          className={selectClass}
                        >
                          <option value="text" className="bg-[#1A211E] text-[#F3F7F5]">A. Text Notice</option>
                          <option value="pdf" className="bg-[#1A211E] text-[#F3F7F5]">B. PDF Notice (Upload to R2)</option>
                          <option value="image" className="bg-[#1A211E] text-[#F3F7F5]">C. Image Notice (Upload to R2)</option>
                        </select>
                      </div>
                    </div>

                    {/* NOTICE PDF UPLOAD */}
                    {editingItem.data.noticeType === 'pdf' && (
                      <div className="p-4 rounded-xl border border-dashed border-red-500/50 bg-[#1A211E] space-y-2">
                        <label className="block text-xs font-bold text-red-400">
                          Upload PDF Notice File to Cloudflare R2:
                        </label>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const res = await handleFileUpload(file, 'notices/pdf');
                              if (res) {
                                setEditingItem({
                                  ...editingItem,
                                  data: {
                                    ...editingItem.data,
                                    fileUrl: res.publicUrl,
                                    r2Key: res.r2Key,
                                    fileName: res.fileName,
                                    fileSize: res.fileSize
                                  }
                                });
                              }
                            }
                          }}
                          className="w-full text-xs text-[#A7B5AE] cursor-pointer file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#044541] file:text-[#F3F7F5] file:cursor-pointer"
                        />
                        {editingItem.data.fileUrl && (
                          <p className="text-[11px] font-mono text-[#18D6A0]">
                            Uploaded PDF: {editingItem.data.fileName} ({editingItem.data.fileSize})
                          </p>
                        )}
                      </div>
                    )}

                    {/* NOTICE IMAGE UPLOAD */}
                    {editingItem.data.noticeType === 'image' && (
                      <div className="p-4 rounded-xl border border-dashed border-[#18D6A0]/50 bg-[#1A211E] space-y-2">
                        <label className="block text-xs font-bold text-[#18D6A0]">
                          Upload Image Notice (JPG/PNG) to Cloudflare R2:
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const res = await handleFileUpload(file, 'notices/images');
                              if (res) {
                                setEditingItem({
                                  ...editingItem,
                                  data: {
                                    ...editingItem.data,
                                    fileUrl: res.publicUrl,
                                    r2Key: res.r2Key,
                                    fileName: res.fileName,
                                    fileSize: res.fileSize
                                  }
                                });
                              }
                            }
                          }}
                          className="w-full text-xs text-[#A7B5AE] cursor-pointer file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#044541] file:text-[#F3F7F5] file:cursor-pointer"
                        />
                        {editingItem.data.fileUrl && (
                          <div className="pt-2">
                            <img
                              src={editingItem.data.fileUrl}
                              alt="Notice Preview"
                              className="h-28 w-auto rounded-lg border border-[#34433B] object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <label className={labelClass}>Short Description</label>
                      <textarea
                        rows={2}
                        value={editingItem.data.shortDescription || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, shortDescription: e.target.value } })}
                        className={textareaClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Notice Content / Text Body</label>
                      <textarea
                        rows={4}
                        value={editingItem.data.content || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, content: e.target.value } })}
                        className={textareaClass}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <label className={labelClass}>Category</label>
                        <input
                          type="text"
                          value={editingItem.data.category || 'General'}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, category: e.target.value } })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Priority</label>
                        <select
                          value={editingItem.data.priority || 'Normal'}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, priority: e.target.value } })}
                          className={selectClass}
                        >
                          <option value="Low" className="bg-[#1A211E] text-[#F3F7F5]">Low</option>
                          <option value="Normal" className="bg-[#1A211E] text-[#F3F7F5]">Normal</option>
                          <option value="High" className="bg-[#1A211E] text-[#F3F7F5]">High</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Status</label>
                        <select
                          value={editingItem.data.status || 'active'}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, status: e.target.value } })}
                          className={selectClass}
                        >
                          <option value="active" className="bg-[#1A211E] text-[#F3F7F5]">Active (Visible)</option>
                          <option value="expired" className="bg-[#1A211E] text-[#F3F7F5]">Expired</option>
                          <option value="archived" className="bg-[#1A211E] text-[#F3F7F5]">Archived</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* EDITING LEGAL DOCUMENT */}
                {editingItem.type === 'document' && (
                  <>
                    <div>
                      <label className={labelClass}>Title</label>
                      <input
                        type="text"
                        value={editingItem.data.title || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Document Body</label>
                      <textarea
                        rows={8}
                        value={editingItem.data.body || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, body: e.target.value } })}
                        className={`${textareaClass} font-mono`}
                      />
                    </div>
                  </>
                )}

                {/* EDITING FAQ */}
                {editingItem.type === 'faq' && (
                  <>
                    <div>
                      <label className={labelClass}>Category</label>
                      <input
                        type="text"
                        value={editingItem.data.category || 'General Information'}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, category: e.target.value } })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Question</label>
                      <input
                        type="text"
                        value={editingItem.data.question || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, question: e.target.value } })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Answer</label>
                      <textarea
                        rows={4}
                        value={editingItem.data.answer || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, answer: e.target.value } })}
                        className={textareaClass}
                      />
                    </div>
                  </>
                )}

                {/* EDITING TICKET */}
                {editingItem.type === 'ticket' && (
                  <>
                    <div>
                      <label className={labelClass}>Status</label>
                      <select
                        value={editingItem.data.status || 'Open'}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, status: e.target.value } })}
                        className={selectClass}
                      >
                        <option value="Open" className="bg-[#1A211E] text-[#F3F7F5]">Open</option>
                        <option value="In Progress" className="bg-[#1A211E] text-[#F3F7F5]">In Progress</option>
                        <option value="Resolved" className="bg-[#1A211E] text-[#F3F7F5]">Resolved</option>
                        <option value="Closed" className="bg-[#1A211E] text-[#F3F7F5]">Closed</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Internal Administrator Notes</label>
                      <textarea
                        rows={3}
                        value={editingItem.data.internalNotes || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, internalNotes: e.target.value } })}
                        className={textareaClass}
                      />
                    </div>
                  </>
                )}

                {/* EDITING REPORT */}
                {editingItem.type === 'report' && (
                  <div>
                    <label className={labelClass}>Status</label>
                    <select
                      value={editingItem.data.status || 'Open'}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, status: e.target.value } })}
                      className={selectClass}
                    >
                      <option value="Open" className="bg-[#1A211E] text-[#F3F7F5]">Open</option>
                      <option value="Investigating" className="bg-[#1A211E] text-[#F3F7F5]">Investigating</option>
                      <option value="Resolved" className="bg-[#1A211E] text-[#F3F7F5]">Resolved</option>
                      <option value="Dismissed" className="bg-[#1A211E] text-[#F3F7F5]">Dismissed</option>
                    </select>
                  </div>
                )}

                {/* EDITING STATS */}
                {editingItem.type === 'stats' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className={labelClass}>Total Users</label>
                      <input
                        type="number"
                        value={editingItem.data.totalUsers || 0}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, totalUsers: parseInt(e.target.value, 10) || 0 } })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Active Users</label>
                      <input
                        type="number"
                        value={editingItem.data.activeUsers || 0}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, activeUsers: parseInt(e.target.value, 10) || 0 } })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Banned Accounts</label>
                      <input
                        type="number"
                        value={editingItem.data.bannedAccounts || 0}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, bannedAccounts: parseInt(e.target.value, 10) || 0 } })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Total Transactions</label>
                      <input
                        type="number"
                        value={editingItem.data.totalTransactions || 0}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, totalTransactions: parseInt(e.target.value, 10) || 0 } })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}

                {/* EDITING GALLERY */}
                {editingItem.type === 'gallery' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1A211E] border border-[#34433B]">
                      <input
                        type="checkbox"
                        id="galEnabled"
                        checked={Boolean(editingItem.data.enabled)}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, enabled: e.target.checked } })}
                        className="w-4 h-4 rounded text-[#18D6A0] bg-[#111714] border-[#34433B] focus:ring-[#18D6A0] cursor-pointer"
                      />
                      <label htmlFor="galEnabled" className="text-xs sm:text-sm font-semibold text-[#F3F7F5] cursor-pointer">
                        Enable Gallery Page Service
                      </label>
                    </div>
                    <div>
                      <label className={labelClass}>Service Unavailable Display Message</label>
                      <input
                        type="text"
                        value={editingItem.data.message || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, message: e.target.value } })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}

                {isUploading && (
                  <div className="p-3.5 bg-[#044541]/70 border border-[#18D6A0]/60 text-[#18D6A0] rounded-xl text-xs flex items-center gap-2 animate-pulse">
                    <Upload className="w-4 h-4 animate-bounce" />
                    <span className="font-semibold">Uploading file to Cloudflare R2...</span>
                  </div>
                )}
              </div>

              {/* Sticky Modal Footer Actions */}
              <div className="px-4 sm:px-6 py-3.5 border-t border-[#34433B] bg-[#111714] flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-[#34433B] bg-[#1A211E] hover:bg-[#232D29] text-[#A7B5AE] hover:text-[#F3F7F5] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#044541] hover:bg-[#065b56] text-[#F3F7F5] border border-[#18D6A0]/40 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-[#18D6A0]" />
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
