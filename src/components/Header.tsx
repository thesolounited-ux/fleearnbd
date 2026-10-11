import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Language } from '../types';
import { Globe, Menu, X, ShieldCheck, Download } from 'lucide-react';

export const Header: React.FC = () => {
  const { language, setLanguage, currentPage, navigateTo, t, adminToken } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t('home') },
    { id: 'notices', label: t('notices') },
    { id: 'apps', label: t('mobileApps') },
    { id: 'features', label: t('features') },
    { id: 'pricing', label: t('pricing') },
    { id: 'gallery', label: t('gallery') },
    { id: 'documents', label: t('documents') },
    { id: 'faq', label: t('faq') },
    { id: 'support', label: t('support') },
    { id: 'report', label: t('report') },
    { id: 'contact', label: t('contact') },
  ];

  const languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'ru', name: 'Русский' },
    { code: 'ar', name: 'العربية' }
  ];

  const handleNavClick = (id: string) => {
    navigateTo(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0B0F0E]/95 border-b border-[#1E2B27] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
        <button
          onClick={() => handleNavClick('home')}
          className="text-xl sm:text-2xl font-black tracking-tight text-white whitespace-nowrap shrink-0 hover:text-emerald-400 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-white bg-clip-text text-transparent">
            Fleearn
          </span>
        </button>

        {/* Zone 2: Desktop Navigation links */}
        <nav className="hidden xl:flex items-center gap-5 text-sm font-medium text-neutral-300">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
                  isActive
                    ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
                    : 'hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          {adminToken && (
            <button
              onClick={() => handleNavClick('admin-dashboard')}
              className="text-amber-400 font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 hover:text-amber-300"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t('admin')}</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Language + Action + Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="p-2 rounded-xl text-neutral-300 hover:text-white bg-[#141C1A] hover:bg-[#1A2622] border border-[#1E2B27] transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              aria-label="Select Language"
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              <span className="uppercase text-[11px] sm:text-xs">{language}</span>
            </button>

            {langDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setLangDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-36 bg-[#141C1A] rounded-xl shadow-2xl border border-[#1E2B27] py-1.5 z-50 text-xs">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                        language === l.code
                          ? 'bg-emerald-950/60 text-emerald-400 font-bold'
                          : 'text-neutral-300 hover:bg-[#1E2B27] hover:text-white'
                      }`}
                    >
                      <span>{l.name}</span>
                      {language === l.code && <span className="text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Primary Action Button (Download App) */}
          <button
            onClick={() => handleNavClick('apps')}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-[#044541] hover:bg-[#065b56] active:scale-95 rounded-xl border border-emerald-700/40 shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('downloadApp')}</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl text-neutral-300 hover:text-white bg-[#141C1A] hover:bg-[#1A2622] border border-[#1E2B27] cursor-pointer transition-colors"
            aria-label="Open Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Touch-Friendly & Dark) */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-[#1E2B27] bg-[#0B0F0E]/98 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-1.5 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-1.5 pb-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer min-h-[44px] flex items-center ${
                  currentPage === item.id
                    ? 'bg-emerald-950/70 text-emerald-400 font-bold border border-emerald-800/60'
                    : 'text-neutral-300 hover:bg-[#16201D] hover:text-white border border-transparent'
                }`}
              >
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>

          {adminToken && (
            <button
              onClick={() => handleNavClick('admin-dashboard')}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-amber-400 bg-amber-950/40 border border-amber-800/50 flex items-center gap-2 cursor-pointer mt-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t('admin')} Central Console</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
