import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from './ErrorBoundary';
import { normalizePamphletForRender } from '../../shared/localizedText.js';
import { resolveArtworkUrl, useValidatedImageUrl } from '../lib/artworkMedia.js';

const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => Math.abs(offset) * velocity;

const THEMES = [
  { id: 'minimal', name: 'Minimal (미니멀)', bg: 'bg-[#FDFBF7]', text: 'text-slate-900', border: 'border-slate-300' },
  { id: 'classic', name: 'Classic (클래식)', bg: 'bg-[#EAE4D9]', text: 'text-[#4A3C31]', border: 'border-[#4A3C31]/30' },
  { id: 'modern', name: 'Modern (모던)', bg: 'bg-white', text: 'text-black', border: 'border-black' },
  { id: 'art_photo', name: 'Art Photo (예술 사진)', bg: 'bg-slate-900', text: 'text-slate-100', border: 'border-slate-500' },
  { id: 'dark_poster', name: 'Dark Poster (다크 포스터)', bg: 'bg-black', text: 'text-white', border: 'border-white/20' }
];

function PamphletViewerFallback({ isKr, retry }) {
  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-amber-300">menu_book</span>
        <div>
          <h3 className="text-sm font-bold text-amber-200">
            {isKr ? '팜플렛 뷰어를 다시 불러오는 중입니다.' : 'Pamphlet viewer needs a quick reset.'}
          </h3>
          <p className="mt-1 text-xs text-slate-300">
            {isKr ? '다국어 텍스트를 다시 정리한 뒤 안전하게 뷰어를 열 수 있습니다.' : 'We can reopen the viewer after re-normalizing multilingual text.'}
          </p>
        </div>
      </div>
      <button
        onClick={retry}
        className="mt-4 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-widest text-white hover:bg-white/10"
      >
        {isKr ? '다시 시도' : 'Retry'}
      </button>
    </div>
  );
}

