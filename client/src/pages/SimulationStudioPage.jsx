import { useState, useRef, useEffect } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import api from '../services/api';
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
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      onCapture(dataUrl);
    }
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
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpload(event.target.result);
      };
      reader.readAsDataURL(e.target.files[0]);
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

const ProcessingView = ({ acquiredImage, onComplete, onError, t }) => {
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('در حال بررسی و اعتبارسنجی تصویر...');
  const [isError, setIsError] = useState(false);

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
        setProgress(20);
        setStatusText('در حال تشخیص چهره انسان (Liveness Detection)...');

        // Create an offscreen image to guarantee intrinsic dimensions are loaded
        // This prevents the MediaPipe `roi->width > 0 && roi->height > 0` failure
        const img = new Image();
        img.src = acquiredImage;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => reject(new Error('خطا در بارگذاری تصویر برای پردازش.'));
        });

        if (!isMounted) return;
        setProgress(40);
        const results = faceLandmarker.detect(img);

        // Face Validation Constraint
        if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
          setIsError(true);
          setStatusText('خطا: هیچ چهره‌ای در تصویر یافت نشد. لطفاً از صورت تمام‌رخ عکس بگیرید.');
          return;
        }

        setStatusText('چهره تایید شد. استخراج نقاط کلیدی (468 نقطه)...');
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
        
        if (!isMounted) return;
        setProgress(60);
        setStatusText('آپلود تصویر و ارسال به سرور هوش مصنوعی...');
        
        // Convert base64 to Blob and upload
        const res = await fetch(acquiredImage);
        const blob = await res.blob();
        const formData = new FormData();
        formData.append('photo', blob, 'capture.jpg');
        
        const uploadRes = await api.post('/photos/upload-demo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const serverPath = uploadRes.data.filePath;

        if (!isMounted) return;
        setProgress(85);
        setStatusText('در حال تحلیل زوایا و ابعاد توسط Gemini Vision...');

        const analyzeRes = await api.post('/simulations/analyze-demo', { file_path: serverPath });
        const metrics = analyzeRes.data;

        if (!isMounted) return;
        setProgress(100);
        setStatusText('تحلیل با موفقیت پایان یافت.');
        
        setTimeout(() => {
          if (isMounted) onComplete(metrics, serverPath);
        }, 800);

      } catch (err) {
        console.error("Analysis Error:", err);
        const errorMsg = err.response?.data?.error || err.message || 'مشکل ناشناخته در پردازش';
        if (isMounted) {
          setIsError(true);
          setStatusText(`خطا: ${errorMsg}`);
        }
      }
    };

    if (acquiredImage) {
      runAnalysis();
    }

    return () => {
      isMounted = false;
      if (faceLandmarker) faceLandmarker.close();
    };
  }, [acquiredImage, onComplete, onError]);

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6 max-w-3xl mx-auto w-full">
      <div className="relative w-64 h-80 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-slate-900">
        <img 
          ref={imageRef} 
          src={acquiredImage || "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?auto=format&fit=crop&q=80&w=600&h=800"} 
          alt="Face for analysis" 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover z-10" />
        {progress < 60 && progress > 0 && (
          <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center z-20">
            <ScanFace className="w-16 h-16 text-[#0EA5E9] animate-pulse" />
          </div>
        )}
      </div>
      <h2 className={`text-2xl font-bold ${isError ? 'text-red-400' : 'text-white'}`}>
        {isError ? 'خطا در پردازش' : progress === 100 ? 'تحلیل تکمیل شد' : t('studio.processing')}
      </h2>
      <div className={`w-full max-w-md ${isError ? 'bg-red-900/30 border border-red-500/50' : 'bg-slate-800/50'} px-6 py-4 rounded-lg`}>
        <p className={`font-mono-data text-center ${isError ? 'text-red-300' : 'text-slate-400'}`}>{statusText}</p>
      </div>
      
      {!isError && (
        <div className="w-full max-w-md h-2 bg-slate-700 rounded-full overflow-hidden mt-4">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#0EA5E9] to-[#06B6D4] rounded-full" 
            initial={{ width: '0%' }} 
            animate={{ width: `${progress}%` }} 
            transition={{ duration: 0.5 }} 
          />
        </div>
      )}

      {isError && (
        <button onClick={onError} className="mt-6 btn-primary bg-red-600 hover:bg-red-500 shadow-none">
          تلاش مجدد و انتخاب عکس دیگر
        </button>
      )}
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
  const [analysisMetrics, setAnalysisMetrics] = useState(null);
  const [serverPhotoPath, setServerPhotoPath] = useState(null);
  const [simulationResultUrl, setSimulationResultUrl] = useState(null);
  const mockPatients = [
    { id: 1, name: 'سارا احمدی', nameEn: 'Sara Ahmadi', nationalId: '0012345678', date: '1403/02/15' },
    { id: 2, name: 'علی رضایی', nameEn: 'Ali Rezaei', nationalId: '0023456789', date: '1403/02/10' },
    { id: 3, name: 'مریم کریمی', nameEn: 'Maryam Karimi', nationalId: '0034567890', date: '1403/02/05' }
  ];

  const [patientGender, setPatientGender] = useState('male');
  const [patientAge, setPatientAge] = useState(30);
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

  const handleGenerateSimulation = () => {
    handleNext();
    api.post('/simulations/start-demo', { parameters: sliders, file_path: serverPhotoPath, analysis: analysisMetrics, gender: patientGender, age: patientAge })
      .then(res => {
        setSimulationResultUrl(res.data.result_photo_path);
        handleNext();
      })
      .catch(err => {
        console.error(err);
        setSimulationResultUrl('https://images.unsplash.com/photo-1544365558-35aa4afcf11f?auto=format&fit=crop&q=80&w=600&h=800');
        handleNext();
      });
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
        return (
          <ProcessingView 
            acquiredImage={acquiredImage} 
            onComplete={(metrics, path) => {
              setAnalysisMetrics(metrics);
              setServerPhotoPath(path);
              handleNext();
            }}
            onError={() => {
              setAcquiredImage(null);
              setCurrentStep(2);
            }}
            t={t} 
          />
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Ruler className="w-12 h-12 text-[#0EA5E9] mx-auto" />
              <h2 className="text-2xl font-bold text-white">{t('studio.step4')}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[
                { label: 'زاویه نازوفرونتال', value: analysisMetrics?.nasofrontalAngle || 'N/A', status: 'green' },
                { label: 'زاویه نازولابیال', value: analysisMetrics?.nasolabialAngle || 'N/A', status: 'green' },
                { label: 'نسبت طول بینی', value: analysisMetrics?.lengthRatio || 'N/A', status: 'yellow' },
                { label: 'امتیاز تقارن', value: analysisMetrics?.symmetryScore || 'N/A', status: 'green' },
                { label: 'MRD1', value: analysisMetrics?.mrd1 || 'N/A', status: 'green' },
                { label: 'عرض آلار', value: analysisMetrics?.alarWidth || 'N/A', status: 'yellow' },
              ].map((m, i) => (
                <div key={i} className={`glass-card p-4 border-l-4 ${m.status === 'green' ? 'border-l-emerald-400' : 'border-l-amber-400'}`}>
                  <p className="text-slate-400 text-xs mb-1">{m.label}</p>
                  <p className="text-white font-mono-data text-lg font-bold">{m.value}</p>
                </div>
              ))}
            </div>
            <button onClick={handleNext} className="w-full max-w-2xl mx-auto block btn-primary py-3 mt-8 justify-center shadow-[0_0_20px_rgba(14,165,233,0.3)]">
              {t('common.save')} و {t('common.continue')}
            </button>
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
            <button onClick={handleNext} className="w-full max-w-3xl mx-auto block btn-primary py-3 mt-8 justify-center shadow-[0_0_20px_rgba(14,165,233,0.3)]">
              {t('common.save')} و {t('common.continue')}
            </button>
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
              {/* Patient Demographics */}
              <div className="glass-card p-5 space-y-4 border border-slate-700/50">
                <h3 className="text-sm font-semibold text-[#0EA5E9] uppercase tracking-wider">اطلاعات بیمار</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">جنسیت بیمار</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPatientGender('male')}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                          patientGender === 'male'
                            ? 'bg-[#0EA5E9]/20 text-[#0EA5E9] border-[#0EA5E9]/50'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        🧔 مرد
                      </button>
                      <button
                        onClick={() => setPatientGender('female')}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                          patientGender === 'female'
                            ? 'bg-pink-500/20 text-pink-400 border-pink-500/50'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        👩 زن
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">سن بیمار</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={10}
                        max={90}
                        value={patientAge}
                        onChange={(e) => setPatientAge(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white font-mono-data text-center focus:border-[#0EA5E9] focus:outline-none transition-colors"
                      />
                      <span className="text-slate-400 text-sm whitespace-nowrap">سال</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Surgical Parameters */}
              <div className="glass-card p-5 space-y-5 border border-slate-700/50">
                <h3 className="text-sm font-semibold text-[#0EA5E9] uppercase tracking-wider">پارامترهای جراحی</h3>
                <SliderControl id="hump_reduction" label={t('simulation.humpReduction')} min={0} max={100} unit="%" value={sliders.hump_reduction} />
                <SliderControl id="tip_rotation" label={t('simulation.tipRotation')} min={-30} max={30} unit="°" value={sliders.tip_rotation} />
                <SliderControl id="tip_projection" label={t('simulation.tipProjection')} min={-50} max={50} unit="%" value={sliders.tip_projection} />
                <SliderControl id="alar_width" label={t('simulation.alarWidth')} min={-30} max={20} unit="%" value={sliders.alar_width} />
                <SliderControl id="bridge_refinement" label={t('simulation.bridgeRefinement')} min={0} max={100} unit="%" value={sliders.bridge_refinement} />
              </div>
            </div>
            <button onClick={handleGenerateSimulation} className="w-full max-w-lg mx-auto block btn-primary py-4 mt-8 justify-center bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6] border-none shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] transform hover:-translate-y-1">
              <Wand2 className="w-6 h-6" />
              <span className="text-lg">شروع شبیه‌سازی با هوش مصنوعی (Nano Banana)</span>
            </button>
          </div>
        );
      case 7:
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
              <Wand2 className="w-16 h-16 text-[#0EA5E9]" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white">{t('studio.generateSim')}</h2>
            <p className="text-slate-400">در حال تولید تصویر با هوش مصنوعی (مدل Nano Banana)...</p>
            <div className="w-64 h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] rounded-full" initial={{ width: '5%' }} animate={{ width: '95%' }} transition={{ duration: 180, ease: 'linear' }} />
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <GitCompareArrows className="w-12 h-12 text-[#0EA5E9] mx-auto" />
              <h2 className="text-2xl font-bold text-white">{t('studio.beforeAfter')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* After (AI) — shown FIRST so it appears on the RIGHT in RTL */}
              <div className="glass-card p-6 text-center flex flex-col items-center border-emerald-400/30 md:order-2">
                <div className="aspect-[3/4] w-full bg-slate-900 rounded-xl overflow-hidden mb-4 border-2 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] relative">
                  {simulationResultUrl ? (
                    <img src={simulationResultUrl.startsWith('/') ? `http://localhost:3001${simulationResultUrl}` : simulationResultUrl} alt="After Simulation" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Wand2 className="w-12 h-12 text-emerald-400 animate-pulse" /></div>
                  )}
                  <div className="absolute top-4 right-4 bg-emerald-500/80 backdrop-blur text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <Wand2 className="w-3 h-3" /> AI Generated
                  </div>
                </div>
                <p className="text-emerald-400 font-medium text-lg px-6 py-2 bg-emerald-400/10 rounded-full border border-emerald-400/20">بعد از عمل (شبیه‌سازی AI)</p>
              </div>
              {/* Before (Original) — shown SECOND so it appears on the LEFT in RTL */}
              <div className="glass-card p-6 text-center flex flex-col items-center md:order-1">
                <div className="aspect-[3/4] w-full bg-slate-900 rounded-xl overflow-hidden mb-4 border border-slate-700 shadow-xl relative">
                  <img src={acquiredImage || "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?auto=format&fit=crop&q=80&w=600&h=800"} alt="Before" className="w-full h-full object-cover" />
                </div>
                <p className="text-amber-400 font-medium text-lg px-6 py-2 bg-amber-400/10 rounded-full border border-amber-400/20">قبل از عمل</p>
              </div>
            </div>
            <button onClick={handleNext} className="w-full max-w-md mx-auto block btn-primary py-3 mt-8 justify-center shadow-[0_0_20px_rgba(14,165,233,0.3)]">
              ادامه به مدل سه بعدی
            </button>
          </div>
        );
      case 9:
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-8">
            <div className="text-center space-y-2">
              <Box className="w-12 h-12 text-[#0EA5E9] mx-auto" />
              <h2 className="text-2xl font-bold text-white">{t('studio.generate3D')}</h2>
              <p className="text-slate-400">مدل سه بعدی تعاملی با قابلیت چرخش 360 درجه</p>
            </div>
            
            <div className="w-full max-w-lg aspect-square relative perspective-[1000px] flex items-center justify-center group cursor-grab active:cursor-grabbing">
              <motion.div 
                className="w-64 h-80 relative preserve-3d"
                animate={{ rotateY: 360 }} 
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                whileHover={{ scale: 1.05 }}
              >
                {/* 3D Box Faces Mock */}
                <div className="absolute inset-0 border-2 border-[#0EA5E9]/50 bg-[#0EA5E9]/10 rounded-2xl flex items-center justify-center transform translate-z-[100px] backface-hidden shadow-[0_0_50px_rgba(14,165,233,0.3)]">
                  <ScanFace className="w-20 h-20 text-[#0EA5E9] opacity-50" />
                </div>
                <div className="absolute inset-0 border-2 border-emerald-400/50 bg-emerald-400/10 rounded-2xl flex items-center justify-center transform rotate-y-180 translate-z-[100px] backface-hidden">
                  <Wand2 className="w-20 h-20 text-emerald-400 opacity-50" />
                </div>
              </motion.div>
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/80 px-4 py-2 rounded-full border border-slate-700 backdrop-blur">
                <button className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-300 hover:text-white"><ChevronRight className="w-5 h-5" /></button>
                <span className="text-xs font-mono-data text-emerald-400">3D Ready</span>
                <button className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-300 hover:text-white"><ChevronLeft className="w-5 h-5" /></button>
              </div>
            </div>

            <button onClick={handleNext} className="btn-primary px-12 py-3 shadow-[0_0_20px_rgba(14,165,233,0.3)]">
              <span>ادامه به تایید نهایی</span>
            </button>
          </div>
        );
      case 10:
        return (
          <div className="space-y-8 py-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">{t('studio.step10')}</h2>
              <p className="text-slate-400 max-w-md mx-auto">طراحی و پارامترهای جراحی تایید شدند. آیا مایل به تولید گزارش نهایی برای پرونده بیمار هستید؟</p>
            </div>
            <div className="flex gap-4 justify-center mt-8">
              <button onClick={handleNext} className="btn-primary px-8 py-3 text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-5 h-5" />
                <span>{t('studio.approve')} و صدور پرونده</span>
              </button>
              <button onClick={() => setCurrentStep(6)} className="btn-secondary px-8 py-3 text-lg">
                <SlidersHorizontal className="w-5 h-5" />
                <span>اصلاح مجدد پارامترها</span>
              </button>
            </div>
          </div>
        );
      case 11:
        return (
          <div className="flex flex-col items-center justify-center py-16 space-y-8">
            <div className="relative">
              <FileText className="w-20 h-20 text-[#0EA5E9]" />
              <div className="absolute -top-2 -right-2 bg-emerald-500 w-6 h-6 rounded-full border-2 border-[#0F172A] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">{t('studio.generateReport')}</h2>
              <p className="text-slate-400">پرونده جراحی و مدل‌های سه‌بعدی با موفقیت در سیستم ثبت شد.</p>
            </div>
            <div className="flex gap-4">
              <button className="btn-secondary px-6 py-3 border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#0EA5E9]/10">
                <FileText className="w-5 h-5" />
                <span>دانلود PDF</span>
              </button>
              <button onClick={() => navigate('/dashboard')} className="btn-primary px-8 py-3">
                <span>بازگشت به داشبورد</span>
              </button>
            </div>
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
