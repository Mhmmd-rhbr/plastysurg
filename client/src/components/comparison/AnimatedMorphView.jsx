import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Play, Pause } from 'lucide-react';

const AnimatedMorphView = ({ beforeImage, afterImage }) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAfter, setShowAfter] = useState(false);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setShowAfter(prev => !prev);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-md aspect-[3/4] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
        <AnimatePresence initial={false}>
          {!showAfter ? (
            <motion.img
              key="before"
              src={beforeImage || '/api/placeholder/600/800'}
              alt="Before"
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          ) : (
            <motion.img
              key="after"
              src={afterImage || '/api/placeholder/600/800'}
              alt="After"
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>

        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium border border-white/10 z-10">
          {showAfter ? t('viewer.simulated', 'Simulated') : t('viewer.original', 'Original')}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowAfter(false)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!showAfter && !isPlaying ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          {t('viewer.before', 'Before')}
        </button>
        
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-12 h-12 bg-[#0EA5E9] hover:bg-[#0284C7] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#0EA5E9]/20 transition-all"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
        </button>

        <button
          onClick={() => setShowAfter(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showAfter && !isPlaying ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          {t('viewer.after', 'After')}
        </button>
      </div>
    </div>
  );
};

export default AnimatedMorphView;
