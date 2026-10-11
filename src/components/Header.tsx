import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Language } from '../types';
import { Globe, Moon, Sun, Menu, X, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  const { language, setLanguage, theme, toggleTheme, currentPage, navigateTo, t, adminToken } = useApp();
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
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-[#0B0F0E]/90 border-b border-neutral-200/80 dark:border-neutral-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => handleNavClick('home')}
          className="text-xl font-extrabold tracking-tight text-[#044541] dark:text-emerald-400 whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer"
        >
          <span>Fleearn</span>
        </button>

        {/* Zone 2: Navigation links */}
        <nav className="hidden xl:flex items-center gap-5 text-sm font-medium text-neutral-600 dark:text-neutral-300">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
                  isActive
                    ? 'text-[#044541] dark:text-emerald-400 font-semibold border-b-2 border-[#044541] dark:border-emerald-400'
                    : 'hover:text-[#044541] dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          {adminToken && (
            <button
              onClick={() => handleNavClick('admin-dashboard')}
              className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t('admin')}</span>
            </button>
          )}
        </nav>

        {/* Zone 3: 1 primary action + Language & Theme */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              aria-label="Select Language"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline uppercase">{language}</span>
            </button>

            {langDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setLangDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#141B19] rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-800 py-1 z-50 text-xs">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                        language === l.code
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#044541] dark:text-emerald-400 font-bold'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
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

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={() => handleNavClick('apps')}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-[#044541] hover:bg-[#033633] rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t('downloadApp')}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-[#0B0F0E]/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                currentPage === item.id
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#044541] dark:text-emerald-400 font-semibold'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {item.label}
            </button>
          ))}
          {adminToken && (
            <button
              onClick={() => handleNavClick('admin-dashboard')}
              className="w-full text-left px-3 py-2 rounded-md text-sm font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t('admin')}</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
