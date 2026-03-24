import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import useStore from '../store/useStore';
import useExploreStore from '../store/useExploreStore';
import LanguageToggle from '../components/LanguageToggle';
import { navigateToNewProject } from '../lib/projectNavigation';

const i18n = {
  EN: {
    title: 'Practice & Learn',
    subtitle: 'Practical, modular guides you can apply immediately to your choreography project.',
    search: 'Search by keyword, source, or idea...',
    openSource: 'Open Source',
    apply: 'Use in Project',
    why: 'Why it is worth studying',
    loading: 'Preparing curated learning references...',
  },
  KR: {
    title: '연습 및 학습하기',
    subtitle: '복잡한 이론 대신, 지금 당장 안무 창작과 프로덕션에 적용할 수 있는 실전 가이드를 제공합니다.',
    search: '키워드, 출처, 아이디어로 찾기...',
    openSource: '원문 보기',
    apply: '프로젝트에 적용',
    why: '왜 참고 가치가 있는지',
    loading: '학습용 큐레이션 자료를 준비하는 중입니다...',
  },
};

const sectionMeta = {
  workflowGuides: { en: 'Choreography Workflow', kr: '안무 창작 워크스토리' },
  productionTips: { en: 'Practical Production Tips', kr: '실전 프로덕션 꿀팁' },
  inspirationNotes: { en: 'Inspiration & Idea Notes', kr: '영감 & 아이디어 노트' },
};

function localized(label, language) {
  return language === 'KR' ? label.kr || label.en : label.en || label.kr;
}

// Global blacklist for broken image URLs to prevent repeated loading attempts
const failedImageUrls = new Set();

function ThumbnailImage({ src, alt, title, category }) {
  const [hasError, setHasError] = useState(() => failedImageUrls.has(src) || !src);

  const handleError = () => {
    if (src) failedImageUrls.add(src);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-[#120f1d] to-[#1a1528] flex flex-col items-center justify-center p-6 text-center border-b border-white/5 opacity-80">
        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-white/5 border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          <span className="material-symbols-outlined text-2xl text-primary/60">theater_comedy</span>
        </div>
        <p className="text-[10px] font-semibold tracking-[0.2em] text-primary-light/50 uppercase mb-1">{category}</p>
        <h4 className="text-sm font-bold text-white/60 line-clamp-2 px-4 leading-relaxed">{title}</h4>
      </div>
    );
  }

  return (
    <img
      alt={alt}
      className="absolute inset-0 h-full w-full object-cover opacity-80 transition-opacity duration-300"
      src={src}
      onError={handleError}
    />
  );
}

function ExploreSection({ title, items, language, onApply }) {
  const t = i18n[language];
  if (!items?.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="h-px w-5 bg-primary" />
        <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-white">{title}</h2>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {items.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-md">
            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
              <div className="relative min-h-[220px]">
                <ThumbnailImage src={item.image} alt={item.title} title={item.title} category={item.category} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                  <span className="rounded-full border border-white/15 bg-black/45 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/70">
                    {item.source}
                  </span>
                  <span className="rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-primary-light">
                    {item.period}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-4 p-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">{item.category}</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.description}</p>
                </div>
                <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-emerald-300">{t.why}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-200">{item.rationale}</p>
                </div>
                <div className="flex flex-wrap gap-3 pt-1">
                  <a
                    href={item.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/10"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    {t.openSource}
                  </a>
                  <button
                    type="button"
                    onClick={() => onApply(item.promptState)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_0_18px_rgba(91,19,236,0.24)] transition-colors hover:bg-primary/90"
                  >
                    <span className="material-symbols-outlined text-sm">auto_fix_high</span>
                    {t.apply}
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function Explore() {
  const { language } = useStore();
  const t = i18n[language] || i18n.EN;
  const navigate = useNavigate();
  const { sections, loading, fetchExploreData } = useExploreStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchExploreData().catch(() => {});
  }, [fetchExploreData]);

  const filteredSections = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return sections;

    return Object.fromEntries(
      Object.entries(sections || {}).map(([key, items]) => [
        key,
        (items || []).filter((item) => {
          const haystack = [item.title, item.description, item.rationale, item.source, item.category].join(' ').toLowerCase();
          return haystack.includes(query);
        }),
      ]),
    );
  }, [searchTerm, sections]);

  const handleApply = (promptState) => {
    navigateToNewProject(navigate, { mode: 'create', ...(promptState || {}) });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-dark font-display text-slate-100 pb-28">
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(91,19,236,0.18),transparent_30%),linear-gradient(180deg,#110d1b_0%,#08060c_100%)]" />

      <div className="sticky top-0 z-30 border-b border-white/5 bg-background-dark/85 px-6 pb-5 pt-12 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{t.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">{t.subtitle}</p>
          </div>
          <LanguageToggle />
        </div>
        <div className="relative mt-5">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={t.search}
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white outline-none transition-colors focus:border-primary/40"
          />
        </div>
      </div>

      <div className="relative z-20 flex flex-col gap-8 px-6 py-6">
        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-white" />
            <p className="mt-4 text-sm text-slate-300">{t.loading}</p>
          </div>
        ) : (
          Object.entries(filteredSections || {}).map(([key, items]) => (
            <ExploreSection
              key={key}
              title={localized(sectionMeta[key] || { en: key, kr: key }, language)}
              items={items}
              language={language}
              onApply={handleApply}
            />
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
