import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import useAuthStore from '../store/useAuthStore';

const i18n = {
  KR: {
    subtitle: '전 세계 무용가들을 위한 AI 안무 기획 툴',
    login: '로그인',
    signup: '회원가입',
    email: '이메일',
    password: '비밀번호',
    submitLogin: '로그인하기',
    submitSignup: '회원가입하기',
    terms: '이용약관',
    privacy: '개인정보처리방침',
  },
  EN: {
    subtitle: 'The AI-based choreography tool for global dancers',
    login: 'Login',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    submitLogin: 'Login',
    submitSignup: 'Create Account',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
  },
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, toggleLanguage } = useStore();
  const t = i18n[language] || i18n.EN;
  const login = useAuthStore((s) => s.login);
  const signup = useAuthStore((s) => s.signup);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.loading);
  const authError = useAuthStore((s) => s.error);

  const [showSplash, setShowSplash] = useState(() => isAuthenticated());
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const redirectTo = useMemo(() => location.state?.from || '/home', [location.state?.from]);

  useEffect(() => {
    // Navigate straight away, let Home/the router handle the splash
    if (showSplash) {
      if (redirectTo === '/home') {
          navigate(redirectTo, { replace: true, state: { fromLogin: true } });
      } else {
          navigate(redirectTo, { replace: true });
      }
    }
  }, [showSplash, navigate, redirectTo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'signup') {
        await signup({ email, password });
      } else {
        await login({ email, password });
      }
      setShowSplash(true);
    } catch {
      // Error is caught and shown by the store in the UI
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark font-display antialiased">
      <AnimatePresence mode="wait">
        {showSplash ? (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background-light dark:bg-background-dark overflow-hidden"
          >
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 0.5 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] blur-[100px] bg-primary/30 rounded-full" 
              />
            </div>

            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 20 }}
              className="relative z-10 flex flex-col items-center gap-6"
            >
              <div className="size-28 bg-primary/20 rounded-3xl overflow-hidden backdrop-blur-md border border-primary/30 flex items-center justify-center">
                 <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="login-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full flex flex-col justify-between"
          >
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <div className="absolute top-[-10%] left-[-20%] w-[150%] h-[150%] opacity-40 dark:opacity-30 blur-[120px] bg-gradient-to-br from-primary via-background-dark to-purple-900" />
              <div className="absolute bottom-[-20%] right-[-10%] w-[100%] h-[100%] opacity-30 dark:opacity-20 blur-[100px] bg-gradient-to-tl from-primary/50 to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between px-8 py-12">
              <div className="flex flex-col items-center mt-14">
                <div className="flex flex-col items-center gap-4">
                  <div className="size-20 bg-primary/20 rounded-2xl overflow-hidden backdrop-blur-md border md:border-2 border-primary/30 shadow-xl">
                    <img src="/seedbar-logo.png" alt="Seedbar logo" className="w-full h-full object-cover" />
                  </div>
                  <h1 className="text-slate-900 dark:text-slate-100 text-4xl font-extrabold tracking-tight">Seedbar</h1>
                  <p className="text-slate-600 dark:text-slate-400 text-base font-medium text-center max-w-[280px]">{t.subtitle}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-sm mx-auto">
                <div className="flex rounded-xl overflow-hidden border border-white/20 bg-white/5">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className={`flex-1 py-2 text-sm font-bold ${mode === 'login' ? 'bg-primary text-white' : 'text-slate-300'}`}
                  >
                    {t.login}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className={`flex-1 py-2 text-sm font-bold ${mode === 'signup' ? 'bg-primary text-white' : 'text-slate-300'}`}
                  >
                    {t.signup}
                  </button>
                </div>

                <input
                  type="email"
                  required
                  placeholder={t.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl px-4 bg-white/10 border border-white/20 text-slate-100 placeholder:text-slate-400 outline-none focus:border-primary"
                />
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder={t.password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl px-4 bg-white/10 border border-white/20 text-slate-100 placeholder:text-slate-400 outline-none focus:border-primary"
                />

                {authError ? <p className="text-xs text-rose-300">{authError}</p> : null}

                <button
                  disabled={authLoading}
                  className="h-12 rounded-xl bg-primary text-white font-bold disabled:opacity-60 transition-transform active:scale-95"
                >
                  {authLoading ? '...' : mode === 'signup' ? t.submitSignup : t.submitLogin}
                </button>
              </form>

              <div className="flex flex-col items-center gap-6">
                <div className="flex items-center bg-slate-200/50 dark:bg-slate-800/50 rounded-full p-1 border border-slate-300 dark:border-slate-700">
                  <button
                    onClick={() => {
                      if (language !== 'KR') toggleLanguage();
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${language === 'KR' ? 'bg-white dark:bg-primary text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                  >
                    KOR
                  </button>
                  <button
                    onClick={() => {
                      if (language !== 'EN') toggleLanguage();
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${language === 'EN' ? 'bg-white dark:bg-primary text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                  >
                    ENG
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <Link to="/policies?tab=terms" className="text-slate-500 dark:text-slate-500 text-xs font-medium hover:text-primary transition-colors cursor-pointer">{t.terms}</Link>
                  <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                  <Link to="/policies?tab=privacy" className="text-slate-500 dark:text-slate-500 text-xs font-medium hover:text-primary transition-colors cursor-pointer">{t.privacy}</Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
