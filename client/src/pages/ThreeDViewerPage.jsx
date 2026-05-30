import React, { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Download, Save, Share2, Loader } from 'lucide-react';

// Lazy load the heavy 3D canvas component
const FaceCanvas3D = lazy(() => import('../components/medical/FaceCanvas3D'));
const SurgicalTools3D = lazy(() => import('../components/medical/SurgicalTools3D'));

const ThreeDViewerPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.dir() === 'rtl';

  return (
    <div className="h-screen w-full bg-[#0F172A] rtl:dir-rtl flex flex-col overflow-hidden text-slate-200">
      
      {/* Viewer Header */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
          >
            {isRtl ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">{t('viewer.title', '3D Surgical Preview')}</h1>
            <p className="text-xs text-slate-400">Sara Ahmadi - Rhinoplasty</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors tooltip-trigger" title={t('common.share', 'Share')}>
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors tooltip-trigger" title={t('common.export', 'Export PDF')}>
            <Download className="w-5 h-5" />
          </button>
          <button className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">{t('common.savePlan', 'Save Plan')}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Toolbar (Tools) */}
        <aside className="w-16 sm:w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-4 z-10 shrink-0">
          <Suspense fallback={<div className="w-8 h-8 rounded animate-pulse bg-slate-800" />}>
            <SurgicalTools3D />
          </Suspense>
        </aside>

        {/* 3D Canvas Area */}
        <main className="flex-1 relative bg-gradient-to-b from-slate-800 to-[#0F172A]">
          <Suspense fallback={
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Loader className="w-10 h-10 text-[#0EA5E9] animate-spin mb-4" />
              <p className="text-slate-400 font-medium">{t('viewer.loadingModel', 'Loading 3D Model...')}</p>
            </div>
          }>
            <FaceCanvas3D />
          </Suspense>

          {/* Overlays like Before/After toggle could go here */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-2 rounded-full flex items-center gap-2">
            <button className="px-4 py-1.5 rounded-full text-sm font-medium bg-[#0EA5E9] text-white">
              {t('viewer.simulated', 'Simulated')}
            </button>
            <button className="px-4 py-1.5 rounded-full text-sm font-medium text-slate-400 hover:text-white transition-colors">
              {t('viewer.original', 'Original')}
            </button>
          </div>
        </main>

        {/* Right Panel (Measurements & Details) */}
        <aside className={`w-72 bg-slate-900 border-l border-slate-800 overflow-y-auto hidden lg:block z-10 ${isRtl ? 'border-r border-l-0' : ''}`}>
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{t('viewer.measurements', 'Measurements')}</h3>
          </div>
          <div className="p-4 space-y-4">
            {/* Mock Measurements */}
            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Nasofrontal Angle</span>
                <span className="text-white font-mono">115°</span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full" style={{ width: '60%' }} />
              </div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Nasolabial Angle</span>
                <span className="text-white font-mono">95°</span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#0EA5E9] h-full" style={{ width: '45%' }} />
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default ThreeDViewerPage;
