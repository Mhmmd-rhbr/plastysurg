import React, { useState, useRef, useEffect } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus, Camera, Upload, ScanFace, Ruler, Stethoscope,
  SlidersHorizontal, Wand2, GitCompareArrows, Box, CheckCircle2,
  FileText, ChevronRight, ChevronLeft, Plus, ImagePlus
} from 'lucide-react';

const STEPS = [
  { id: 1, key: 'step1', icon: UserPlus },
  { id: 2, key: 'step2', icon: Camera },
  { id: 3, key: 'step3', icon: ScanFace },
  { id: 4, key: 'step4', icon: Ruler },
  { id: 5, key: 'step5', icon: Stethoscope },
  { id: 6, key: 'step6', icon: SlidersHorizontal },
  { id: 7, key: 'step7', icon: Wand2 },
  { id: 8, key: 'step8', icon: GitCompareArrows },
  { id: 9, key: 'step9', icon: Box },
  { id: 10, key: 'step10', icon: CheckCircle2 },
  { id: 11, key: 'step11', icon: FileText },
];

const LiveCameraView = ({ onCapture, onCancel, t, isRtl }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    let activeStream = null;
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(s => {
        activeStream = s;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch(err => console.error("Camera access denied:", err));

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    onCapture('live_capture_photo');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full">
       <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">{t('studio.liveCapture')}</h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">
          {isRtl ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
        </button>
      </div>
      <div className="aspect-[4/3] bg-slate-900 rounded-2xl flex items-center justify-center relative overflow-hidden border-2 border-slate-700 shadow-2xl">
        <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
        {!stream && <Camera className="w-16 h-16 text-slate-600 z-10" />}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-56 h-72 border-2 border-dashed border-[#0EA5E9] rounded-[40%] animate-pulse"></div>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <div className={`w-3 h-3 rounded-full ${stream ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}></div>
        </div>
      </div>
      <div className="flex justify-center mt-6">
        <button onClick={takePhoto} disabled={!stream} className="btn-primary rounded-full px-10 py-4 shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_40px_rgba(14,165,233,0.5)] transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
          <Camera className="w-6 h-6" />
          <span className="text-lg">ثبت تصویر و ادامه</span>
        </button>
      </div>
    </div>
  );
};

const UploadPhotoView = ({ onUpload, onCancel, t, isRtl }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onUpload('uploaded_photo');
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto w-full">
       <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">{t('studio.uploadPhotos')}</h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">
          {isRtl ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
        </button>
      </div>
      <input type="file" accept="image/png, image/jpeg" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      <div onClick={() => fileInputRef.current?.click()} className="glass-card p-16 text-center border-dashed border-2 border-slate-600 hover:border-emerald-400 transition-colors cursor-pointer group bg-slate-800/30">
        <Upload className="w-20 h-20 text-slate-500 group-hover:text-emerald-400 mx-auto mb-6 transition-colors" />
        <p className="text-white font-medium text-lg mb-2">تصاویر را اینجا رها کنید یا کلیک کنید</p>
        <p className="text-slate-400 mb-8">پشتیبانی از فرمت‌های JPG و PNG (حداکثر 10 مگابایت)</p>
        <button className="btn-secondary mx-auto px-8 py-3 bg-slate-700/50 hover:bg-emerald-400/20 hover:text-emerald-400 hover:border-emerald-400/50 pointer-events-none">
          انتخاب فایل‌ها
        </button>
      </div>
    </div>
  );
};

const ProcessingView = ({ onComplete, t }) => {
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('در حال بارگذاری مدل هوش مصنوعی...');

  useEffect(() => {
    let isMounted = true;
    let faceLandmarker;

    const runAnalysis = async () => {
      try {
        if (!isMounted) return;
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          runningMode: "IMAGE",
          numFaces: 1
        });
        
        if (!isMounted) return;
        setProgress(30);
        setStatusText('در حال استخراج نقاط کلیدی صورت (468 نقطه)...');

        const img = imageRef.current;
        if (!img.complete) {
          await new Promise((resolve) => {
            img.onload = resolve;
          });
        }

        await new Promise(r => setTimeout(r, 800));

        if (!isMounted) return;
        setProgress(60);
        const results = faceLandmarker.detect(img);

        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          setStatusText('در حال محاسبه زوایا و تقارن صورت...');
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          
          ctx.drawImage(img, 0, 0, img.width, img.height);
          
          ctx.fillStyle = '#0EA5E9';
          const landmarks = results.faceLandmarks[0];
          for (const landmark of landmarks) {
            const x = landmark.x * canvas.width;
            const y = landmark.y * canvas.height;
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
        
        if (!isMounted) return;
        setProgress(90);
        setStatusText('در حال آماده‌سازی گزارش نهایی...');
        
        await new Promise(r => setTimeout(r, 1500));
        
        if (!isMounted) return;
        setProgress(100);
        setTimeout(() => {
          if (isMounted) onComplete();
        }, 500);

      } catch (err) {
        console.error("Analysis Error:", err);
        setTimeout(() => {
          if (isMounted) onComplete();
        }, 2000);
      }
    };

    runAnalysis();

    return () => {
      isMounted = false;
      if (faceLandmarker) faceLandmarker.close();
    };
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6 max-w-3xl mx-auto w-full">
      <div className="relative w-64 h-80 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-slate-900">
        <img 
          ref={imageRef} 
          src="https://images.unsplash.com/photo-1544365558-35aa4afcf11f?auto=format&fit=crop&q=80&w=600&h=800" 
          alt="Face for analysis" 
          crossOrigin="anonymous"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover z-10" />
        {progress < 60 && (
          <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center z-20">
            <ScanFace className="w-16 h-16 text-[#0EA5E9] animate-pulse" />
          </div>
        )}
      </div>
      <h2 className="text-2xl font-bold text-white">{t('studio.processing')}</h2>
      <p className="text-slate-400 font-mono-data text-sm">{statusText}</p>
      <div className="w-full max-w-md h-2 bg-slate-700 rounded-full overflow-hidden mt-4">
        <motion.div 
          className="h-full bg-gradient-to-r from-[#0EA5E9] to-[#06B6D4] rounded-full" 
          initial={{ width: '0%' }} 
          animate={{ width: `${progress}%` }} 
          transition={{ duration: 0.5 }} 
        />
      </div>
    </div>
  );
};

const SimulationStudioPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.language === 'fa';
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProcedure, setSelectedProcedure] = useState('rhinoplasty');
  const [patientView, setPatientView] = useState('default');
  const [captureView, setCaptureView] = useState('default');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [acquiredImage, setAcquiredImage] = useState(null);

  const mockPatients = [
    { id: 1, name: 'سارا احمدی', nameEn: 'Sara Ahmadi', nationalId: '0012345678', date: '1403/02/15' },
    { id: 2, name: 'علی رضایی', nameEn: 'Ali Rezaei', nationalId: '0023456789', date: '1403/02/10' },
    { id: 3, name: 'مریم کریمی', nameEn: 'Maryam Karimi', nationalId: '0034567890', date: '1403/02/05' }
  ];

  const [sliders, setSliders] = useState({
    hump_reduction: 40,
    tip_rotation: 10,
    tip_projection: 0,
    alar_width: -10,
    bridge_refinement: 30,
  });

  const handleNext = () => {
    if (currentStep < 11) setCurrentStep(s => s + 1);
  };
  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(s => s - 1);
    else navigate('/dashboard');
  };

  const updateSlider = (key, val) => setSliders(s => ({ ...s, [key]: val }));

  const SliderControl = ({ id, label, min, max, unit, value }) => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="text-[#0EA5E9] font-mono-data font-medium">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={e => updateSlider(id, Number(e.target.value))}
        className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-[#0EA5E9]"
      />
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        if (patientView === 'new') {
          return (
            <div className="space-y-6 max-w-md mx-auto w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{t('dashboard.newPatient')}</h3>
                <button onClick={() => setPatientView('default')} className="text-slate-400 hover:text-white transition-colors">
                  {isRtl ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">{t('patient.firstName')}</label>
                  <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-[#0EA5E9] focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">{t('patient.lastName')}</label>
                  <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-[#0EA5E9] focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">{t('patient.nationalId')}</label>
                  <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white font-mono-data focus:border-[#0EA5E9] focus:outline-none transition-colors" />
                </div>
                <button onClick={() => { setSelectedPatient({ name: 'بیمار جدید (بدون نام)', nameEn: 'New Patient' }); handleNext(); setPatientView('default'); }} className="w-full btn-primary py-3 justify-center mt-6 shadow-lg shadow-[#0EA5E9]/20">
                  {t('common.save')} و {t('common.continue')}
                </button>
              </div>
            </div>
          );
        }
        if (patientView === 'search') {
          return (
            <div className="space-y-6 max-w-lg mx-auto w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{t('patient.searchPlaceholder')}</h3>
                <button onClick={() => setPatientView('default')} className="text-slate-400 hover:text-white transition-colors">
                  {isRtl ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
                </button>
              </div>
              <div className="relative mb-6">
                <input type="text" placeholder={t('patient.searchPlaceholder')} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 pl-12 pr-12 text-white focus:border-emerald-400 focus:outline-none transition-colors" />
                <UserPlus className={`absolute top-3.5 w-5 h-5 text-slate-400 ${isRtl ? 'right-4' : 'left-4'}`} />
              </div>
              <div className="space-y-3">
                {mockPatients.map(p => (
                  <div key={p.id} onClick={() => { setSelectedPatient(p); handleNext(); setPatientView('default'); }} className="flex justify-between items-center p-4 glass-card hover:border-emerald-400/50 cursor-pointer transition-all">
                    <div>
                      <p className="text-white font-medium text-lg">{isRtl ? p.name : p.nameEn}</p>
                      <p className="text-slate-400 text-sm font-mono-data mt-1">کد ملی: {p.nationalId}</p>
                    </div>
                    {isRtl ? <ChevronLeft className="w-5 h-5 text-slate-500" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
                  </div>
                ))}
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <UserPlus className="w-12 h-12 text-[#0EA5E9] mx-auto" />
              <h2 className="text-2xl font-bold text-white">{t('studio.selectPatient')}</h2>
              <p className="text-slate-400 max-w-md mx-auto leading-relaxed">{t('studio.selectPatientDesc')}</p>
              {selectedPatient && (
                <div className="mt-4 inline-flex items-center gap-2 bg-emerald-400/10 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium border border-emerald-400/20">
                  <CheckCircle2 className="w-4 h-4" />
                  بیمار انتخاب شده: {isRtl ? selectedPatient.name : selectedPatient.nameEn}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto mt-8">
              <button onClick={() => setPatientView('new')} className="glass-card p-8 text-center hover:border-[#0EA5E9]/50 transition-all group">
                <div className="w-16 h-16 rounded-full bg-[#0EA5E9]/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#0EA5E9]/20 transition-colors">
                  <Plus className="w-8 h-8 text-[#0EA5E9] group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{t('dashboard.newPatient')}</h3>
                <p className="text-slate-400 text-sm">ثبت اطلاعات بیمار جدید در سیستم</p>
              </button>
              <button onClick={() => setPatientView('search')} className="glass-card p-8 text-center hover:border-emerald-400/50 transition-all group">
                <div className="w-16 h-16 rounded-full bg-emerald-400/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-400/20 transition-colors">
                  <UserPlus className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{t('patient.searchPlaceholder')}</h3>
                <p className="text-slate-400 text-sm">جستجو در پرونده بیماران موجود</p>
              </button>
            </div>
          </div>
        );
      case 2:
        if (captureView === 'live') {
          return <LiveCameraView onCapture={(img) => { setAcquiredImage(img); handleNext(); setCaptureView('default'); }} onCancel={() => setCaptureView('default')} t={t} isRtl={isRtl} />;
        }
        if (captureView === 'upload') {
          return <UploadPhotoView onUpload={(img) => { setAcquiredImage(img); handleNext(); setCaptureView('default'); }} onCancel={() => setCaptureView('default')} t={t} isRtl={isRtl} />;
        }
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Camera className="w-12 h-12 text-[#0EA5E9] mx-auto" />
              <h2 className="text-2xl font-bold text-white">{t('studio.acquireImages')}</h2>
              {acquiredImage && (
                <div className="mt-4 inline-flex items-center gap-2 bg-emerald-400/10 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium border border-emerald-400/20">
                  <CheckCircle2 className="w-4 h-4" />
                  تصویر با موفقیت ثبت شد
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mt-8">
              <button onClick={() => setCaptureView('live')} className="glass-card p-8 text-center hover:border-[#0EA5E9]/50 transition-all group">
                <div className="w-16 h-16 rounded-full bg-[#0EA5E9]/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#0EA5E9]/20 transition-colors">
                  <Camera className="w-8 h-8 text-[#0EA5E9] group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{t('studio.liveCapture')}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">استفاده از دوربین دستگاه با راهنمای تراز صورت</p>
              </button>
              <button onClick={() => setCaptureView('upload')} className="glass-card p-8 text-center hover:border-emerald-400/50 transition-all group">
                <div className="w-16 h-16 rounded-full bg-emerald-400/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-400/20 transition-colors">
                  <ImagePlus className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{t('studio.uploadPhotos')}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">آپلود تصاویر از پیش ثبت شده با پروتکل استاندارد</p>
              </button>
            </div>
          </div>
        );
      case 3:
        return <ProcessingView onComplete={handleNext} t={t} />;
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Ruler className="w-12 h-12 text-[#0EA5E9] mx-auto" />
              <h2 className="text-2xl font-bold text-white">{t('studio.step4')}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[
                { label: 'زاویه نازوفرونتال', value: '122°', status: 'green' },
                { label: 'زاویه نازولابیال', value: '98°', status: 'green' },
                { label: 'نسبت طول بینی', value: '0.71', status: 'yellow' },
                { label: 'امتیاز تقارن', value: '87%', status: 'green' },
                { label: 'MRD1', value: '3.5mm', status: 'green' },
                { label: 'عرض آلار', value: '35mm', status: 'yellow' },
              ].map((m, i) => (
                <div key={i} className={`glass-card p-4 border-l-4 ${m.status === 'green' ? 'border-l-emerald-400' : 'border-l-amber-400'}`}>
                  <p className="text-slate-400 text-xs mb-1">{m.label}</p>
                  <p className="text-white font-mono-data text-lg font-bold">{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Stethoscope className="w-12 h-12 text-[#0EA5E9] mx-auto" />
              <h2 className="text-2xl font-bold text-white">{t('studio.selectProcedure')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {[
                { key: 'rhinoplasty', color: 'border-cyan-400 bg-cyan-400/10', icon: '👃' },
                { key: 'blepharoplasty', color: 'border-purple-400 bg-purple-400/10', icon: '👁️' },
                { key: 'combined', color: 'border-pink-400 bg-pink-400/10', icon: '✨' },
              ].map(p => (
                <button
                  key={p.key}
                  onClick={() => setSelectedProcedure(p.key)}
                  className={`glass-card p-6 text-center transition-all ${selectedProcedure === p.key ? p.color + ' border-2' : 'hover:border-slate-600'}`}
                >
                  <span className="text-4xl mb-3 block">{p.icon}</span>
                  <p className="text-white font-semibold">{t(`studio.${p.key}`)}</p>
                </button>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <SlidersHorizontal className="w-12 h-12 text-[#0EA5E9] mx-auto" />
              <h2 className="text-2xl font-bold text-white">{t('studio.adjustParams')}</h2>
            </div>
            <div className="max-w-lg mx-auto space-y-6">
              <SliderControl id="hump_reduction" label={t('simulation.humpReduction')} min={0} max={100} unit="%" value={sliders.hump_reduction} />
              <SliderControl id="tip_rotation" label={t('simulation.tipRotation')} min={-30} max={30} unit="°" value={sliders.tip_rotation} />
              <SliderControl id="tip_projection" label={t('simulation.tipProjection')} min={-50} max={50} unit="%" value={sliders.tip_projection} />
              <SliderControl id="alar_width" label={t('simulation.alarWidth')} min={-30} max={20} unit="%" value={sliders.alar_width} />
              <SliderControl id="bridge_refinement" label={t('simulation.bridgeRefinement')} min={0} max={100} unit="%" value={sliders.bridge_refinement} />
            </div>
          </div>
        );
      case 7:
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
              <Wand2 className="w-16 h-16 text-[#0EA5E9]" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white">{t('studio.generateSim')}</h2>
            <p className="text-slate-400">تولید تصویر شبیهسازی با هوش مصنوعی...</p>
            <div className="w-64 h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] rounded-full" initial={{ width: '5%' }} animate={{ width: '95%' }} transition={{ duration: 5, ease: 'easeInOut' }} />
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <GitCompareArrows className="w-12 h-12 text-[#0EA5E9] mx-auto" />
              <h2 className="text-2xl font-bold text-white">{t('studio.beforeAfter')}</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="glass-card p-4 text-center">
                <div className="aspect-[3/4] bg-slate-700/50 rounded-xl flex items-center justify-center mb-2">
                  <Camera className="w-12 h-12 text-slate-500" />
                </div>
                <p className="text-amber-400 font-medium text-sm">قبل از عمل</p>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="aspect-[3/4] bg-slate-700/50 rounded-xl flex items-center justify-center mb-2">
                  <Wand2 className="w-12 h-12 text-emerald-400" />
                </div>
                <p className="text-emerald-400 font-medium text-sm">بعد از عمل (شبیهسازی)</p>
              </div>
            </div>
          </div>
        );
      case 9:
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <motion.div animate={{ rotateY: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
              <Box className="w-20 h-20 text-[#0EA5E9]" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white">{t('studio.generate3D')}</h2>
            <p className="text-slate-400">تولید مدل سهبعدی از تصاویر صورت...</p>
            <button className="btn-primary">
              <Box className="w-5 h-5" />
              <span>{t('studio.generate3D')}</span>
            </button>
          </div>
        );
      case 10:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h2 className="text-2xl font-bold text-white">{t('studio.step10')}</h2>
            </div>
            <div className="flex gap-4 justify-center">
              <button className="btn-primary">
                <CheckCircle2 className="w-5 h-5" />
                <span>{t('studio.approve')}</span>
              </button>
              <button className="btn-secondary">
                <Wand2 className="w-5 h-5" />
                <span>{t('studio.regenerate')}</span>
              </button>
            </div>
          </div>
        );
      case 11:
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <FileText className="w-16 h-16 text-[#0EA5E9]" />
            <h2 className="text-2xl font-bold text-white">{t('studio.generateReport')}</h2>
            <p className="text-slate-400">تولید سند برنامهریزی جراحی با فرمت PDF</p>
            <button className="btn-primary">
              <FileText className="w-5 h-5" />
              <span>{t('studio.generateReport')}</span>
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col">
      {/* Step indicators */}
      <div className="bg-slate-900/80 border-b border-slate-800 px-4 py-3 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max mx-auto justify-center">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isDone = step.id < currentStep;
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all min-h-[36px]
                  ${isActive ? 'bg-[#0EA5E9]/20 text-[#0EA5E9]' : isDone ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{t(`studio.${step.key}`)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="glass-card p-8 min-h-[400px] flex flex-col justify-center"
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer controls */}
      <footer className="bg-slate-900/80 border-t border-slate-800 px-6 py-4 flex justify-between items-center">
        <button onClick={handlePrev} className="btn-secondary">
          {isRtl ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          <span>{currentStep === 1 ? t('common.cancel') : t('common.back')}</span>
        </button>
        <span className="text-sm text-slate-400 font-mono-data">
          {t('studio.stepProgress', { current: currentStep, total: 11 })}
        </span>
        <button onClick={handleNext} disabled={currentStep === 11} className="btn-primary">
          <span>{currentStep === 11 ? t('studio.finish') : t('common.continue')}</span>
          {isRtl ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </footer>
    </div>
  );
};

export default SimulationStudioPage;
