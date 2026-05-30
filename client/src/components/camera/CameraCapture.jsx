import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useTranslation } from 'react-i18next';
import { Camera as CameraIcon, RefreshCw, Check, X } from 'lucide-react';

const CameraCapture = ({ onCapture, onCancel }) => {
  const { t } = useTranslation();
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
  };

  const confirm = () => {
    if (imgSrc && onCapture) {
      setIsProcessing(true);
      // Simulate slight processing delay before passing up
      setTimeout(() => {
        onCapture(imgSrc);
        setIsProcessing(false);
      }, 500);
    }
  };

  const videoConstraints = {
    width: 720,
    height: 1280,
    facingMode: "user"
  };

  return (
    <div className="relative w-full max-w-md mx-auto bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
      {!imgSrc ? (
        <div className="relative w-full aspect-[3/4] bg-black">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Face Guide Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <svg className="w-full h-full opacity-50" viewBox="0 0 100 100" preserveAspectRatio="none">
              <ellipse cx="50" cy="50" rx="30" ry="40" fill="none" stroke="#0EA5E9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="50" y1="10" x2="50" y2="90" stroke="#0EA5E9" strokeWidth="0.5" strokeDasharray="2 2" />
              <line x1="20" y1="50" x2="80" y2="50" stroke="#0EA5E9" strokeWidth="0.5" strokeDasharray="2 2" />
            </svg>
          </div>
          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <button
              onClick={capture}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center p-1 border-4 border-slate-400 hover:border-[#0EA5E9] transition-colors"
            >
              <div className="w-full h-full bg-[#0EA5E9] rounded-full" />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative w-full aspect-[3/4] bg-black">
          <img src={imgSrc} alt="Captured" className="w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center gap-6">
            <button
              onClick={retake}
              disabled={isProcessing}
              className="w-12 h-12 bg-slate-800 text-white rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors disabled:opacity-50"
              title={t('camera.retake', 'Retake')}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={confirm}
              disabled={isProcessing}
              className="w-12 h-12 bg-[#0EA5E9] text-white rounded-full flex items-center justify-center hover:bg-[#0284C7] transition-colors disabled:opacity-50 relative"
              title={t('camera.confirm', 'Confirm')}
            >
              {isProcessing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-6 h-6" />}
            </button>
          </div>
        </div>
      )}
      
      {onCancel && (
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 backdrop-blur-sm z-10"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default CameraCapture;
