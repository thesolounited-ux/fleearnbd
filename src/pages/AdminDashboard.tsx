import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Notice, MobileApp, PricingPlan, Course, LegalDocument, FAQItem, SupportTicket, ReportItem, ContactMessage, AuditLog } from '../types';
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
  Search,
  ExternalLink,
  Upload,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  FolderUp,
  Link as LinkIcon
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
  const [uploadedUrlFeedback, setUploadedUrlFeedback] = useState<string | null>(null);

  // Modal / Edit forms state
  const [editingItem, setEditingItem] = useState<{ type: string; data: any } | null>(null);

  const fetchAllData = () => {
    if (!adminToken) return;
    setLoading(true);

    const headers = { Authorization: `Bearer ${adminToken}` };

    Promise.all([
      fetch('/api/admin/metrics', { headers }).then(r => r.json()),
      fetch('/api/admin/storage-status', { headers }).then(r => r.json()),
      fetch('/api/notices/all', { headers }).then(r => r.json()),
      fetch('/api/apps/all', { headers }).then(r => r.json()),
      fetch('/api/pricing/all', { headers }).then(r => r.json()),
      fetch('/api/documents').then(r => r.json()),
      fetch('/api/faqs').then(r => r.json()),
      fetch('/api/courses').then(r => r.json()),
      fetch('/api/support', { headers }).then(r => r.json()),
      fetch('/api/reports', { headers }).then(r => r.json()),
      fetch('/api/company').then(r => r.json()),
      fetch('/api/gallery').then(r => r.json()),
    ]).then(([m, s, n, a, p, d, f, c, t, rep, comp, gal]) => {
      setMetrics(m);
      setStorageStatus(s);
      if (Array.isArray(n)) setNotices(n);
      if (Array.isArray(a)) setApps(a);
      if (Array.isArray(p)) setPlans(p);
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
    setUploadedUrlFeedback(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: formData,
      });

      const data = await res.json();
      setIsUploading(false);

      if (data.success && data.file) {
        const sizeFormatted = (data.file.fileSize / (1024 * 1024)).toFixed(1) + ' MB';
        setUploadedUrlFeedback(data.file.publicUrl);
        showStatus(`File uploaded to ${data.file.storageProvider.toUpperCase()} successfully!`);
        return {
          publicUrl: data.file.publicUrl,
          r2Key: data.file.r2Key,
          fileName: data.file.fileName,
          fileSize: sizeFormatted,
        };
      } else {
        alert(data.error || 'Upload failed');
        return null;
      }
    } catch (err: any) {
      setIsUploading(false);
      alert('Upload failed: ' + err.message);
      return null;
    }
  };

  // Generic Save Handler
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    };

    const { type, data } = editingItem;

    try {
      if (type === 'notice') {
        const url = data.id ? `/api/notices/${data.id}` : '/api/notices';
        const method = data.id ? 'PUT' : 'POST';
        await fetch(url, { method, headers, body: JSON.stringify(data) });
      } else if (type === 'app') {
        const url = data.id ? `/api/apps/${data.id}` : '/api/apps';
        const method = data.id ? 'PUT' : 'POST';
        await fetch(url, { method, headers, body: JSON.stringify(data) });
      } else if (type === 'pricing') {
        const url = data.id ? `/api/pricing/${data.id}` : '/api/pricing';
        const method = data.id ? 'PUT' : 'POST';
        await fetch(url, { method, headers, body: JSON.stringify(data) });
      } else if (type === 'document') {
        await fetch(`/api/documents/${data.id}`, { method: 'PUT', headers, body: JSON.stringify(data) });
      } else if (type === 'faq') {
        const url = data.id ? `/api/faqs/${data.id}` : '/api/faqs';
        const method = data.id ? 'PUT' : 'POST';
        await fetch(url, { method, headers, body: JSON.stringify(data) });
      } else if (type === 'course') {
        const url = data.id ? `/api/courses/${data.id}` : '/api/courses';
        const method = data.id ? 'PUT' : 'POST';
        await fetch(url, { method, headers, body: JSON.stringify(data) });
      } else if (type === 'ticket') {
        await fetch(`/api/support/${data.id}`, { method: 'PUT', headers, body: JSON.stringify(data) });
      } else if (type === 'report') {
        await fetch(`/api/reports/${data.id}`, { method: 'PUT', headers, body: JSON.stringify(data) });
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

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Banner - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[#044541] dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
              Administrator Master Console
            </h1>
            <span className="text-[11px] text-neutral-500 font-mono">
              UID: 250660 · Role: Super Admin
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {statusMsg && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-1 bg-emerald-50 dark:bg-emerald-950/60 rounded">
              {statusMsg}
            </span>
          )}
          <button
            onClick={fetchAllData}
            className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={logoutAdmin}
            className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100 border border-red-200 dark:border-red-900 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Strip - Horizontal Scroll on Mobile */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-neutral-200 dark:border-neutral-800 scrollbar-thin">
        {navTabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#044541] text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW & CLOUDFLARE R2 STORAGE */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          {/* Cloudflare R2 Storage Status Card */}
          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Cloud className={`w-5 h-5 ${storageStatus?.r2Configured ? 'text-emerald-500' : 'text-amber-500'}`} />
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Cloudflare R2 Object Storage Integration
                </h3>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-bold inline-flex items-center gap-1 self-start sm:self-auto ${
                storageStatus?.r2Configured
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
              }`}>
                {storageStatus?.r2Configured ? '✓ Cloudflare R2 Active' : '● Local Fallback Storage Active'}
              </span>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {storageStatus?.r2Configured
                ? `Files, APKs, screenshots, and notices are securely stored in your Cloudflare R2 bucket: "${storageStatus.bucketName}".`
                : `Currently using local persistent storage. To connect your live Cloudflare R2 bucket, provide CLOUDFLARE_R2_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, and CLOUDFLARE_R2_SECRET_ACCESS_KEY in environment variables.`}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <span className="text-neutral-400 block text-[10px]">Bucket</span>
                <span className="text-neutral-800 dark:text-neutral-200 font-bold">{storageStatus?.bucketName || 'fleearn-storage'}</span>
              </div>
              <div className="p-2.5 rounded bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <span className="text-neutral-400 block text-[10px]">Total Uploaded Files</span>
                <span className="text-neutral-800 dark:text-neutral-200 font-bold">{metrics?.totalUploadedFiles || 0}</span>
              </div>
              <div className="p-2.5 rounded bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <span className="text-neutral-400 block text-[10px]">Active Provider</span>
                <span className="text-neutral-800 dark:text-neutral-200 font-bold">{storageStatus?.provider || 'Storage'}</span>
              </div>
            </div>
          </div>

          {/* Metrics summary */}
          {metrics && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 sm:p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816]">
                <span className="text-[11px] text-neutral-400 block">Total Users</span>
                <span className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tabular-nums mt-1 block">
                  {metrics.stats?.totalUsers?.toLocaleString()}
                </span>
              </div>
              <div className="p-4 sm:p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816]">
                <span className="text-[11px] text-neutral-400 block">Active Users</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums mt-1 block">
                  {metrics.stats?.activeUsers?.toLocaleString()}
                </span>
              </div>
              <div className="p-4 sm:p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816]">
                <span className="text-[11px] text-neutral-400 block">Banned Accounts</span>
                <span className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400 tabular-nums mt-1 block">
                  {metrics.stats?.bannedAccounts?.toLocaleString()}
                </span>
              </div>
              <div className="p-4 sm:p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816]">
                <span className="text-[11px] text-neutral-400 block">Total Settlements</span>
                <span className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tabular-nums mt-1 block">
                  {metrics.stats?.totalTransactions?.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Quick Stats Config Button */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Configure Public Telemetry Stats</h3>
              <p className="text-xs text-neutral-500">Update verified user accounts and settlement figures displayed on the homepage.</p>
            </div>
            <button
              onClick={() => setEditingItem({ type: 'stats', data: metrics?.stats })}
              className="px-3 py-1.5 rounded-lg bg-[#044541] text-white text-xs font-semibold cursor-pointer self-start sm:self-auto"
            >
              Update Telemetry
            </button>
          </div>

          {/* Audit Logs */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] p-5 space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Security & Audit Event Trail</h3>
            <div className="space-y-2 text-xs font-mono max-h-60 overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-2 rounded bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                  <span className="font-bold text-[#044541] dark:text-emerald-400">{log.action}</span>
                  <span className="text-neutral-700 dark:text-neutral-300 flex-1 truncate">{log.detail}</span>
                  <span className="text-neutral-400 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
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
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Pricing Plans Management ({plans.length})
              </h2>
              <p className="text-xs text-neutral-500">
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
                  billingType: 'Monthly',
                  duration: '1 Month',
                  shortDescription: '',
                  description: '',
                  features: ['Access to daily tasks', 'Fast payout approval'],
                  isFeatured: false,
                  status: 'active'
                }
              })}
              className="px-3.5 py-2 rounded-lg bg-[#044541] hover:bg-[#033633] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Plan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((p) => {
              const isActive = p.status === 'active' || !p.status;
              return (
                <div
                  key={p.id}
                  className={`p-5 rounded-xl border bg-white dark:bg-[#111816] space-y-3 flex flex-col justify-between transition-all ${
                    !isActive ? 'opacity-60 border-dashed border-neutral-300 dark:border-neutral-700' : 'border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-neutral-900 dark:text-white">{p.name}</h3>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                        }`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                        {p.isFeatured && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.5 rounded font-bold">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xl font-black text-neutral-900 dark:text-white">
                      ${p.price ?? p.priceUSD} <span className="text-xs font-normal text-neutral-500">/ {p.duration || p.billingType}</span>
                    </div>

                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                      {p.shortDescription || p.description}
                    </p>

                    <div className="text-[11px] text-neutral-400 pt-1">
                      Billing Type: <strong className="text-neutral-700 dark:text-neutral-300">{p.billingType || 'Monthly'}</strong>
                    </div>

                    <ul className="text-xs space-y-1 text-neutral-600 dark:text-neutral-300 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                      {p.features?.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5 truncate">
                          <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
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
                      className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:underline cursor-pointer"
                    >
                      {isActive ? 'Deactivate' : 'Activate'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditingItem({ type: 'pricing', data: p })}
                        className="p-1.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 cursor-pointer"
                        title="Edit Plan"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete('pricing', p.id)}
                        className="p-1.5 rounded bg-red-50 dark:bg-red-950 text-red-600 hover:bg-red-100 cursor-pointer"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Android Applications & APK Management ({apps.length})
              </h2>
              <p className="text-xs text-neutral-500">
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
                  downloadMethod: 'upload', // 'upload' | 'external'
                  downloadUrl: '',
                  r2Key: '',
                  iconUrl: '',
                  shortDescription: '',
                  description: '',
                  screenshots: [],
                  status: 'active'
                }
              })}
              className="px-3.5 py-2 rounded-lg bg-[#044541] hover:bg-[#033633] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New App</span>
            </button>
          </div>

          <div className="space-y-4">
            {apps.map((app) => (
              <div key={app.id} className="p-5 sm:p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {app.iconUrl ? (
                      <img
                        src={app.iconUrl}
                        alt="Icon"
                        className="w-12 h-12 rounded-xl object-cover border border-neutral-200 dark:border-neutral-800 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
                        <Smartphone className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">{app.name}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          v{app.currentVersion}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        {app.packageName} · Download Method: <strong className="text-neutral-700 dark:text-neutral-300 uppercase">{app.downloadMethod || 'upload'}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingItem({ type: 'app', data: app })}
                      className="px-3 py-1.5 rounded bg-[#044541] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit App</span>
                    </button>
                    <button
                      onClick={() => handleDelete('app', app.id)}
                      className="p-1.5 rounded bg-red-50 dark:bg-red-950 text-red-600 cursor-pointer"
                      title="Delete App"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {app.shortDescription || app.description}
                </p>

                {/* Specs row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                  <div className="p-2.5 rounded bg-neutral-50 dark:bg-neutral-900">
                    <span className="text-neutral-400 block text-[10px]">Downloads</span>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">{app.downloadCount?.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 rounded bg-neutral-50 dark:bg-neutral-900">
                    <span className="text-neutral-400 block text-[10px]">Package Size</span>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">{app.fileSize}</span>
                  </div>
                  <div className="p-2.5 rounded bg-neutral-50 dark:bg-neutral-900 col-span-2">
                    <span className="text-neutral-400 block text-[10px]">Download Target</span>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200 truncate block">
                      {app.downloadMethod === 'external' ? app.downloadUrl || 'External link pending' : app.r2Key || 'Uploaded to R2'}
                    </span>
                  </div>
                </div>

                {/* Screenshots preview */}
                {app.screenshots && app.screenshots.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase">Registered Screenshots ({app.screenshots.length})</span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {app.screenshots.map((s, idx) => (
                        <img
                          key={idx}
                          src={s}
                          alt="Screenshot"
                          className="h-16 w-12 object-cover rounded border border-neutral-200 dark:border-neutral-800 shrink-0"
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

      {/* 4. NOTICES BOARD (Text, PDF, Image notices) */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Notices Board Management ({notices.length})
              </h2>
              <p className="text-xs text-neutral-500">
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
              className="px-3.5 py-2 rounded-lg bg-[#044541] hover:bg-[#033633] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Notice</span>
            </button>
          </div>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] divide-y divide-neutral-200 dark:divide-neutral-800">
            {notices.map((n) => (
              <div key={n.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-xs">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2 text-neutral-400">
                    <span className="font-bold text-[#044541] dark:text-emerald-400">{n.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-[11px] uppercase bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                      {n.noticeType || 'text'} Notice
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Status: {n.status}</span>
                    <span aria-hidden="true">·</span>
                    <span>Priority: {n.priority}</span>
                  </div>

                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{n.title}</h3>
                  <p className="text-neutral-500 line-clamp-1">{n.shortDescription}</p>

                  {n.fileUrl && (
                    <div className="pt-1 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <FolderUp className="w-3.5 h-3.5" />
                      <span>Attached file: {n.fileName || n.fileUrl}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => setEditingItem({ type: 'notice', data: n })}
                    className="p-1.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 cursor-pointer"
                    title="Edit Notice"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete('notice', n.id)}
                    className="p-1.5 rounded bg-red-50 dark:bg-red-950 text-red-600 hover:bg-red-100 cursor-pointer"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. COMPANY SETTINGS & OFFICIAL SOCIAL LINKS */}
      {activeTab === 'company' && companySettings && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] p-5 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              Fleearn Official Information & Links Management
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Changes made here instantly propagate to the Footer, Contact page, and Official links sections across all user views.
            </p>
          </div>

          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={companySettings.name || ''}
                  onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Tagline</label>
                <input
                  type="text"
                  value={companySettings.tagline || ''}
                  onChange={(e) => setCompanySettings({ ...companySettings, tagline: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Fleearn Short Description</label>
              <textarea
                rows={2}
                value={companySettings.shortDescription || ''}
                onChange={(e) => setCompanySettings({ ...companySettings, shortDescription: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold mb-1">Official Email</label>
                <input
                  type="email"
                  value={companySettings.email || ''}
                  onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Website Domain URL</label>
                <input
                  type="text"
                  value={companySettings.website || ''}
                  onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Direct Phone</label>
                <input
                  type="text"
                  value={companySettings.phone || ''}
                  onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Physical Address</label>
              <input
                type="text"
                value={companySettings.address || ''}
                onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
              />
            </div>

            {/* Official Social Links */}
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Official Social Channels</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Telegram URL</label>
                  <input
                    type="text"
                    value={companySettings.socialLinks?.telegram || ''}
                    onChange={(e) => setCompanySettings({
                      ...companySettings,
                      socialLinks: { ...companySettings.socialLinks, telegram: e.target.value }
                    })}
                    className="w-full p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Twitter / X URL</label>
                  <input
                    type="text"
                    value={companySettings.socialLinks?.twitter || ''}
                    onChange={(e) => setCompanySettings({
                      ...companySettings,
                      socialLinks: { ...companySettings.socialLinks, twitter: e.target.value }
                    })}
                    className="w-full p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">YouTube URL</label>
                  <input
                    type="text"
                    value={companySettings.socialLinks?.youtube || ''}
                    onChange={(e) => setCompanySettings({
                      ...companySettings,
                      socialLinks: { ...companySettings.socialLinks, youtube: e.target.value }
                    })}
                    className="w-full p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Facebook URL</label>
                  <input
                    type="text"
                    value={companySettings.socialLinks?.facebook || ''}
                    onChange={(e) => setCompanySettings({
                      ...companySettings,
                      socialLinks: { ...companySettings.socialLinks, facebook: e.target.value }
                    })}
                    className="w-full p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
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
                className="px-5 py-2.5 rounded-lg bg-[#044541] hover:bg-[#033633] text-white font-bold cursor-pointer"
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
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            12 Legal Policy Charters
          </h2>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] divide-y divide-neutral-200 dark:divide-neutral-800">
            {documents.map((d) => (
              <div key={d.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">{d.title}</h3>
                  <span className="text-neutral-500 font-mono">Category: {d.category} · Version {d.version}</span>
                </div>
                <button
                  onClick={() => setEditingItem({ type: 'document', data: d })}
                  className="px-3 py-1.5 rounded bg-[#044541] text-white font-semibold cursor-pointer self-start sm:self-auto"
                >
                  Edit Charter Body
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. FAQ MANAGEMENT */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              FAQ Database ({faqs.length} entries)
            </h2>
            <button
              onClick={() => setEditingItem({
                type: 'faq',
                data: { category: 'General Information', question: '', answer: '' }
              })}
              className="px-3 py-2 rounded-lg bg-[#044541] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add FAQ</span>
            </button>
          </div>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] divide-y divide-neutral-200 dark:divide-neutral-800 max-h-[600px] overflow-y-auto">
            {faqs.map((f) => (
              <div key={f.id} className="p-4 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[#044541] dark:text-emerald-400">{f.category}</span>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">{f.question}</h3>
                  <p className="text-neutral-500 line-clamp-2">{f.answer}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditingItem({ type: 'faq', data: f })}
                    className="p-1.5 rounded bg-neutral-100 dark:bg-neutral-800 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete('faq', f.id)}
                    className="p-1.5 rounded bg-red-50 text-red-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            Support Ticket Queue ({tickets.length})
          </h2>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] divide-y divide-neutral-200 dark:divide-neutral-800">
            {tickets.map((t) => (
              <div key={t.id} className="p-4 sm:p-5 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-neutral-700 dark:text-neutral-300">{t.id}</span>
                    <span className="font-semibold text-neutral-500">· {t.name} ({t.email})</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                    t.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {t.status}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">{t.subject}</h3>
                <p className="text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-900 p-3 rounded">
                  {t.message}
                </p>
                {t.internalNotes && (
                  <p className="text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded text-[11px]">
                    Internal Note: {t.internalNotes}
                  </p>
                )}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingItem({ type: 'ticket', data: t })}
                    className="px-3 py-1 rounded bg-[#044541] text-white font-semibold cursor-pointer"
                  >
                    Update Status & Notes
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
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            Security & Policy Infraction Reports ({reports.length})
          </h2>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] divide-y divide-neutral-200 dark:divide-neutral-800">
            {reports.map((r) => (
              <div key={r.id} className="p-4 sm:p-5 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono font-bold text-neutral-700 dark:text-neutral-300">{r.id} · {r.category}</span>
                  <span className="font-bold text-red-600">{r.status}</span>
                </div>
                <p className="text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-900 p-3 rounded">
                  {r.description}
                </p>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingItem({ type: 'report', data: r })}
                    className="px-3 py-1 rounded bg-[#044541] text-white font-semibold cursor-pointer"
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
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] p-5 sm:p-8 space-y-4 text-xs">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">Gallery Service State</h2>
          <p>Current Status: <strong>{gallerySettings.enabled ? 'Enabled' : 'Disabled (Unavailable)'}</strong></p>
          <p>Display Message: "{gallerySettings.message}"</p>
          <button
            onClick={() => setEditingItem({ type: 'gallery', data: gallerySettings })}
            className="px-4 py-2 rounded bg-[#044541] text-white font-semibold cursor-pointer"
          >
            Configure Gallery Availability
          </button>
        </div>
      )}

      {/* ============================================================
          UNIVERSAL EDIT MODAL WITH CLOUDFLARE R2 UPLOADS
      ============================================================ */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#111816] rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-7 max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white capitalize">
              {editingItem.data.id ? 'Edit' : 'Create New'} {editingItem.type}
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* EDITING PRICING PLAN */}
              {editingItem.type === 'pricing' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Plan Name *</label>
                      <input
                        type="text"
                        required
                        value={editingItem.data.name || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } })}
                        placeholder="e.g. Pro Creator"
                        className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Status</label>
                      <select
                        value={editingItem.data.status || 'active'}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, status: e.target.value } })}
                        className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                      >
                        <option value="active">Active (Visible to users)</option>
                        <option value="inactive">Inactive (Hidden)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Price *</label>
                      <input
                        type="number"
                        required
                        value={editingItem.data.price ?? editingItem.data.priceUSD ?? 0}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, price: parseFloat(e.target.value) } })}
                        className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Currency</label>
                      <input
                        type="text"
                        value={editingItem.data.currency || 'USD / FSD'}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, currency: e.target.value } })}
                        className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">FSD Equivalent</label>
                      <input
                        type="number"
                        value={editingItem.data.priceFSD || 0}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, priceFSD: parseFloat(e.target.value) } })}
                        className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Billing Type *</label>
                      <select
                        value={editingItem.data.billingType || 'Monthly'}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, billingType: e.target.value } })}
                        className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                      >
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                        <option value="Lifetime">Lifetime</option>
                        <option value="Custom">Custom duration / নির্দিষ্ট বছর</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Duration Display Label</label>
                      <input
                        type="text"
                        value={editingItem.data.duration || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, duration: e.target.value } })}
                        placeholder="e.g. 1 Month, 1 Year, 2 Years, Lifetime"
                        className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Short Description</label>
                    <input
                      type="text"
                      value={editingItem.data.shortDescription || editingItem.data.description || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, shortDescription: e.target.value, description: e.target.value } })}
                      placeholder="Brief headline for the plan"
                      className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Features / Benefits (One per line)</label>
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
                      placeholder="Benefit 1&#10;Benefit 2&#10;Benefit 3"
                      className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={Boolean(editingItem.data.isFeatured)}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, isFeatured: e.target.checked } })}
                      className="rounded text-[#044541]"
                    />
                    <label htmlFor="isFeatured" className="font-semibold cursor-pointer">
                      Mark as Featured / Most Popular Plan
                    </label>
                  </div>
                </>
              )}

              {/* EDITING ANDROID APP */}
              {editingItem.type === 'app' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">App Name *</label>
                      <input
                        type="text"
                        required
                        value={editingItem.data.name || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } })}
                        className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">App Version *</label>
                      <input
                        type="text"
                        required
                        value={editingItem.data.currentVersion || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, currentVersion: e.target.value } })}
                        placeholder="e.g. 2.5.0"
                        className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Package Name</label>
                    <input
                      type="text"
                      value={editingItem.data.packageName || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, packageName: e.target.value } })}
                      placeholder="e.g. com.fleearn.ecosystem.app"
                      className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900 font-mono text-[11px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Download Method *</label>
                      <select
                        value={editingItem.data.downloadMethod || 'upload'}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, downloadMethod: e.target.value } })}
                        className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900 font-semibold"
                      >
                        <option value="upload">Option A — Upload APK to Cloudflare R2</option>
                        <option value="external">Option B — External APK Download Link</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Status</label>
                      <select
                        value={editingItem.data.status || 'active'}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, status: e.target.value } })}
                        className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                      >
                        <option value="active">Active (Visible)</option>
                        <option value="inactive">Inactive (Hidden)</option>
                      </select>
                    </div>
                  </div>

                  {/* DOWNLOAD METHOD: OPTION A vs OPTION B */}
                  {editingItem.data.downloadMethod === 'upload' ? (
                    <div className="p-3.5 rounded-lg border border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2">
                      <label className="block font-bold text-emerald-800 dark:text-emerald-300">
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
                        className="w-full text-xs text-neutral-600 dark:text-neutral-300 cursor-pointer"
                      />
                      {editingItem.data.r2Key && (
                        <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                          R2 Key: {editingItem.data.r2Key} ({editingItem.data.fileSize})
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block font-semibold mb-1">External APK Download URL *</label>
                      <input
                        type="url"
                        value={editingItem.data.downloadUrl || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, downloadUrl: e.target.value } })}
                        placeholder="https://example.com/downloads/fleearn.apk"
                        className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900 font-mono text-xs"
                      />
                    </div>
                  )}

                  {/* App Icon Upload to R2 */}
                  <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 space-y-2">
                    <label className="block font-semibold">App Icon (Upload to Cloudflare R2)</label>
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
                        className="text-xs cursor-pointer"
                      />
                      {editingItem.data.iconUrl && (
                        <img
                          src={editingItem.data.iconUrl}
                          alt="Icon Preview"
                          className="w-10 h-10 rounded object-cover border"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                  </div>

                  {/* Screenshot 1, 2, 3 Uploads to R2 */}
                  <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 space-y-2">
                    <label className="block font-semibold">Add Screenshots to Cloudflare R2</label>
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
                      className="text-xs cursor-pointer"
                    />
                    {editingItem.data.screenshots && editingItem.data.screenshots.length > 0 && (
                      <div className="flex items-center gap-2 overflow-x-auto pt-1">
                        {editingItem.data.screenshots.map((s: string, idx: number) => (
                          <div key={idx} className="relative group shrink-0">
                            <img src={s} alt="thumb" className="w-12 h-16 object-cover rounded border" />
                            <button
                              type="button"
                              onClick={() => {
                                const next = editingItem.data.screenshots.filter((_: any, i: number) => i !== idx);
                                setEditingItem({ ...editingItem, data: { ...editingItem.data, screenshots: next } });
                              }}
                              className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-0.5 text-[8px]"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Short Description</label>
                    <input
                      type="text"
                      value={editingItem.data.shortDescription || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, shortDescription: e.target.value } })}
                      className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Full Description</label>
                    <textarea
                      rows={3}
                      value={editingItem.data.description || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, description: e.target.value } })}
                      className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                    />
                  </div>
                </>
              )}

              {/* EDITING NOTICE (Text, PDF, Image Notice) */}
              {editingItem.type === 'notice' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Notice Title *</label>
                      <input
                        type="text"
                        required
                        value={editingItem.data.title || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                        className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Notice Type *</label>
                      <select
                        value={editingItem.data.noticeType || 'text'}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, noticeType: e.target.value } })}
                        className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900 font-bold"
                      >
                        <option value="text">A. Text Notice</option>
                        <option value="pdf">B. PDF Notice (Upload to R2)</option>
                        <option value="image">C. Image Notice (Upload to R2)</option>
                      </select>
                    </div>
                  </div>

                  {/* NOTICE PDF UPLOAD */}
                  {editingItem.data.noticeType === 'pdf' && (
                    <div className="p-3.5 rounded-lg border border-dashed border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 space-y-2">
                      <label className="block font-bold text-red-800 dark:text-red-300">
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
                        className="w-full text-xs cursor-pointer"
                      />
                      {editingItem.data.fileUrl && (
                        <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                          Uploaded PDF: {editingItem.data.fileName} ({editingItem.data.fileSize})
                        </p>
                      )}
                    </div>
                  )}

                  {/* NOTICE IMAGE UPLOAD */}
                  {editingItem.data.noticeType === 'image' && (
                    <div className="p-3.5 rounded-lg border border-dashed border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
                      <label className="block font-bold text-blue-800 dark:text-blue-300">
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
                        className="w-full text-xs cursor-pointer"
                      />
                      {editingItem.data.fileUrl && (
                        <div className="pt-2">
                          <img
                            src={editingItem.data.fileUrl}
                            alt="Notice Preview"
                            className="h-28 w-auto rounded border object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold mb-1">Short Description</label>
                    <textarea
                      rows={2}
                      value={editingItem.data.shortDescription || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, shortDescription: e.target.value } })}
                      className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Notice Content / Text Body</label>
                    <textarea
                      rows={4}
                      value={editingItem.data.content || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, content: e.target.value } })}
                      className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Category</label>
                      <input
                        type="text"
                        value={editingItem.data.category || 'General'}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, category: e.target.value } })}
                        className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Priority</label>
                      <select
                        value={editingItem.data.priority || 'Normal'}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, priority: e.target.value } })}
                        className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                      >
                        <option value="Low">Low</option>
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Status</label>
                      <select
                        value={editingItem.data.status || 'active'}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, status: e.target.value } })}
                        className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                      >
                        <option value="active">Active (Visible)</option>
                        <option value="expired">Expired</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* EDITING LEGAL DOCUMENT */}
              {editingItem.type === 'document' && (
                <>
                  <div>
                    <label className="block font-semibold mb-1">Title</label>
                    <input
                      type="text"
                      value={editingItem.data.title || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                      className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Document Body</label>
                    <textarea
                      rows={8}
                      value={editingItem.data.body || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, body: e.target.value } })}
                      className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900 font-mono"
                    />
                  </div>
                </>
              )}

              {/* EDITING FAQ */}
              {editingItem.type === 'faq' && (
                <>
                  <div>
                    <label className="block font-semibold mb-1">Category</label>
                    <input
                      type="text"
                      value={editingItem.data.category || 'General Information'}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, category: e.target.value } })}
                      className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Question</label>
                    <input
                      type="text"
                      value={editingItem.data.question || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, question: e.target.value } })}
                      className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Answer</label>
                    <textarea
                      rows={4}
                      value={editingItem.data.answer || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, answer: e.target.value } })}
                      className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                    />
                  </div>
                </>
              )}

              {/* EDITING TICKET */}
              {editingItem.type === 'ticket' && (
                <>
                  <div>
                    <label className="block font-semibold mb-1">Status</label>
                    <select
                      value={editingItem.data.status || 'Open'}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, status: e.target.value } })}
                      className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Internal Administrator Notes</label>
                    <textarea
                      rows={3}
                      value={editingItem.data.internalNotes || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, internalNotes: e.target.value } })}
                      className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                    />
                  </div>
                </>
              )}

              {/* EDITING REPORT */}
              {editingItem.type === 'report' && (
                <div>
                  <label className="block font-semibold mb-1">Status</label>
                  <select
                    value={editingItem.data.status || 'Open'}
                    onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, status: e.target.value } })}
                    className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                  >
                    <option value="Open">Open</option>
                    <option value="Investigating">Investigating</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Dismissed">Dismissed</option>
                  </select>
                </div>
              )}

              {/* EDITING STATS */}
              {editingItem.type === 'stats' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Total Users</label>
                    <input
                      type="number"
                      value={editingItem.data.totalUsers || 0}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, totalUsers: parseInt(e.target.value, 10) } })}
                      className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Active Users</label>
                    <input
                      type="number"
                      value={editingItem.data.activeUsers || 0}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, activeUsers: parseInt(e.target.value, 10) } })}
                      className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Banned Accounts</label>
                    <input
                      type="number"
                      value={editingItem.data.bannedAccounts || 0}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, bannedAccounts: parseInt(e.target.value, 10) } })}
                      className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Total Transactions</label>
                    <input
                      type="number"
                      value={editingItem.data.totalTransactions || 0}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, totalTransactions: parseInt(e.target.value, 10) } })}
                      className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                    />
                  </div>
                </div>
              )}

              {/* EDITING GALLERY */}
              {editingItem.type === 'gallery' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="galEnabled"
                      checked={Boolean(editingItem.data.enabled)}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, enabled: e.target.checked } })}
                      className="rounded"
                    />
                    <label htmlFor="galEnabled" className="font-semibold cursor-pointer">
                      Enable Gallery Page Service
                    </label>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Service Unavailable Display Message</label>
                    <input
                      type="text"
                      value={editingItem.data.message || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, message: e.target.value } })}
                      className="w-full p-2.5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                    />
                  </div>
                </div>
              )}

              {isUploading && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded text-xs flex items-center gap-2 animate-pulse">
                  <Upload className="w-4 h-4 animate-bounce" />
                  <span>Uploading file to Cloudflare R2...</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-lg border hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 rounded-lg bg-[#044541] hover:bg-[#033633] text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
