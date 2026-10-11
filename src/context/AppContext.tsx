import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Theme, CompanySettings } from '../types';
import { translations } from '../i18n/translations';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  t: (key: string) => string;
  currentPage: string;
  pageParams: any;
  navigateTo: (page: string, params?: any) => void;
  adminToken: string | null;
  setAdminToken: (token: string | null) => void;
  logoutAdmin: () => void;
  company: CompanySettings;
  updateCompany: (newSettings: Partial<CompanySettings>) => void;
  isGateModalOpen: boolean;
  setIsGateModalOpen: (open: boolean) => void;
}

const defaultCompany: CompanySettings = {
  name: "Fleearn",
  tagline: "Earn Your Way",
  email: "support@fleearn.com",
  website: "https://fleearn.com",
  address: "Fleearn International Hub, 71 Financial Tower, Dubai Silicon Oasis, UAE",
  phone: "+971 4 820 9100",
  socialLinks: {
    telegram: "https://t.me/fleearn_official",
    twitter: "https://x.com/fleearn_earn",
    youtube: "https://youtube.com/@fleearn_official",
    facebook: "https://facebook.com/fleearn.ecosystem",
    linkedin: "https://linkedin.com/company/fleearn",
    discord: "https://discord.gg/fleearn"
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Language initialization
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('fleearn_lang') as Language;
    return saved && ['en', 'bn', 'ru', 'ar'].includes(saved) ? saved : 'en';
  });

  // Theme initialization
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('fleearn_theme') as Theme;
    return saved && ['light', 'dark'].includes(saved) ? saved : 'dark';
  });

  // Navigation
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<any>(null);

  // Admin Auth
  const [adminToken, setAdminTokenState] = useState<string | null>(() => {
    return sessionStorage.getItem('fleearn_admin_token') || localStorage.getItem('fleearn_admin_token');
  });

  // Company Settings
  const [company, setCompany] = useState<CompanySettings>(defaultCompany);

  // Hidden Gate Modal
  const [isGateModalOpen, setIsGateModalOpen] = useState(false);

  // Update HTML classes & dir
  useEffect(() => {
    document.documentElement.lang = language;
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [language]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Fetch company settings on mount
  useEffect(() => {
    fetch('/api/company')
      .then(res => res.json())
      .then(data => {
        if (data && data.name) setCompany(data);
      })
      .catch(() => {});
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('fleearn_lang', lang);
  };

  const toggleTheme = () => {
    setThemeState(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('fleearn_theme', next);
      return next;
    });
  };

  const setAdminToken = (token: string | null) => {
    setAdminTokenState(token);
    if (token) {
      sessionStorage.setItem('fleearn_admin_token', token);
      localStorage.setItem('fleearn_admin_token', token);
    } else {
      sessionStorage.removeItem('fleearn_admin_token');
      localStorage.removeItem('fleearn_admin_token');
    }
  };

  const logoutAdmin = () => {
    if (adminToken) {
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` }
      }).catch(() => {});
    }
    setAdminToken(null);
    navigateTo('home');
  };

  const navigateTo = (page: string, params: any = null) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  const updateCompany = (newSettings: Partial<CompanySettings>) => {
    setCompany(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        toggleTheme,
        t,
        currentPage,
        pageParams,
        navigateTo,
        adminToken,
        setAdminToken,
        logoutAdmin,
        company,
        updateCompany,
        isGateModalOpen,
        setIsGateModalOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
