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
  ExternalLink
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { adminToken, logoutAdmin, navigateTo } = useApp();
  const [activeTab, setActiveTab] = useState<string>('metrics');
  const [metrics, setMetrics] = useState<any>(null);
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
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [gallerySettings, setGallerySettings] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Action status message
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Modal / Edit forms state
  const [editingItem, setEditingItem] = useState<{ type: string; data: any } | null>(null);

  const fetchAllData = () => {
    if (!adminToken) return;
    setLoading(true);

    const headers = { Authorization: `Bearer ${adminToken}` };

    Promise.all([
      fetch('/api/admin/metrics', { headers }).then(r => r.json()),
      fetch('/api/notices/all', { headers }).then(r => r.json()),
      fetch('/api/apps').then(r => r.json()),
      fetch('/api/pricing').then(r => r.json()),
      fetch('/api/documents').then(r => r.json()),
      fetch('/api/faqs').then(r => r.json()),
      fetch('/api/courses').then(r => r.json()),
      fetch('/api/support', { headers }).then(r => r.json()),
      fetch('/api/reports', { headers }).then(r => r.json()),
      fetch('/api/contact', { headers }).then(r => r.json()),
      fetch('/api/company').then(r => r.json()),
      fetch('/api/gallery').then(r => r.json()),
    ]).then(([m, n, a, p, d, f, c, t, rep, msg, comp, gal]) => {
      setMetrics(m);
      if (Array.isArray(n)) setNotices(n);
      if (Array.isArray(a)) setApps(a);
      if (Array.isArray(p)) setPlans(p);
      if (Array.isArray(d)) setDocuments(d);
      if (Array.isArray(f)) setFaqs(f);
      if (Array.isArray(c)) setCourses(c);
      if (Array.isArray(t)) setTickets(t);
      if (Array.isArray(rep)) setReports(rep);
      if (Array.isArray(msg)) setMessages(msg);
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
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Generic Save Handler for different entity edits
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
        await fetch(`/api/apps/${data.id}`, { method: 'PUT', headers, body: JSON.stringify(data) });
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
        await fetch('/api/company', { method: 'PUT', headers, body: JSON.stringify(data) });
      } else if (type === 'gallery') {
        await fetch('/api/gallery', { method: 'PUT', headers, body: JSON.stringify(data) });
      } else if (type === 'stats') {
        await fetch('/api/stats', { method: 'PUT', headers, body: JSON.stringify(data) });
      }

      setEditingItem(null);
      showStatus('Record updated successfully.');
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
      if (type === 'faq') await fetch(`/api/faqs/${id}`, { method: 'DELETE', headers });
      showStatus('Record deleted.');
      fetchAllData();
    } catch (e) {
      alert('Failed to delete item.');
    }
  };

  const navTabs = [
    { id: 'metrics', label: 'Overview & Metrics', icon: BarChart3 },
    { id: 'notices', label: 'Notices Board', icon: Bell },
    { id: 'apps', label: 'Mobile Apps & APKs', icon: Smartphone },
    { id: 'pricing', label: 'Pricing Plans', icon: CreditCard },
    { id: 'documents', label: 'Legal Policies', icon: FileText },
    { id: 'faqs', label: 'FAQ Database', icon: HelpCircle },
    { id: 'courses', label: 'Course Catalog', icon: BookOpen },
    { id: 'tickets', label: 'Support Desk', icon: LifeBuoy },
    { id: 'reports', label: 'Abuse Reports', icon: Flag },
    { id: 'company', label: 'Company Settings', icon: Settings },
    { id: 'gallery', label: 'Gallery State', icon: Image },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[#044541] dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-neutral-900 dark:text-white">
              Administrator Master Console
            </h1>
            <span className="text-xs text-neutral-500">
              Authenticated Session · UID: 250660
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {statusMsg && (
            <span className="text-xs text-emerald-600 font-semibold px-2 py-1 bg-emerald-50 dark:bg-emerald-950 rounded">
              {statusMsg}
            </span>
          )}
          <button
            onClick={fetchAllData}
            className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={logoutAdmin}
            className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100 border border-red-200 dark:border-red-900 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Terminate Session</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-neutral-200 dark:border-neutral-800">
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
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW & METRICS */}
      {activeTab === 'metrics' && metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816]">
              <span className="text-xs text-neutral-400 block">Total Registered Users</span>
              <span className="text-2xl font-black text-neutral-900 dark:text-white tabular-nums mt-1 block">
                {metrics.stats?.totalUsers?.toLocaleString()}
              </span>
            </div>
            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816]">
              <span className="text-xs text-neutral-400 block">Active Verified Members</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums mt-1 block">
                {metrics.stats?.activeUsers?.toLocaleString()}
              </span>
            </div>
            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816]">
              <span className="text-xs text-neutral-400 block">Banned Accounts</span>
              <span className="text-2xl font-black text-red-600 dark:text-red-400 tabular-nums mt-1 block">
                {metrics.stats?.bannedAccounts?.toLocaleString()}
              </span>
            </div>
            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816]">
              <span className="text-xs text-neutral-400 block">Total Settlements</span>
              <span className="text-2xl font-black text-neutral-900 dark:text-white tabular-nums mt-1 block">
                {metrics.stats?.totalTransactions?.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60">
              <span className="text-xs text-neutral-400">Total Downloads</span>
              <span className="text-xl font-bold block tabular-nums mt-0.5">{metrics.totalDownloads?.toLocaleString()}</span>
            </div>
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60">
              <span className="text-xs text-neutral-400">Published Notices</span>
              <span className="text-xl font-bold block tabular-nums mt-0.5">{metrics.totalNotices}</span>
            </div>
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60">
              <span className="text-xs text-neutral-400">Open Tickets</span>
              <span className="text-xl font-bold block tabular-nums mt-0.5 text-amber-600">{metrics.openTickets}</span>
            </div>
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60">
              <span className="text-xs text-neutral-400">Pending Reports</span>
              <span className="text-xl font-bold block tabular-nums mt-0.5 text-red-600">{metrics.openReports}</span>
            </div>
          </div>

          {/* Quick Stats Config Button */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Configure Official Public Telemetry</h3>
              <p className="text-xs text-neutral-500">Update verified user accounts and settlement numbers shown on the public homepage.</p>
            </div>
            <button
              onClick={() => setEditingItem({ type: 'stats', data: metrics.stats })}
              className="px-3 py-1.5 rounded-lg bg-[#044541] text-white text-xs font-semibold cursor-pointer"
            >
              Update Telemetry
            </button>
          </div>

          {/* Audit Logs */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] p-6 space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Security & Audit Event Trail</h3>
            <div className="space-y-2 text-xs font-mono">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-2.5 rounded bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4">
                  <span className="font-bold text-[#044541] dark:text-emerald-400">{log.action}</span>
                  <span className="text-neutral-700 dark:text-neutral-300 flex-1 truncate">{log.detail}</span>
                  <span className="text-neutral-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. NOTICES MANAGEMENT */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              Official Platform Notices ({notices.length})
            </h2>
            <button
              onClick={() => setEditingItem({
                type: 'notice',
                data: { title: '', shortDescription: '', content: '', category: 'General', priority: 'Normal', status: 'active' }
              })}
              className="px-3 py-2 rounded-lg bg-[#044541] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Notice</span>
            </button>
          </div>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] divide-y divide-neutral-200 dark:divide-neutral-800">
            {notices.map((n) => (
              <div key={n.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="font-bold text-[#044541] dark:text-emerald-400">{n.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>Status: {n.status}</span>
                    <span aria-hidden="true">·</span>
                    <span>Priority: {n.priority}</span>
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{n.title}</h3>
                  <p className="text-neutral-500 line-clamp-1">{n.shortDescription}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditingItem({ type: 'notice', data: n })}
                    className="p-1.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete('notice', n.id)}
                    className="p-1.5 rounded bg-red-50 dark:bg-red-950/40 text-red-600 hover:bg-red-100 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. MOBILE APPS & APK RELEASES */}
      {activeTab === 'apps' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              Mobile Applications Distribution
            </h2>
          </div>

          {apps.map((app) => (
            <div key={app.id} className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{app.name}</h3>
                  <p className="text-xs text-neutral-500 font-mono">Current Release: v{app.currentVersion} · {app.packageName}</p>
                </div>
                <button
                  onClick={() => setEditingItem({ type: 'app', data: app })}
                  className="px-3 py-1.5 rounded bg-[#044541] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit App Details</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded bg-neutral-50 dark:bg-neutral-900">
                  <span className="text-neutral-400">Total Downloads</span>
                  <span className="font-bold text-sm block mt-0.5">{app.downloadCount.toLocaleString()}</span>
                </div>
                <div className="p-3 rounded bg-neutral-50 dark:bg-neutral-900">
                  <span className="text-neutral-400">Package Size</span>
                  <span className="font-bold text-sm block mt-0.5">{app.fileSize}</span>
                </div>
                <div className="p-3 rounded bg-neutral-50 dark:bg-neutral-900 col-span-2">
                  <span className="text-neutral-400">SHA-256 Checksum</span>
                  <span className="font-mono text-[11px] block mt-0.5 truncate select-all">{app.sha256}</span>
                </div>
              </div>

              {/* Version History in Admin */}
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
                <span className="text-xs font-bold text-neutral-500 uppercase">Registered Version Milestones</span>
                {app.versions?.map((v, i) => (
                  <div key={i} className="p-2 rounded bg-neutral-50 dark:bg-neutral-900 text-xs flex items-center justify-between">
                    <span>v{v.version} ({v.releaseDate}) - {v.notes}</span>
                    <span className="font-mono text-neutral-400 text-[11px]">{v.fileSize}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. PRICING PLANS */}
      {activeTab === 'pricing' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              Pricing Plans Management ({plans.length})
            </h2>
            <button
              onClick={() => setEditingItem({
                type: 'pricing',
                data: { name: '', priceUSD: 10, priceFSD: 100, currency: 'USD / FSD', validity: 'Monthly', description: '', features: [], isFeatured: false, status: 'active' }
              })}
              className="px-3 py-2 rounded-lg bg-[#044541] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Plan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((p) => (
              <div key={p.id} className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">{p.name}</h3>
                  {p.isFeatured && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Featured</span>}
                </div>
                <div className="text-lg font-black text-neutral-900 dark:text-white">
                  ${p.priceUSD} / {p.validity} <span className="text-xs font-normal text-neutral-500">({p.priceFSD} FSD)</span>
                </div>
                <p className="text-xs text-neutral-500 line-clamp-2">{p.description}</p>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    onClick={() => setEditingItem({ type: 'pricing', data: p })}
                    className="p-1.5 rounded bg-neutral-100 dark:bg-neutral-800 text-xs cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete('pricing', p.id)}
                    className="p-1.5 rounded bg-red-50 text-red-600 text-xs cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. LEGAL DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            12 Legal Policy Charters
          </h2>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] divide-y divide-neutral-200 dark:divide-neutral-800">
            {documents.map((d) => (
              <div key={d.id} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">{d.title}</h3>
                  <span className="text-neutral-500 font-mono">Category: {d.category} · Version {d.version} · Updated: {d.lastUpdated}</span>
                </div>
                <button
                  onClick={() => setEditingItem({ type: 'document', data: d })}
                  className="px-3 py-1.5 rounded bg-[#044541] text-white font-semibold cursor-pointer"
                >
                  Edit Charter Body
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. FAQ MANAGEMENT */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              FAQ Database ({faqs.length} entries)
            </h2>
            <button
              onClick={() => setEditingItem({
                type: 'faq',
                data: { category: 'General Information', question: '', answer: '' }
              })}
              className="px-3 py-2 rounded-lg bg-[#044541] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
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

      {/* 7. SUPPORT TICKETS */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            Support Ticket Queue ({tickets.length})
          </h2>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] divide-y divide-neutral-200 dark:divide-neutral-800">
            {tickets.map((t) => (
              <div key={t.id} className="p-5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
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

      {/* 8. REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            Security & Policy Infraction Reports ({reports.length})
          </h2>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] divide-y divide-neutral-200 dark:divide-neutral-800">
            {reports.map((r) => (
              <div key={r.id} className="p-5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
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

      {/* 9. COMPANY SETTINGS */}
      {activeTab === 'company' && companySettings && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] p-6 space-y-4 text-xs">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">Company Identity & Social Coordinates</h2>
          <div className="space-y-2">
            <p><strong>Name:</strong> {companySettings.name}</p>
            <p><strong>Tagline:</strong> {companySettings.tagline}</p>
            <p><strong>Email:</strong> {companySettings.email}</p>
            <p><strong>Website:</strong> {companySettings.website}</p>
            <p><strong>Address:</strong> {companySettings.address}</p>
          </div>
          <button
            onClick={() => setEditingItem({ type: 'company', data: companySettings })}
            className="px-4 py-2 rounded bg-[#044541] text-white font-semibold cursor-pointer"
          >
            Edit Company Data
          </button>
        </div>
      )}

      {/* 10. GALLERY SETTINGS */}
      {activeTab === 'gallery' && gallerySettings && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111816] p-6 space-y-4 text-xs">
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

      {/* Universal Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#111816] rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 max-h-[85vh] overflow-y-auto space-y-4 text-xs">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white capitalize">
              Edit {editingItem.type}
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Conditional Form Inputs */}
              {editingItem.type === 'notice' && (
                <>
                  <div>
                    <label className="block font-semibold mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={editingItem.data.title || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                      className="w-full p-2 border rounded bg-neutral-50 dark:bg-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Short Description</label>
                    <textarea
                      rows={2}
                      value={editingItem.data.shortDescription || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, shortDescription: e.target.value } })}
                      className="w-full p-2 border rounded bg-neutral-50 dark:bg-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Full Content</label>
                    <textarea
                      rows={4}
                      value={editingItem.data.content || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, content: e.target.value } })}
                      className="w-full p-2 border rounded bg-neutral-50 dark:bg-neutral-900"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-semibold mb-1">Category</label>
                      <input
                        type="text"
                        value={editingItem.data.category || 'General'}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, category: e.target.value } })}
                        className="w-full p-2 border rounded bg-neutral-50 dark:bg-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Priority</label>
                      <select
                        value={editingItem.data.priority || 'Normal'}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, priority: e.target.value } })}
                        className="w-full p-2 border rounded bg-neutral-50 dark:bg-neutral-900"
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
                        className="w-full p-2 border rounded bg-neutral-50 dark:bg-neutral-900"
                      >
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {editingItem.type === 'app' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold mb-1">Current Version</label>
                      <input
                        type="text"
                        value={editingItem.data.currentVersion || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, currentVersion: e.target.value } })}
                        className="w-full p-2 border rounded bg-neutral-50 dark:bg-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Download Count</label>
                      <input
                        type="number"
                        value={editingItem.data.downloadCount || 0}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, downloadCount: parseInt(e.target.value, 10) } })}
                        className="w-full p-2 border rounded bg-neutral-50 dark:bg-neutral-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">SHA-256 Checksum</label>
                    <input
                      type="text"
                      value={editingItem.data.sha256 || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, sha256: e.target.value } })}
                      className="w-full p-2 border rounded bg-neutral-50 dark:bg-neutral-900 font-mono"
                    />
                  </div>
                </>
              )}

              {editingItem.type === 'pricing' && (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-semibold mb-1">Plan Name</label>
                      <input
                        type="text"
                        value={editingItem.data.name || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } })}
                        className="w-full p-2 border rounded bg-neutral-50 dark:bg-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Price (USD)</label>
                      <input
                        type="number"
                        value={editingItem.data.priceUSD || 0}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, priceUSD: parseFloat(e.target.value) } })}
                        className="w-full p-2 border rounded bg-neutral-50 dark:bg-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Price (FSD)</label>
                      <input
                        type="number"
                        value={editingItem.data.priceFSD || 0}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, priceFSD: parseFloat(e.target.value) } })}
                        className="w-full p-2 border rounded bg-neutral-50 dark:bg-neutral-900"
                      />
                    </div>
                  </div>
                </>
              )}

              {editingItem.type === 'document' && (
                <>
                  <div>
                    <label className="block font-semibold mb-1">Title</label>
                    <input
                      type="text"
                      value={editingItem.data.title || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                      className="w-full p-2 border rounded bg-neutral-50 dark:bg-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Document Body</label>
                    <textarea
                      rows={8}
                      value={editingItem.data.body || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, body: e.target.value } })}
                      className="w-full p-2 border rounded bg-neutral-50 dark:bg-neutral-900 font-mono"
                    />
                  </div>
                </>
              )}

              {editingItem.type === 'ticket' && (
                <>
                  <div>
                    <label className="block font-semibold mb-1">Status</label>
                    <select
                      value={editingItem.data.status || 'Open'}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, status: e.target.value } })}
                      className="w-full p-2 border rounded bg-neutral-50 dark:bg-neutral-900"
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
                      className="w-full p-2 border rounded bg-neutral-50 dark:bg-neutral-900"
                    />
                  </div>
                </>
              )}

              {editingItem.type === 'stats' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">Total Users</label>
                    <input
                      type="number"
                      value={editingItem.data.totalUsers || 0}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, totalUsers: parseInt(e.target.value, 10) } })}
                      className="w-full p-2 border rounded bg-neutral-50 dark:bg-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Active Users</label>
                    <input
                      type="number"
                      value={editingItem.data.activeUsers || 0}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, activeUsers: parseInt(e.target.value, 10) } })}
                      className="w-full p-2 border rounded bg-neutral-50 dark:bg-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Banned Accounts</label>
                    <input
                      type="number"
                      value={editingItem.data.bannedAccounts || 0}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, bannedAccounts: parseInt(e.target.value, 10) } })}
                      className="w-full p-2 border rounded bg-neutral-50 dark:bg-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Total Transactions</label>
                    <input
                      type="number"
                      value={editingItem.data.totalTransactions || 0}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, totalTransactions: parseInt(e.target.value, 10) } })}
                      className="w-full p-2 border rounded bg-neutral-50 dark:bg-neutral-900"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded border hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#044541] text-white font-semibold cursor-pointer"
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
