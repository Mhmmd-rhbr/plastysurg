import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn, Activity, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRegister, setIsRegister] = useState(false);
  const login = useAuthStore((state) => state.login);
  const isRtl = i18n.language === 'fa';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const res = await api.post(endpoint, { username, password });
      login(res.data.user || { username }, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      // DEMO_MODE fallback: if server is down, do a local demo login
      if (err.code === 'ERR_NETWORK' || err.response?.status >= 500) {
        login({ username, role: 'surgeon', id: 'demo-doc-1' }, 'demo-token-xyz');
        navigate('/dashboard');
        return;
      }
      setError(err.response?.data?.error || t('auth.loginError', 'ورود ناموفق بود. لطفاً دوباره تلاش کنید.'));
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'fa' ? 'en' : 'fa');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-tr from-[#0EA5E9]/20 to-transparent blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 25, 0], x: [0, -15, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-indigo-600/15 to-transparent blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 blur-3xl"
        />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="z-10 w-full max-w-md px-6">
        {/* Language toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleLanguage}
            className="text-slate-400 hover:text-white text-sm bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 transition-all"
          >
            {i18n.language === 'fa' ? 'English' : 'فارسی'}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
          className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl shadow-2xl shadow-black/20"
        >
          {/* Logo and title */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2, bounce: 0.5 }}
              className="bg-gradient-to-br from-[#0EA5E9]/20 to-indigo-600/20 p-5 rounded-2xl mb-5 border border-[#0EA5E9]/20"
            >
              <Activity className="w-10 h-10 text-[#0EA5E9]" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {t('auth.welcome', 'فیس‌ویژن مدیکال')}
            </h1>
            <p className="text-slate-400 mt-2 text-center text-sm leading-relaxed">
              {t('auth.subtitle', 'سیستم پیش‌نمایش هوشمند جراحی زیبایی')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Username */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                {t('auth.username', 'شماره نظام پزشکی')}
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`block w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent ${isRtl ? 'pr-10 text-right' : 'pl-10 text-left'} p-3.5 transition-all outline-none placeholder:text-slate-600`}
                  placeholder={t('auth.usernamePlaceholder', 'نام کاربری یا شماره نظام پزشکی')}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                {t('auth.password', 'رمز عبور')}
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent ${isRtl ? 'pr-10 text-right' : 'pl-10 text-left'} p-3.5 transition-all outline-none placeholder:text-slate-600`}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-red-400 text-sm bg-red-400/10 p-3 rounded-xl border border-red-400/20"
              >
                {error}
              </motion.div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0369A1] text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-[#0EA5E9]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6 min-h-[48px]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>{isRegister ? t('auth.registerBtn', 'ثبت‌نام') : t('auth.loginBtn', 'ورود به سیستم')}</span>
                </>
              )}
            </button>

            {/* Toggle register/login */}
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="w-full text-center text-slate-400 hover:text-[#0EA5E9] text-sm transition-colors py-2"
            >
              {isRegister
                ? t('auth.hasAccount', 'حساب کاربری دارید؟ وارد شوید')
                : t('auth.noAccount', 'حساب کاربری ندارید؟ ثبت‌نام کنید')
              }
            </button>
          </form>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-6">
          FaceVision Medical v1.0 — {t('auth.footer', 'سیستم هوش مصنوعی تخصصی جراحی زیبایی')}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