function PamphletFlipbookContent({ pamphlet, isKr, onSave }) {
  const [[page, direction], setPage] = useState([0, 0]);
  const [showPrintView, setShowPrintView] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const currentLanguage = isKr ? 'KR' : 'EN';
  const safePamphlet = useMemo(
    () => normalizePamphletForRender(pamphlet || {}, currentLanguage),
    [currentLanguage, pamphlet],
  );
  const rawCoverArtworkUrl = resolveArtworkUrl({
    thumbnailUrl: pamphlet?.coverThumbnailUrl,
    coverImageUrl: pamphlet?.coverImageUrl,
    pamphlet,
    artwork: {
      storageKey: pamphlet?.coverImageStorageKey,
      thumbnailKey: pamphlet?.coverThumbnailStorageKey,
    },
  }, { prefer: 'original', allowFallback: false });
  const coverArtworkUrl = useValidatedImageUrl(rawCoverArtworkUrl);

  // Editable data
  const [editData, setEditData] = useState({
    theme: 'minimal',
    coverTitle: '',
    performanceDesc: '',
    choreographerName: '',
    artisticStatement: '',
    choreographerNote: '',
    musicCredits: '',
    cast: '',
    staffCredits: ''
  });

  // Sync props to state initially or when pamphlet changes
  useEffect(() => {
    if (pamphlet && !isEditing) {
      setEditData({
        theme: safePamphlet.theme || 'minimal',
        coverTitle: safePamphlet.coverTitle,
        performanceDesc: safePamphlet.performanceDesc,
        choreographerName: safePamphlet.choreographerName,
        artisticStatement: safePamphlet.artisticStatement,
        choreographerNote: safePamphlet.choreographerNote,
        musicCredits: safePamphlet.musicCredits,
        cast: safePamphlet.cast,
        staffCredits: safePamphlet.staffCredits,
      });
    }
  }, [isEditing, pamphlet, safePamphlet]);

  // Hide swipe hint automatically after 4 seconds
  useEffect(() => {
    if (showSwipeHint) {
      const timer = setTimeout(() => setShowSwipeHint(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showSwipeHint]);

  const handleSave = () => {
    setIsEditing(false);
    if (onSave) {
      // Package edits into bilingual-friendly format for the backend if needed,
      // or simply override the string values. Assuming string overrides are fine.
      onSave({
        ...pamphlet,
        theme: editData.theme,
        coverTitle: { en: editData.coverTitle, kr: editData.coverTitle },
        performanceDesc: { en: editData.performanceDesc, kr: editData.performanceDesc },
        choreographerName: editData.choreographerName,
        artisticStatement: { en: editData.artisticStatement, kr: editData.artisticStatement },
        choreographerNote: { en: editData.choreographerNote, kr: editData.choreographerNote },
        musicCredits: { en: editData.musicCredits, kr: editData.musicCredits },
        cast: { en: editData.cast, kr: editData.cast },
        staffCredits: { en: editData.staffCredits, kr: editData.staffCredits }
      });
    }
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    // Reset to current prop values
    setEditData({
      theme: safePamphlet.theme || 'minimal',
      coverTitle: safePamphlet.coverTitle,
      performanceDesc: safePamphlet.performanceDesc,
      choreographerName: safePamphlet.choreographerName,
      artisticStatement: safePamphlet.artisticStatement,
      choreographerNote: safePamphlet.choreographerNote,
      musicCredits: safePamphlet.musicCredits,
      cast: safePamphlet.cast,
      staffCredits: safePamphlet.staffCredits,
    });
  };

  const paginate = (newDirection) => {
    let next = page + newDirection;
    if (next < 0) next = 0;
    if (next >= pages.length) next = pages.length - 1;
    if (next !== page) {
      setPage([next, newDirection]);
      setShowSwipeHint(false); // Hide hint once they interact
    }
  };

  // Find active theme classes
  const activeTheme = THEMES.find((t) => t.id === editData.theme) || THEMES[0];
  const { bg, text, border } = activeTheme;

  // -- Editing View Component --
  if (isEditing) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-white/20 shadow-2xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold text-white">{isKr ? '팜플렛 맞춤 설정' : 'Customize Pamphlet'}</h3>
            <p className="text-xs text-slate-400 mt-1">{isKr ? '템플릿 테마와 정보를 실제 공연에 맞게 변경하세요.' : 'Change the theme and details for your production.'}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCancelEditing} className="px-4 py-2 text-xs font-semibold rounded-lg bg-white/10 text-slate-300 hover:bg-white/20 transition-all">
              {isKr ? '취소' : 'Cancel'}
            </button>
            <button onClick={handleSave} className="px-4 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-primary to-[#5B13EC] text-white hover:opacity-90 transition-all shadow-md">
              {isKr ? '저장 후 뷰어 보기' : 'Save & View'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Theme & Basic Info */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">{isKr ? '디자인 테마 (Theme)' : 'Design Theme'}</label>
              <div className="grid grid-cols-1 gap-2">
                {THEMES.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setEditData({ ...editData, theme: th.id })}
                    className={`text-left px-4 py-3 rounded-lg border text-sm transition-all ${editData.theme === th.id ? 'bg-[#5B13EC]/20 border-[#5B13EC] text-white ring-1 ring-[#5B13EC]' : 'bg-black/20 border-white/10 text-slate-400 hover:bg-black/40'}`}
                  >
                    {th.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">{isKr ? '작품 제목 (Title)' : 'Cover Title'}</label>
                <input type="text" value={editData.coverTitle} onChange={(e) => setEditData({ ...editData, coverTitle: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#5B13EC]" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">{isKr ? '한 줄 소개 (Subtitle)' : 'Subtitle'}</label>
                <input type="text" value={editData.performanceDesc} onChange={(e) => setEditData({ ...editData, performanceDesc: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#5B13EC]" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">{isKr ? '안무가 이름 (Choreographer)' : 'Choreographer Name'}</label>
                <input type="text" value={editData.choreographerName} placeholder={isKr ? '홍길동' : 'Jane Doe'} onChange={(e) => setEditData({ ...editData, choreographerName: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#5B13EC]" />
              </div>
            </div>
          </div>

          {/* Right Column: Long Texts */}
          <div className="lg:col-span-2 space-y-5">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">{isKr ? '예술 철학 (Artistic Statement)' : 'Artistic Statement'}</label>
                  <textarea rows={5} value={editData.artisticStatement} onChange={(e) => setEditData({ ...editData, artisticStatement: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#5B13EC] resize-none" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">{isKr ? '안무가 노트 (Choreographer Note)' : 'Choreographer Note'}</label>
                  <textarea rows={5} value={editData.choreographerNote} onChange={(e) => setEditData({ ...editData, choreographerNote: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#5B13EC] resize-none" />
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-white/5 pt-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">{isKr ? '무용수 명단 (Cast)' : 'Cast'}</label>
                  <textarea rows={4} value={editData.cast} placeholder={isKr ? '무용수 1, 무용수 2...' : 'Dancer 1, Dancer 2...'} onChange={(e) => setEditData({ ...editData, cast: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#5B13EC] resize-none" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">{isKr ? '음악 크레딧 (Music)' : 'Music Credits'}</label>
                  <textarea rows={4} value={editData.musicCredits} onChange={(e) => setEditData({ ...editData, musicCredits: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#5B13EC] resize-none" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">{isKr ? '스태프 (Staff)' : 'Staff Credits'}</label>
                  <textarea rows={4} value={editData.staffCredits} placeholder={isKr ? '조명감독, 기획 등...' : 'Lighting, Production...'} onChange={(e) => setEditData({ ...editData, staffCredits: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#5B13EC] resize-none" />
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Page Definitions ---
  const TitlePage = (
      <div className={`relative flex flex-col h-full items-center justify-center p-8 ${bg} ${text} ${activeTheme.id !== 'modern' && activeTheme.id !== 'art_photo' ? `border-l-8 ${border} shadow-inner` : ''} overflow-hidden`}>
        {rawCoverArtworkUrl && activeTheme.id === 'art_photo' ? (
             <>
                 <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${coverArtworkUrl})` }} />
                 <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
             </>
        ) : rawCoverArtworkUrl ? (
            <div className="absolute inset-0 z-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url(${coverArtworkUrl})`, filter: 'grayscale(100%) blur(2px)' }} />
        ) : null}

        <div className="relative z-10 w-full flex flex-col items-center">
            <p className={`text-[10px] md:text-xs tracking-[0.4em] uppercase mb-12 ${activeTheme.id === 'art_photo' || activeTheme.id === 'dark_poster' ? 'text-white/60' : 'text-current opacity-60'}`}>
                {editData.choreographerName ? `${editData.choreographerName} CHOREOGRAPHY` : 'A CHOREOGRAPHY DRAFT'}
            </p>
            <h1 className={`text-4xl md:text-5xl lg:text-6xl ${activeTheme.id === 'modern' ? 'font-sans font-black tracking-tighter uppercase' : 'font-light italic tracking-tight'} mb-8 text-center leading-tight`}>
              {editData.coverTitle || (isKr ? '작품 제목' : 'Project Title')}
            </h1>
            <p className={`text-center text-xs md:text-sm tracking-[0.3em] uppercase ${activeTheme.id === 'modern' ? 'font-sans font-bold text-primary' : 'font-sans border-b px-4 pb-8'} ${border} mx-auto max-w-lg w-full ${activeTheme.id === 'art_photo' || activeTheme.id === 'dark_poster' ? 'text-white/80' : ''}`}>
              {editData.performanceDesc || (isKr ? '공연 설명' : 'Performance Description')}
            </p>
        </div>
      </div>
  );

  const StatementPage = (
      <div className={`flex flex-col h-full ${bg} ${text} p-8 md:p-12 shadow-inner border-l ${border}`}>
        <h4 className={`text-[10px] md:text-xs uppercase tracking-[0.2em] mb-6 border-b ${border} pb-4 text-center md:text-left ${activeTheme.id === 'art_photo' || activeTheme.id === 'dark_poster' ? 'text-white/50' : 'text-current opacity-50'}`}>
          {isKr ? '예술 철학' : 'Artistic Statement'}
        </h4>
        <p className={`text-base md:text-lg ${activeTheme.id === 'modern' ? 'font-sans font-medium' : 'font-serif'} leading-loose text-justify flex-1 overflow-y-auto custom-scrollbar pr-2`}>
          {editData.artisticStatement || 'N/A'}
        </p>
        <div className={`mt-8 text-center font-serif italic text-sm ${activeTheme.id === 'art_photo' || activeTheme.id === 'dark_poster' ? 'text-white/30' : 'text-current opacity-30'}`}>- 1 -</div>
      </div>
  );

  const NotePage = (
      <div className={`flex flex-col h-full ${bg} ${text} p-8 md:p-12 shadow-inner border-l ${border}`}>
        <h4 className={`text-[10px] md:text-xs uppercase tracking-[0.2em] mb-6 border-b ${border} pb-4 text-center md:text-left ${activeTheme.id === 'art_photo' || activeTheme.id === 'dark_poster' ? 'text-white/50' : 'text-current opacity-50'}`}>
          {isKr ? '안무가 노트' : 'Choreographer Note'}
        </h4>
        <p className={`text-base md:text-lg ${activeTheme.id === 'modern' ? 'font-sans font-medium' : 'font-serif'} leading-loose text-justify flex-1 overflow-y-auto custom-scrollbar pr-2`}>
          {editData.choreographerNote || 'N/A'}
        </p>
        <div className={`mt-8 text-center font-serif italic text-sm ${activeTheme.id === 'art_photo' || activeTheme.id === 'dark_poster' ? 'text-white/30' : 'text-current opacity-30'}`}>- 2 -</div>
      </div>
  );

  const CreditsPage = (
      <div className={`flex flex-col h-full ${bg} ${text} p-8 md:p-12 shadow-inner border-l ${border} items-center justify-center`}>
        <div className={`w-full max-w-sm flex flex-col items-center border-t ${border} pt-12 gap-8`}>
          <span className={`text-[10px] md:text-xs uppercase tracking-[0.3em] ${activeTheme.id === 'art_photo' || activeTheme.id === 'dark_poster' ? 'text-white/50' : 'text-current opacity-50'}`}>
            {isKr ? '크레딧 (Credits)' : 'Credits'}
          </span>
          <div className="text-center w-full">
            <h5 className={`text-[9px] uppercase tracking-widest mb-2 ${activeTheme.id === 'art_photo' || activeTheme.id === 'dark_poster' ? 'text-white/40' : 'text-current opacity-40'}`}>{isKr ? '음악' : 'Music'}</h5>
            <p className={`text-sm md:text-base ${activeTheme.id === 'modern' ? 'font-sans font-medium' : 'font-serif'} leading-relaxed break-keep`}>
              {editData.musicCredits || 'N/A'}
            </p>
          </div>
          <div className="text-center w-full">
            <h5 className={`text-[9px] uppercase tracking-widest mb-2 ${activeTheme.id === 'art_photo' || activeTheme.id === 'dark_poster' ? 'text-white/40' : 'text-current opacity-40'}`}>{isKr ? '출연 / 캐스팅' : 'Cast'}</h5>
            <p className={`text-sm md:text-base ${activeTheme.id === 'modern' ? 'font-sans font-bold' : 'font-serif'} leading-relaxed break-keep`}>
              {editData.cast || 'N/A'}
            </p>
          </div>
          {editData.staffCredits && (
              <div className="text-center w-full">
                <h5 className={`text-[9px] uppercase tracking-widest mb-2 ${activeTheme.id === 'art_photo' || activeTheme.id === 'dark_poster' ? 'text-white/40' : 'text-current opacity-40'}`}>{isKr ? '스태프' : 'Staff'}</h5>
                <p className={`text-xs ${activeTheme.id === 'modern' ? 'font-sans' : 'font-serif'} leading-relaxed break-keep`}>
                  {editData.staffCredits}
                </p>
              </div>
          )}
        </div>
        <div className={`mt-auto pt-16 text-center font-serif italic text-sm ${activeTheme.id === 'art_photo' || activeTheme.id === 'dark_poster' ? 'text-white/30' : 'text-current opacity-30'}`}>- 3 -</div>
      </div>
  );

  const pages = [TitlePage, StatementPage, NotePage, CreditsPage];

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95,
      rotateY: direction > 0 ? 45 : -45
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95,
      rotateY: direction < 0 ? 45 : -45
    })
  };

  // --- Print View ---
  if (showPrintView) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs uppercase tracking-widest text-[#5B13EC] font-bold">
                {isKr ? '인쇄용 문서 뷰 (PDF Layout)' : 'Print PDF View'}
            </h3>
            <button 
                onClick={() => setShowPrintView(false)}
                className="text-[10px] bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-full text-slate-300 transition-colors uppercase tracking-widest"
            >
                {isKr ? '돌아가기' : 'Back to Preview'}
            </button>
        </div>
        <div className={`shadow-2xl overflow-hidden flex flex-col ${bg} ${text}`}>
            {rawCoverArtworkUrl && (
                <div className="w-full h-64 md:h-96 bg-cover bg-center relative" style={{ backgroundImage: `url(${coverArtworkUrl})` }}>
                    <div className={`absolute inset-0 bg-gradient-to-b ${activeTheme.id === 'dark_poster' ? 'from-black/60 to-black' : 'from-black/40 via-transparent to-transparent'}`}></div>
                </div>
            )}
            <div className={`p-8 md:p-12 ${rawCoverArtworkUrl ? (activeTheme.id === 'dark_poster' ? '-mt-24 relative z-10' : 'pt-0') : ''}`}>
                <p className={`text-[10px] text-center mb-4 tracking-[0.4em] uppercase ${activeTheme.id === 'art_photo' || activeTheme.id === 'dark_poster' ? 'text-white/60' : 'opacity-60'}`}>{editData.choreographerName ? `${editData.choreographerName} CHOREOGRAPHY` : ''}</p>
                <h1 className={`text-3xl md:text-4xl ${activeTheme.id === 'modern' ? 'font-sans font-black uppercase' : 'font-light italic'} mb-8 mt-4 text-center relative z-10`}>{editData.coverTitle}</h1>
                <p className={`text-center text-xs tracking-widest uppercase ${activeTheme.id === 'modern' ? 'font-sans font-bold text-primary' : 'font-sans mb-12 border-b pb-8'} ${border} mx-auto max-w-lg relative z-10 block`}>{editData.performanceDesc}</p>
            
            <div className={`max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 ${activeTheme.id === 'modern' ? 'font-sans' : 'font-serif'}`}>
                <div>
                    <h4 className={`text-[10px] uppercase tracking-widest mb-4 border-b ${border} pb-2 ${activeTheme.id === 'art_photo' || activeTheme.id === 'dark_poster' ? 'text-white/50' : 'opacity-60'}`}>{isKr ? '예술 철학 (Artistic Statement)' : 'Artistic Statement'}</h4>
                    <p className={`text-sm ${activeTheme.id === 'modern' ? 'font-medium' : ''} leading-relaxed text-justify break-keep`}>{editData.artisticStatement}</p>
                </div>
                <div>
                    <h4 className={`text-[10px] uppercase tracking-widest mb-4 border-b ${border} pb-2 ${activeTheme.id === 'art_photo' || activeTheme.id === 'dark_poster' ? 'text-white/50' : 'opacity-60'}`}>{isKr ? '안무가 노트 (Choreographer Note)' : 'Choreographer Note'}</h4>
                    <p className={`text-sm ${activeTheme.id === 'modern' ? 'font-medium' : ''} leading-relaxed text-justify break-keep`}>{editData.choreographerNote}</p>
                </div>
                <div className={`md:col-span-2 flex flex-col items-center mt-8 border-t ${border} pt-8 gap-4`}>
                    <span className={`text-[10px] uppercase tracking-widest ${activeTheme.id === 'art_photo' || activeTheme.id === 'dark_poster' ? 'text-white/50' : 'opacity-60'}`}>{isKr ? '크레딧 (Credits)' : 'Credits'}</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-4 text-center">
                       <div>
                         <p className="text-[9px] tracking-wider uppercase opacity-50 mb-1">{isKr ? '음악' : 'Music'}</p>
                         <p className="text-xs">{editData.musicCredits}</p>
                       </div>
                       <div>
                         <p className="text-[9px] tracking-wider uppercase opacity-50 mb-1">{isKr ? '출연 / 캐스팅' : 'Cast'}</p>
                         <p className="text-xs font-bold">{editData.cast}</p>
                       </div>
                       {editData.staffCredits && (
                       <div>
                         <p className="text-[9px] tracking-wider uppercase opacity-50 mb-1">{isKr ? '스태프' : 'Staff'}</p>
                         <p className="text-xs">{editData.staffCredits}</p>
                       </div>
                       )}
                    </div>
                </div>
            </div>
            </div>
        </div>
      </div>
    );
  }

  // --- Normal Flipbook View ---
  return (
    <div className="flex flex-col gap-4">
      {/* Top Controls */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <p className="text-xs text-slate-400">
           {isKr ? '오른쪽/왼쪽으로 스와이프하거나 버튼을 눌러 넘겨보세요.' : 'Swipe left/right or use buttons to flip.'}
        </p>
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 text-[10px] bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 px-3 py-1.5 rounded-full transition-colors uppercase tracking-widest font-bold shadow-sm"
            >
                <span className="material-symbols-outlined text-[14px]">edit_document</span>
                {isKr ? '팜플렛 맞춤 설정' : 'Edit Pamphlet'}
            </button>
            <button 
                onClick={() => setShowPrintView(true)}
                className="flex items-center gap-1.5 text-[10px] bg-[#5B13EC]/20 hover:bg-[#5B13EC]/30 border border-[#5B13EC]/50 text-[#5B13EC] px-3 py-1.5 rounded-full transition-colors uppercase tracking-widest font-bold shadow-sm"
            >
                <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span>
                {isKr ? '인쇄용 PDF 보기' : 'Print PDF View'}
            </button>
        </div>
      </div>

      <div className="relative w-full overflow-hidden bg-black/40 rounded-xl border border-white/10 before:absolute before:-inset-4 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none before:z-10 shadow-2xl" style={{ perspective: 2000 }}>
        {/* Navigation Buttons (Desktop) */}
        <div className="absolute inset-y-0 left-0 w-16 z-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity hidden md:flex">
            <button 
                onClick={() => paginate(-1)} 
                disabled={page === 0}
                className="w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white backdrop-blur disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/70 transition-all shadow-lg"
            >
                <span className="material-symbols-outlined ml-1">arrow_back_ios</span>
            </button>
        </div>
        
        <div className="absolute inset-y-0 right-0 w-16 z-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity hidden md:flex">
            <button 
                onClick={() => paginate(1)} 
                disabled={page === pages.length - 1}
                className="w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white backdrop-blur disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/70 transition-all shadow-lg"
            >
                <span className="material-symbols-outlined">arrow_forward_ios</span>
            </button>
        </div>

        {/* Swipe Hint (Mobile) - Moved to bottom center and auto-fades */}
        <AnimatePresence>
            {showSwipeHint && (
               <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0 }}
                   className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 md:hidden bg-black/70 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-[10px] text-white uppercase tracking-widest flex items-center gap-2 pointer-events-none shadow-xl"
               >
                   <span className="material-symbols-outlined text-[14px] animate-pulse">swipe</span>
                   {isKr ? '화면을 밀어서 넘기기' : 'Swipe to flip'}
               </motion.div>
            )}
        </AnimatePresence>

        <div className="relative w-full aspect-[3/4] md:aspect-[16/10] overflow-hidden bg-[#2a2a2a]">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={page}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 200, damping: 25 },
                opacity: { duration: 0.3 },
                rotateY: { type: "spring", stiffness: 100, damping: 20 }
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
              style={{ transformStyle: 'preserve-3d' }}
              className={`absolute inset-0 w-full h-full shadow-[0_0_40px_rgba(0,0,0,0.5)] ${bg} outline outline-1 outline-black/20`}
            >
              {/* Paper texture overlay (only if not dark themes) */}
              {(activeTheme.id !== 'art_photo' && activeTheme.id !== 'dark_poster') && (
                  <div 
                      className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply z-20" 
                      style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                      }}
                  />
              )}
              
              {/* Spine shading (left side to simulate book center) */}
              <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/20 to-transparent pointer-events-none z-20 mix-blend-multiply" />
              
              <div className="relative z-10 w-full h-full">
                {pages[page]}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Pagination Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {pages.map((_, i) => (
                <button 
                    key={i} 
                    onClick={() => { setPage([i, i > page ? 1 : -1]); setShowSwipeHint(false); }}
                    className={`w-2 h-2 rounded-full transition-all ${i === page ? 'bg-[#5B13EC] w-4' : 'bg-white/40 hover:bg-white/80'}`} 
                    aria-label={`Page ${i + 1}`}
                />
            ))}
        </div>
      </div>
    </div>
  );
}

export default function PamphletFlipbook(props) {
  return (
    <ErrorBoundary
      fallback={({ retry }) => <PamphletViewerFallback isKr={props.isKr} retry={retry} />}
    >
      <PamphletFlipbookContent {...props} />
    </ErrorBoundary>
  );
}
