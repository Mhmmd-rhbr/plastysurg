import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUiStore } from './store/uiStore';
import { useAuthStore } from './store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, ScanFace, Box, LogOut, Globe,
  Menu, X, Activity
} from 'lucide-react';

// Lazy-loaded pages for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const PatientListPage = lazy(() => import('./pages/PatientListPage'));
const PatientProfilePage = lazy(() => import('./pages/PatientProfilePage'));
const SimulationStudioPage = lazy(() => import('./pages/SimulationStudioPage'));
const ThreeDViewerPage = lazy(() => import('./pages/ThreeDViewerPage'));

// Loading spinner for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-[#0EA5E9]/30 border-t-[#0EA5E9] rounded-full animate-spin" />
      <p className="text-slate-400 text-sm">در حال بارگذاری...</p>
    </div>
  </div>
);

// Auth guard component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// Sidebar navigation
const Sidebar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const logout = useAuthStore((s) => s.logout);
  const isRtl = i18n.language === 'fa';

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard', 'داشبورد') },
    { path: '/patients', icon: Users, label: t('nav.patients', 'بیماران') },
    { path: '/simulation-studio', icon: ScanFace, label: t('nav.simulation', 'استودیو شبیه‌سازی') },
    { path: '/3d-viewer', icon: Box, label: t('nav.viewer3d', 'نمایشگر سه‌بعدی') },
  ];

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fa' ? 'en' : 'fa';
    i18n.changeLanguage(newLang);
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 ${isRtl ? 'right-0' : 'left-0'} h-full w-72 bg-[#1E293B] border-${isRtl ? 'l' : 'r'} border-slate-700/50 z-50 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : isRtl ? 'translate-x-full' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="bg-[#0EA5E9]/20 p-2.5 rounded-xl">
              <Activity className="w-7 h-7 text-[#0EA5E9]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">FaceVision</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Medical</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => sidebarOpen && toggleSidebar()}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all min-h-[44px]
                  ${isActive
                    ? 'bg-[#0EA5E9]/15 text-[#0EA5E9] shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50 space-y-2">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 w-full transition-all min-h-[44px]"
          >
            <Globe className="w-5 h-5" />
            <span>{i18n.language === 'fa' ? 'English' : 'فارسی'}</span>
          </button>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 w-full transition-all min-h-[44px]"
          >
            <LogOut className="w-5 h-5" />
            <span>{t('nav.logout', 'خروج')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

// Main app layout with sidebar
const AppLayout = ({ children }) => {
  const { i18n } = useTranslation();
  const { toggleSidebar } = useUiStore();

  return (
    <div className="min-h-screen bg-[#0F172A] flex" dir={i18n.language === 'fa' ? 'rtl' : 'ltr'}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden h-16 bg-[#1E293B] border-b border-slate-700/50 flex items-center justify-between px-4">
          <button
            onClick={toggleSidebar}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#0EA5E9]" />
            <span className="text-white font-semibold text-sm">FaceVision</span>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppLayout><DashboardPage /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/patients" element={
          <ProtectedRoute>
            <AppLayout><PatientListPage /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/patients/:id" element={
          <ProtectedRoute>
            <AppLayout><PatientProfilePage /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/simulation-studio" element={
          <ProtectedRoute>
            <AppLayout><SimulationStudioPage /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/3d-viewer" element={
          <ProtectedRoute>
            <AppLayout><ThreeDViewerPage /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
