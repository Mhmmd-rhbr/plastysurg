import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const BeforeAfterSlider = ({ beforeImage, afterImage }) => {
  const { t, i18n } = useTranslation();
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const isRtl = i18n.dir() === 'rtl';

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(isRtl ? 100 - percent : percent);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', () => setIsDragging(false));
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', () => setIsDragging(false));
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', () => setIsDragging(false));
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', () => setIsDragging(false));
    };
  }, [isDragging]);

  const clipPathStyle = isRtl 
    ? `polygon(${100 - sliderPosition}% 0, 100% 0, 100% 100%, ${100 - sliderPosition}% 100%)`
    : `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`;

  const handlePosition = isRtl ? 100 - sliderPosition : sliderPosition;

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-3xl aspect-[4/3] bg-slate-900 rounded-2xl overflow-hidden select-none cursor-ew-resize group"
      onMouseDown={(e) => { setIsDragging(true); handleMove(e.clientX); }}
      onTouchStart={(e) => { setIsDragging(true); handleMove(e.touches[0].clientX); }}
    >
      {/* Before Image (Base) */}
      <img src={beforeImage || '/api/placeholder/800/600'} alt="Before" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
      <div className={`absolute top-4 ${isRtl ? 'right-4' : 'left-4'} bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium z-10 pointer-events-none`}>
        {t('viewer.before', 'Before')}
      </div>

      {/* After Image (Clipped) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ clipPath: clipPathStyle }}
      >
        <img src={afterImage || '/api/placeholder/800/600'} alt="After" className="absolute inset-0 w-full h-full object-cover" />
        <div className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} bg-[#0EA5E9]/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium z-10`}>
          {t('viewer.after', 'After')}
        </div>
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center pointer-events-none z-20"
        style={{ left: `${handlePosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-[#0EA5E9]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="rotate-180">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
