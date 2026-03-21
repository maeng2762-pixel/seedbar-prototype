import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
    hint: '개발용 계정: free@seedbar.dev / seedbar1234',
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
    hint: 'Dev account: free@seedbar.dev / seedbar1234',
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

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const redirectTo = useMemo(() => location.state?.from || '/home', [location.state?.from]);
  useEffect(() => {
    if (isAuthenticated()) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'signup') {
        await signup({ email, password });
      } else {
        await login({ email, password });
      }
      navigate(redirectTo, { replace: true });
    } catch {
      // error shown from store
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark font-display antialiased">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-20%] w-[150%] h-[150%] opacity-40 dark:opacity-30 blur-[120px] bg-gradient-to-br from-primary via-background-dark to-purple-900" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[100%] h-[100%] opacity-30 dark:opacity-20 blur-[100px] bg-gradient-to-tl from-primary/50 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between px-8 py-12">
        <div className="flex flex-col items-center mt-14">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-primary/20 p-4 rounded-xl backdrop-blur-md border border-primary/30">
              <span className="material-symbols-outlined text-primary text-5xl">auto_awesome</span>
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
          <p className="text-[11px] text-slate-400">{t.hint}</p>

          <button
            disabled={authLoading}
            className="h-12 rounded-xl bg-primary text-white font-bold disabled:opacity-60"
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
    </div>
  );
}
