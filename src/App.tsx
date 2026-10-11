import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HiddenGateModal } from './components/HiddenGateModal';
import { HomePage } from './pages/HomePage';
import { NoticesPage } from './pages/NoticesPage';
import { MobileAppsPage } from './pages/MobileAppsPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { PricingPage } from './pages/PricingPage';
import { GalleryPage } from './pages/GalleryPage';
import { ImportantDocumentsPage } from './pages/ImportantDocumentsPage';
import { FAQPage } from './pages/FAQPage';
import { SupportPage } from './pages/SupportPage';
import { ReportPage } from './pages/ReportPage';
import { ContactPage } from './pages/ContactPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboard } from './pages/AdminDashboard';

const MainContent: React.FC = () => {
  const { currentPage } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'notices':
        return <NoticesPage />;
      case 'apps':
        return <MobileAppsPage />;
      case 'features':
        return <FeaturesPage />;
      case 'pricing':
        return <PricingPage />;
      case 'gallery':
        return <GalleryPage />;
      case 'documents':
        return <ImportantDocumentsPage />;
      case 'faq':
        return <FAQPage />;
      case 'support':
        return <SupportPage />;
      case 'report':
        return <ReportPage />;
      case 'contact':
        return <ContactPage />;
      case 'admin-login':
        return <AdminLoginPage />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F0E] text-neutral-100 font-sans selection:bg-[#044541] selection:text-white">
      <Header />
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer />
      <HiddenGateModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
