import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import useStore from '../store/useStore';
import useAuthStore from '../store/useAuthStore';
import useChoreographyStudioStore from '../store/useChoreographyStudioStore';
import LanguageToggle from '../components/LanguageToggle';
import SplashLoader from '../components/SplashLoader';
import { navigateToDraftProject, navigateToNewProject } from '../lib/projectNavigation';

const i18n = {
  EN: {
    continuePreview: 'Continue Project',
    lastEdited: 'Last edited',
    continueBtn: 'Continue',
    title: 'Seedbar Studio',
    desc: 'Practical choreography planning for working dancers, choreographers, and teams.',
    startBtn: 'Start New Project',
    emptyTitle: 'No recent project yet',
    emptyDesc: 'Create a new choreography project or reopen your saved work from the library.',
    quickProject: 'Create a new choreography draft',
    globalTitle: 'Global Dance Opportunities',
    globalDesc: 'Discover auditions, festivals, and workshops worldwide.',
    viewDetails: 'View Details',
    viewMore: 'View All Opportunities',
    deadline: 'Deadline',
    openLibrary: 'OPEN LIBRARY',
    noLinkAlert: 'The link is currently unavailable or expired.',
  },
  KR: {
    continuePreview: '최근 작업 이어하기',
    lastEdited: '마지막 수정',
    continueBtn: '계속 작업',
    title: 'Seedbar Studio',
    desc: '실제 무용수와 안무가가 계속 쓰게 되는 실전형 안무 기획 도구.',
    startBtn: '새 안무 프로젝트 생성',
    emptyTitle: '최근 작업한 프로젝트가 없습니다.',
    emptyDesc: '새 프로젝트를 시작하거나 보관함에서 저장된 작업을 다시 열어보세요.',
    quickProject: '새 안무 초안 만들기',
    globalTitle: '글로벌 무용 기회',
    globalDesc: '전세계 오디션, 창작 지원 및 레지던시를 탐색하세요.',
    viewDetails: '자세히 보기',
    viewMore: '진행중인 기회 전체보기',
    deadline: '지원 마감',
    openLibrary: '보관함 열기',
    noLinkAlert: '현재 링크를 불러올 수 없거나 만료된 공고입니다.',
  },
};

import { getOpportunities, getLastUpdatedTime } from '../data/opportunities';

