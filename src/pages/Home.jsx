import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import useStore from '../store/useStore';
import useChoreographyStudioStore from '../store/useChoreographyStudioStore';
import LanguageToggle from '../components/LanguageToggle';
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
    deadline: 'Deadline',
    openLibrary: 'OPEN LIBRARY'
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
    deadline: '지원 마감',
    openLibrary: '보관함 열기'
  },
};

const GLOBAL_OPPORTUNITIES = [
  {
    id: 1,
    institution: { EN: "NDT (Nederlands Dans Theater)", KR: "네덜란드 댄스 시어터 (NDT)" },
    location: { EN: "The Hague, Netherlands", KR: "네덜란드, 헤이그" },
    title: { EN: "2026 NDT Summer Intensive", KR: "2026 NDT 썸머 인텐시브" },
    date: "2026.07.15 - 2026.08.02",
    deadline: "2026.04.30",
    desc: { EN: "Intensive training program focusing on NDT repertoire and creative processes.", KR: "NDT 레퍼토리와 창작 과정을 중심으로 한 집중 훈련 프로그램입니다." },
    tag: { EN: "Workshop", KR: "워크숍" }
  },
  {
    id: 2,
    institution: { EN: "SIDance", KR: "서울세계무용축제 (SIDance)" },
    location: { EN: "Seoul, South Korea", KR: "대한민국, 서울" },
    title: { EN: "International Co-production Open Call", KR: "국제 공동제작 공모전 오픈콜" },
    date: "2026.09.01 - 2026.09.20",
    deadline: "2026.05.15",
    desc: { EN: "Seeking innovative contemporary dance pieces for international collaboration.", KR: "혁신적이고 독창적인 컨템포러리 무용 작품을 위한 국제 협업 공모전입니다." },
    tag: { EN: "Contest", KR: "공모전" }
  }
];

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
  const { language } = useStore();
  const { projects, listProjects, setProjectId } = useChoreographyStudioStore();
  const t = i18n[language] || i18n.EN;

  useEffect(() => {
    listProjects().catch(() => {});
  }, [listProjects]);

  const latestProject = projects?.length
    ? [...projects].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]
    : null;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden overflow-y-auto bg-background-dark font-display text-slate-100">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(91,19,236,0.2),transparent_35%),linear-gradient(180deg,#120f1d_0%,#09070f_100%)]" />
      </div>

      <div className="relative z-20 flex items-center justify-between px-6 pb-5 pt-12">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full border border-primary/30 bg-primary/15">
            <span className="material-symbols-outlined text-xl text-primary">temp_preferences_custom</span>
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
              className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary"
            >
              {t.openLibrary}
            </button>
          </div>

          {latestProject ? (
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-white/[0.04] p-4 shadow-[0_0_15px_rgba(91,19,236,0.08)]">
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
                  onClick={() => {
                    setProjectId(latestProject.id);
                    navigateToDraftProject(navigate, latestProject.id);
                  }}
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
          <div className="mb-3 flex flex-col">
            <h2 className="text-sm font-bold tracking-wide text-white">{t.globalTitle}</h2>
            <p className="mt-1 text-xs text-slate-400">{t.globalDesc}</p>
          </div>
          
          <div className="flex flex-col gap-3">
            {GLOBAL_OPPORTUNITIES.map((opp) => (
              <div key={opp.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded bg-primary/20 px-2 py-1 text-[9px] uppercase tracking-wider text-primary-light font-bold">
                    {language === 'KR' ? opp.tag.KR : opp.tag.EN}
                  </span>
                  <p className="text-[10px] font-medium text-rose-400">
                    {t.deadline}: {opp.deadline}
                  </p>
                </div>
                
                <h3 className="text-sm font-bold text-white leading-tight mb-1">
                  {language === 'KR' ? opp.title.KR : opp.title.EN}
                </h3>
                
                <div className="flex items-center gap-1.5 mb-3 text-[10px] text-slate-300">
                  <span className="material-symbols-outlined text-[12px]">location_on</span>
                  <span className="font-semibold">{language === 'KR' ? opp.institution.KR : opp.institution.EN}</span>
                  <span className="text-slate-500">•</span>
                  <span>{language === 'KR' ? opp.location.KR : opp.location.EN}</span>
                </div>
                
                <p className="text-[11px] leading-relaxed text-slate-400 mb-4 line-clamp-2">
                  {language === 'KR' ? opp.desc.KR : opp.desc.EN}
                </p>
                
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-3 text-[11px] font-bold text-white transition-colors hover:bg-white/20"
                >
                  {t.viewDetails}
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