function formatRelativeTime(dateStr, language) {
  if (!dateStr) return '';
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return language === 'KR' ? '방금 전' : 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}${language === 'KR' ? '분 전' : ' mins ago'}`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}${language === 'KR' ? '시간 전' : ' hours ago'}`;
  return `${Math.floor(seconds / 86400)}${language === 'KR' ? '일 전' : ' days ago'}`;
}

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useStore();
  const { projects, listProjects, setProjectId } = useChoreographyStudioStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const t = i18n[language] || i18n.EN;

  const [showSplash, setShowSplash] = useState(() => {
    return location.state?.fromLogin === true && isAuthenticated();
  });

  useEffect(() => {
    listProjects().catch(() => {});
  }, [listProjects]);

  const latestProject = projects?.length
    ? [...projects].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]
    : null;

  const handleLinkClick = (link) => {
    if (!link) {
      alert(t.noLinkAlert);
    } else {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden overflow-y-auto bg-background-dark font-display text-slate-100">
      {showSplash && <SplashLoader onComplete={() => setShowSplash(false)} />}
      
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(91,19,236,0.2),transparent_35%),linear-gradient(180deg,#120f1d_0%,#09070f_100%)]" />
      </div>

      <div className="relative z-20 flex items-center justify-between px-6 pb-5 pt-12">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center overflow-hidden rounded-full border border-primary/30 bg-primary/15">
            <img src="/seedbar-logo.png" alt="Seedbar logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary">Seedbar</p>
            <h1 className="text-lg font-semibold text-white">{t.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LanguageToggle />
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="size-10 overflow-hidden rounded-full border border-primary/40 shadow-[0_0_12px_rgba(91,19,236,0.2)]"
          >
            <img
              alt="Profile"
              className="h-full w-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDehU8vtmOe_kzFXeXUq5uvkK1eYjGLudVbitAP71slxbnRmQdOX8fhT7SWMilUbjVCzmIOqnpXj8GYwzwSeHoMnEZ-8Y9UC0yZYiELfyUykxnXHRxrliMxdoj3QrStc2l03ySidtUu8li1GLxEizHg0pBSwcbH-p33cZsbfuI3pq5yeaHtNwDP3s1Il39Vkex_9dKJyQIdZuqAD49QFwxoKuzcmfozfCUiG5TW0Xa-vRFRfucKXP9rUHj45cyLcR5yCc3bNLMTmA"
            />
          </button>
        </div>
      </div>

      <div className="relative z-20 flex flex-1 flex-col gap-8 px-6 pb-28">
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md">
          <p className="max-w-md text-sm leading-relaxed text-slate-300">{t.desc}</p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => navigateToNewProject(navigate)}
              className="flex w-full items-center justify-between rounded-2xl bg-primary px-5 py-4 text-left text-white shadow-[0_0_20px_rgba(91,19,236,0.35)] transition-transform active:scale-[0.98]"
            >
              <div>
                <p className="text-sm font-bold">{t.startBtn}</p>
                <p className="mt-1 text-xs text-white/75">{t.quickProject}</p>
              </div>
              <span className="material-symbols-outlined text-xl">add_circle</span>
            </button>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-wide text-white">{t.continuePreview}</h2>
            <button
              type="button"
              onClick={() => navigate('/library')}
              className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary hover:text-white transition-colors"
            >
              {t.openLibrary}
            </button>
          </div>

          {latestProject ? (
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-white/[0.04] p-4 shadow-[0_0_15px_rgba(91,19,236,0.08)] transition-all hover:bg-white/5 cursor-pointer" onClick={() => {
              setProjectId(latestProject.id);
              navigateToDraftProject(navigate, latestProject.id);
            }}>
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/70" />
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <span className="material-symbols-outlined text-xl text-primary">theater_comedy</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-bold text-white mb-1">{latestProject.title}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-primary-light">
                      {latestProject.status === 'draft_planning' ? 'Draft' : 'In Progress'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {t.lastEdited}: {formatRelativeTime(latestProject.updatedAt, language)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-2xl bg-primary/90 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-primary whitespace-nowrap"
                >
                  {t.continueBtn}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-white/5">
                <span className="material-symbols-outlined text-2xl text-slate-400">inventory_2</span>
              </div>
              <h3 className="mt-4 text-sm font-bold text-white">{t.emptyTitle}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">{t.emptyDesc}</p>
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex flex-col relative">
            <h2 className="text-sm font-bold tracking-wide text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">public</span>
                {t.globalTitle}
            </h2>
            <p className="mt-1 flex items-center justify-between text-xs text-slate-400">
                <span>{t.globalDesc}</span>
            </p>
            <div className="absolute top-0 right-0 flex max-w-[120px] text-right items-center gap-1 text-[9px] uppercase tracking-widest text-[#5B13EC]/80 border-b border-[#5B13EC]/30 pb-0.5">
                <span className="material-symbols-outlined text-[11px]">sync</span>
                {language === 'KR' ? `마지막 업데이트: ${getLastUpdatedTime()}` : `Last Updated: ${getLastUpdatedTime()}`}
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            {getOpportunities().slice(0, 2).map((opp) => (
              <div key={opp.id} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-5 transition-colors hover:bg-white/[0.08] flex flex-col h-full relative overflow-hidden group">
                {/* Accent line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-rose-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                      <span className="rounded bg-primary/20 px-2 py-1 text-[9px] uppercase tracking-widest text-primary-light font-bold">
                        {language === 'KR' ? opp.type.KR : opp.type.EN}
                      </span>
                      {opp.hasSupport && (
                          <span className="rounded bg-teal-500/20 px-2 py-1 text-[9px] uppercase tracking-widest text-teal-300 font-bold border border-teal-500/30">
                            {language === 'KR' ? '지원금/혜택' : 'FUNDED'}
                          </span>
                      )}
                  </div>
                  <div className="flex flex-col items-end">
                      <p className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded-full border border-rose-500/20 flex items-center gap-1 shadow-[0_0_10px_rgba(244,63,94,0.1)]">
                        <span className="material-symbols-outlined text-[11px]">event_busy</span>
                        D-DAY: {opp.deadline}
                      </p>
                  </div>
                </div>
                
                <h3 className="text-base font-bold text-white leading-tight mb-2 drop-shadow-md pr-12 break-keep">
                  {language === 'KR' ? opp.title.KR : opp.title.EN}
                </h3>
                
                <div className="flex flex-col gap-2 mb-4 bg-black/20 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 text-[11px] text-slate-300">
                      <span className="material-symbols-outlined text-[13px] text-slate-500 shrink-0">apartment</span>
                      <span className="font-semibold text-white truncate">{language === 'KR' ? opp.institution.KR : opp.institution.EN}</span>
                      <span className="text-slate-600 shrink-0">|</span>
                      <span className="material-symbols-outlined text-[13px] text-slate-500 shrink-0">location_on</span>
                      <span className="truncate flex-1">{language === 'KR' ? opp.location.KR : opp.location.EN}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[11px] text-slate-300">
                        <span className="material-symbols-outlined text-[13px] text-slate-500">calendar_month</span>
                        <span>{language === 'KR' ? '일정' : 'Period'}:</span>
                        <span className="font-mono text-[10px]">{opp.period}</span>
                    </div>

                    <div className="flex items-start gap-2 text-[11px] text-slate-300">
                        <span className="material-symbols-outlined text-[13px] text-indigo-400 shrink-0 mt-0.5">account_balance_wallet</span>
                        <div className="flex flex-col">
                            <span className="flex items-center gap-1 text-indigo-300 font-bold">
                                {language === 'KR' ? '예상 비용' : 'Est. Cost'}: {opp.cost.estimated}
                            </span>
                            <span className="text-[8px] text-slate-500 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[9px]">smart_toy</span>
                                {language === 'KR' ? 'AI 예상 금액이며 실제와 다를 수 있습니다.' : 'AI estimate. May vary from actual.'}
                            </span>
                        </div>
                    </div>
                </div>
                
                <p className="text-[12px] leading-relaxed text-slate-400 mb-5 flex-1 line-clamp-2 pr-2">
                  {language === 'KR' ? opp.desc.KR : opp.desc.EN}
                </p>
                
                <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleLinkClick(opp.link)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary/20 py-3 text-[11px] font-bold text-primary-light transition-colors hover:bg-primary/30 active:scale-[0.98] border border-primary/30"
                    >
                      {language === 'KR' ? '공식 안내 열기' : 'Official Page'}
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </button>
                    {opp.hasSupport && (
                        <div className="w-8 h-8 rounded-full border border-yellow-500/30 flex items-center justify-center bg-yellow-500/10 text-yellow-500" title="Funding Available">
                            <span className="material-symbols-outlined text-[16px]">stars</span>
                        </div>
                    )}
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => navigate('/opportunities')}
              className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-white/10 bg-white/5 text-white text-xs font-bold hover:bg-white/10 hover:border-white/20 transition-all shadow-md group"
            >
              {language === 'KR' ? '전세계 무용 공고 전체보기 (필터)' : 'View All Global Opportunities'}
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
